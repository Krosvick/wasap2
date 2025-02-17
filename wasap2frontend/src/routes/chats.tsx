import { useLoaderData } from "react-router-dom";
import { getConversationMessages } from "../services/contactsService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { UserJWT } from "../services/userService";
import { Conversation } from "../services/contactsService";
import { Image } from "@nextui-org/react";
import SendMessage from "../components/sendMessage";
import socket from "../providers/socketioProvider";

export async function conversationLoader({
  params,
}: {
  params: { conversationId: string };
}) {
  const conversationId = params.conversationId;
  if (!Cookies.get("token")) {
    return { conversation: null };
  }
  const decodedToken = jwtDecode(Cookies.get("token")!);
  const payload = decodedToken as UserJWT;
  const userId = payload.id;
  const conversation = await getConversationMessages(userId, conversationId);
  return { conversation };
}
export default function Chat() {
  const data = useLoaderData() as { conversation: Conversation };
  if (!data.conversation) {
    return <div>Not authorized</div>;
  }
  socket.emit("enter-conversation", data);
  return (
    <div className="bg-green-500 h-full w-full max-h-screen flex flex-col">
      <div className="flex w-full justify-between">
        <h1>
          Chat{" "}
          {data.conversation.participants.map((participant) => (
            <span>{participant.username} </span>
          ))}
        </h1>
        <Image
          src="https://raw.githubusercontent.com/cirosantilli/china-dictatorship-media/master/Xi_Jinping_The_Governance_of_China_photo.jpg"
          alt="chat"
          width={100}
          height={100}
          radius="none"
        />
      </div>
      <div className="h-full overflow-auto flex flex-col-reverse">
        <ul className="flex flex-col gap-3">
          {data.conversation.messages.map((message) => (
            <li key={message.id} className="bg-gray-400 p-10">
              <div className="flex justify-between mb-5">
                <p className="text-xl font-bold">{message.sender.username}</p>
                <p>
                  {new Date(message.createdAt).toLocaleString([], {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.content}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-shrink-0">
        <SendMessage />
      </div>
    </div>
  );
}
