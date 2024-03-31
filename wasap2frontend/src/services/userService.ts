import { getApiUrl } from "../config";
import { axios } from "../providers/axiosProvider";
import { useQuery } from "@tanstack/react-query";

export interface UserJWT {
  id: string;
  iat: number;
  exp: number;
}

const getUserDetails = async ({ userId }: { userId: string }) => {
  if (!userId) {
    return Error("No user id provided");
  }
  const userDetailsUrl = getApiUrl("/users/" + userId);
  const response = await axios.get(userDetailsUrl);
  return response.data;
};

export const useGetUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: () => getUserDetails({ userId }),
  });
};
