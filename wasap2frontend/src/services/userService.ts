import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export interface UserJWT {
  id: string;
  iat: number;
  exp: number;
}

const getUserDetails = async () => {
  const decodedToken = jwtDecode(Cookies.get("token")!);
  if (!decodedToken) return;
  const payload = decodedToken as UserJWT;
  const userId = payload.id;
  const userDetailsUrl = getApiUrl("/users/" + userId);
  const response = await axios.get(userDetailsUrl);
  return response.data;
};

export const useGetUserDetails = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: getUserDetails,
  });
};
