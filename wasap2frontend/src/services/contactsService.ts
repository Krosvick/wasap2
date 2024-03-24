import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { useMutation } from "@tanstack/react-query";

type AddContact = {
  userId: string;
  friendUsername: string;
};

const addContact = async ({ userId, friendUsername }: AddContact) => {
  const addContactUrl = getApiUrl("/users/" + userId + "/friends/addfriend");
  const response = await axios.post(addContactUrl, { friendUsername });
  return response;
};

export const useAddContact = () => {
  return useMutation({
    mutationFn: (data: AddContact) => addContact(data),
  });
};
