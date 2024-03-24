import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";

type AddContact = {
  userId: string;
  friendUsername: string;
};

const addContact = async ({ userId, friendUsername }: AddContact) => {
  const addContactUrl = getApiUrl("/users/" + userId + "/friends/addfriend");
  const response = await axios.post(addContactUrl, { friendUsername });
  return response;
};

const conversationSchema = z.object({
  id: z.string(),
  participants: z.array(
    z.object({
      username: z.string(),
    }),
  ),
  messages: z.array(
    z.object({
      content: z.string(),
      sender: z.object({
        username: z.string(),
      }),
      createdAt: z.string(),
    }),
  ),
});

type Conversation = z.infer<typeof conversationSchema>;

const getConversations = async (userId: string) => {
  const contactsUrl = getApiUrl("/users/" + userId + "/conversations");
  const response = await axios.get<Conversation[]>(contactsUrl);
  return response.data;
};

export const useGetConversations = (userId: string) => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(userId),
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddContact) => addContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
