import { createContext, useContext } from "react";
import Cookies from "js-cookie";
import { ContextJWT } from "./authProvider";

export const AuthContext = createContext<ContextJWT>({
  token: Cookies.get("token") || undefined,
  userId: undefined,
  setToken: () => {},
  logout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
