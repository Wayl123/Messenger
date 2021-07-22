import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
} from "./store/conversations";

let socket;

export const connect = (token) => {
  socket = io("http://localhost:3000", {
    autoConnect: false,
    auth: {
      token: token
    }
  });

  socket.on("connect_error", (err) => {
    console.log(err.message);
    disconnect();
  });
  
  socket.on("connect", () => {
    console.log("connected to server");
  
    socket.on("add-online-user", (id) => {
      store.dispatch(addOnlineUser(id));
    });
    socket.on("remove-offline-user", (id) => {
      store.dispatch(removeOfflineUser(id));
    });
    socket.on("new-message", (data) => {
      store.dispatch(setNewMessage(data.message, data.sender));
    });
  });

  socket.open();
};

export const disconnect = () => {
  console.log("disconnected from server");

  socket.disconnect();
};

// this is here because doesn't seem like I can export the socket
export const send = (action, data) => {
  socket.emit(action, data);
};