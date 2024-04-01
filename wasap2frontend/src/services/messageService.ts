import socket from "../providers/socketioProvider";
import E2EE from "@chatereum/react-e2ee";

export const emitMessage = async (data: {
  message: string;
  receiverId: string;
  conversationId: string;
}) => {
  const encryptedMessage = await E2EE.encryptPlaintext({
    public_key: import.meta.env.VITE_PUBLIC_KEY,
    plain_text: data.message,
  });
  console.log("Encrypted message: ", encryptedMessage);
  const decryptedMessage = await E2EE.decryptForPlaintext({
    private_key: import.meta.env.VITE_PRIVATE_KEY,
    encrypted_text: encryptedMessage,
  });
  console.log("Decrypted message: ", decryptedMessage);
  socket.emit("send-message", data);
};
