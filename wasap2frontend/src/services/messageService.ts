import { sendMessage } from "../components/sendMessage";
import socket from "../providers/socketioProvider";

export const emitMessage = async (data: sendMessage) => {
  socket.emit("send-message", data);
};

