import { useLoaderData } from "react-router-dom";
import { getConversationMessages } from "../services/contactsService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { UserJWT } from "../services/userService";
import { Conversation } from "../services/contactsService";
import { Image } from "@nextui-org/react";

export async function conversationLoader({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
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
  const { conversation } = useLoaderData() as { conversation: Conversation };
  return (
    <div className="bg-green-500 h-screen w-full">
      <div className="flex w-full justify-between">
        <h1>Chat {conversation.id}</h1>
        <Image
          src="https://raw.githubusercontent.com/cirosantilli/china-dictatorship-media/master/Xi_Jinping_The_Governance_of_China_photo.jpg"
          alt="chat"
          width={100}
          height={100}
          radius="none"
        />
      </div>
      <ul>
        {conversation.messages.map((message) => (
          <li key={message.id} className="bg-gray-400 p-10">
            {message.content}
            <p>Sender: {message.sender.username}</p>
            <p>Time: {message.createdAt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
