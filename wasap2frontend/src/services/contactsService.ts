import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { useMutation } from "@tanstack/react-query";

const addContact = async (friendUsername: string) => {
  const addContactUrl = getApiUrl("/contacts/add");
  const response = await axios.post(addContactUrl, { friendUsername });
  return response;
};

export const useAddContact = () => {
  return useMutation({
    mutationFn: (username: string) => addContact(username),
  });
};
