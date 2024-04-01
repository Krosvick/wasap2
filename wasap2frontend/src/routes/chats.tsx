import { useLoaderData } from "react-router-dom";
import { Conversation } from "../services/contactsService";
import { Image, ScrollShadow, Card } from "@nextui-org/react";
import SendMessage from "../components/sendMessage";
import socket from "../providers/socketioProvider";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const data = useLoaderData() as {
    conversation: Conversation;
    userId: string;
  };

  const username = data.conversation.participants.find(
    (participant) => participant.id === data.userId,
  )?.username;

  const [messages, setMessages] = useState(data.conversation.messages);
  useEffect(scrollToBottom, [messages]);
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
    <div className="bg-green-500 h-full w-full max-h-screen flex flex-col">
      <div className="flex w-full bg-slate-800 rounded-b-md justify-between text-white">
        <h1 className="text-2xl font-bold text-center p-4 h-full flex gap-3 items-center">
          Chat{" con"}
          {data.conversation.participants
            .filter((participant) => participant.username !== username)
            .map((participant) => (
              <span>{participant.username} </span>
            ))}
        </h1>
        <Link to="/" className="ml-4">
          <Image
            src="https://raw.githubusercontent.com/cirosantilli/china-dictatorship-media/master/Xi_Jinping_The_Governance_of_China_photo.jpg"
            alt="chat"
            width={100}
            height={100}
            radius="lg"
            className="p-3"
          />
        </Link>
      </div>
      <div className="h-full overflow-auto flex flex-col-reverse">
        <ScrollShadow>
          <ul className="flex flex-col">
            {messages
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              )
              .map((message) => (
                <Card
                  key={message.id}
                  className={`bg-indigo-900 w-1/2 px-10 pb-6 pt-3 m-3 text-white ${message.sender.username === username ? "ml-auto bg-slate-900" : "mr-auto"}`}
                >
                  <div className="flex justify-between mb-5">
                    <p className="text-xl font-bold">
                      {message.sender.username}
                    </p>
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
                </Card>
              ))}
          </ul>
          <div ref={messagesEndRef} />
        </ScrollShadow>
      </div>
      <div className="flex-shrink-0 mb-3 px-3">
        <SendMessage
          conversationId={data.conversation.id}
          receiverId={receiverId!}
          onDataFromChild={handleDataFromChild}
        />
      </div>
    </div>
  );
}
