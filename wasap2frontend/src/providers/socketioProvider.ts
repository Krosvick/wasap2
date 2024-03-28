import { io } from "socket.io-client";

//set withCredentials to true to send cookies with the request
const socket = io(import.meta.env.VITE_WS_URL, {
  withCredentials: true,
});

export default socket;
