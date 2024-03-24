import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { UserLogin } from "../routes/auth/login";
import { useQuery, useMutation } from "@tanstack/react-query";

const login = async (data: UserLogin) => {
  const loginUrl = getApiUrl("/auth/login");
  const response = await axios.post<{ token: string | null }>(loginUrl, data);
  return response;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: UserLogin) => login(data),
  });
};
