import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { UserLogin } from "../routes/auth/login";

export const login = async (data: UserLogin) => {
  const loginUrl = getApiUrl("/auth/login");
  const response = await axios.post(loginUrl, data);
  return response;
};
