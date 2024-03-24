import { useGetConversations } from "../services/contactsService";

export default function Contacts({ userId }: { userId: string }) {
  const { data } = useGetConversations(userId);
  console.log(data);
  return (
    <div>
      <ul>
        {data?.map((conversation) => (
          <li key={conversation.id}>
            {conversation.participants.map((participant) => (
              <p key={participant.username}>{participant.username}</p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
