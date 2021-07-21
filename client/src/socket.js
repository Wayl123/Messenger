import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
} from "./store/conversations";

let socket;

export const connect = () => {
  socket = io("http://localhost:3000", {
    transports: ["websocket"],
    upgrade: false,
    autoConnect: false
  });

  socket.on("connect_error", () => {
    socket.io.opts.transports = ["polling"];
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

export const send = (action, data) => {
  socket.emit(action, data);
};

if (localStorage.getItem("messenger-token") !== null) {
  connect();
}