import { useGetConversations } from "../services/contactsService";
import { Link } from "react-router-dom";
import { Avatar, Chip } from "@nextui-org/react";

export default function Contacts({ userId }: { userId: string }) {
  const { data, isSuccess } = useGetConversations(userId);
  console.log(isSuccess);
  return (
    <div>
      <ul className="flex flex-col gap-3 h-full w-full">
        {data?.map((conversation) => (
          <li className="w-full" key={conversation.id}>
            {conversation.participants.map((participant) => (
              <Link to={"contact/" + conversation.id} key={participant.username}>
                <Chip
                  variant="solid"
                  radius="sm"
                  size="lg"
                  color="primary"
                  className="min-w-full py-5"
                  avatar={
                    <Avatar
                      name={participant.username}
                      size="lg"
                      getInitials={(name) => name.charAt(0)}
                    />
                  }
                >
                  {participant.username}
                </Chip>
              </Link>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
