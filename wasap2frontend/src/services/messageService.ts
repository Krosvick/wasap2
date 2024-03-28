import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "../components/sendMessage";

const sendMessage = async (data: sendMessage) => {
  const sendMessageUrl = getApiUrl("/messages");
  const response = await axios.post(sendMessageUrl, data);
  return response;
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: (data: sendMessage) => sendMessage(data),
  });
};
