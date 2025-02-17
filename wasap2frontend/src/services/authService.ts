import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { UserLogin } from "../routes/auth/login";
import { UserRegister } from "../routes/auth/register";
import { useMutation } from "@tanstack/react-query";

const login = async (data: UserLogin) => {
  const loginUrl = getApiUrl("/auth/login");
  const response = await axios.post<{ token: string | null }>(loginUrl, data);
  return response;
};

const register = async (data: UserRegister) => {
  const registerUrl = getApiUrl("/auth/signup");
  const response = await axios.post(registerUrl, data);
  return response;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: UserLogin) => login(data),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: UserRegister) => register(data),
  });
};
