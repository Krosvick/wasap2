import { useLoaderData } from "react-router-dom";
import { Conversation } from "../services/contactsService";
import { Image } from "@nextui-org/react";
import SendMessage from "../components/sendMessage";
import socket from "../providers/socketioProvider";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Chat() {
  const data = useLoaderData() as {
    conversation: Conversation;
    userId: string;
  };

  const username = data.conversation.participants.find(
    (participant) => participant.id === data.userId,
  )?.username;

  const [messages, setMessages] = useState(data.conversation.messages);
  useEffect(() => {
    //set messages watching over conversation
    setMessages(data.conversation.messages);
  }, [data]);

  socket.on(
    "send-message",
    ({
      user,
      message,
      convId,
    }: {
      user: string;
      message: string;
      convId: string;
    }) => {
      console.log("received message", user, message, convId);
      if (convId === data.conversation.id) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Math.random().toString(),
            sender: {
              username: user,
            },
            isSent: true,
            content: message,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    },
  );

  const receiverId = data.conversation.participants.find(
    (participant) => participant.id !== data.userId,
  )?.id;

  if (!data.conversation) {
    return <div>Not authorized</div>;
  }

  const handleDataFromChild = ({
    message,
    createdAt,
  }: {
    message: string;
    createdAt: string;
  }) => {
    const newMessage = {
      id: Math.random().toString(),
      sender: {
        username: username!,
      },
      content: message,
      createdAt,
    };
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
  };
  return (
    <div className="bg-green-500 h-full w-full max-h-screen flex flex-col px-3">
      <div className="flex w-full justify-between">
        <h1>
          Chat{" "}
          {data.conversation.participants.map((participant) => (
            <span>{participant.username} </span>
          ))}
        </h1>
        <Link to="/">
          <Image
            src="https://raw.githubusercontent.com/cirosantilli/china-dictatorship-media/master/Xi_Jinping_The_Governance_of_China_photo.jpg"
            alt="chat"
            width={100}
            height={100}
            radius="none"
          />
        </Link>
      </div>
      <div className="h-full overflow-auto flex flex-col-reverse">
        <ul className="flex flex-col gap-3">
          {messages
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )
            .map((message) => (
              <li key={message.id} className="bg-gray-400 p-10">
                <div className="flex justify-between mb-5">
                  <p className="text-xl font-bold">{message.sender.username}</p>
                  <div>
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
                </div>
                {message.content}
              </li>
            ))}
        </ul>
      </div>
      <div className="flex-shrink-0 mb-3">
        <SendMessage
          conversationId={data.conversation.id}
          receiverId={receiverId!}
          onDataFromChild={handleDataFromChild}
        />
      </div>
    </div>
  );
}
