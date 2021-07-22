import axios from "axios";
import {
  connect,
  disconnect,
  send,
} from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  readConversation,
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    // send("go-online", data.id);
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    connect(localStorage.getItem("messenger-token"));
    send("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    connect(localStorage.getItem("messenger-token"));
    send("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    send("logout", id)
    disconnect();
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

const initializeUnread = (conversations, user) => {
  return conversations.map((convo) => {
    const convoCopy = { ...convo };
    const unreadCount = convoCopy.messages.filter(message => (message.senderId !== user.id) && (!message.read)).length;
    convoCopy.unreadCount = unreadCount;
    return convoCopy
  })
}

export const fetchConversations = (user) => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    const updatedData = initializeUnread(data, user)
    dispatch(gotConversations(updatedData));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  send("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};

export const updateReadMessage = (body) => async (dispatch) => {
  try {
    await axios.put("/api/messages/read", {senderId: body.otherUser.id, conversationId: body.id});
    dispatch(readConversation(body.id))
  } catch (error) {
    console.log(error);
  }
};