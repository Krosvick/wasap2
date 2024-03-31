import React, { createContext, ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { UserJWT } from "../services/userService";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

type UserContextType = {
  token?: string | undefined;
  userId?: string | null;
  logout: () => void;
  login: (token: string) => void;
};

type Props = { children: ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export default function UserProvider({ children }: Props) {
  const [token, setToken] = useState<string | undefined>();
  const [userId, setUserId] = useState<string>();
  const [isReady, setReady] = useState<boolean>(false);

  useEffect(() => {
    const token: string | undefined = Cookies.get("token");
    if (!token) {
      return setReady(true);
    }
    const decodedToken = jwtDecode<UserJWT>(token);
    const userId = decodedToken?.id;

    if (userId && token) {
      setUserId(userId);
      setToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setReady(true);
  }, []);

  const login = (token: string): void => {
    if (token) {
      setToken(token);
      const decodedToken = jwtDecode<UserJWT>(token);
      const userId = decodedToken?.id;
      setUserId(userId);
      toast.success("Login Successful :)");
    }
  };

  const logout = (): void => {
    Cookies.remove("token");
    setUserId(undefined);
    setToken(undefined);
  };

  return (
    <UserContext.Provider value={{ userId, token, logout, login }}>
      {isReady ? children : null}
    </UserContext.Provider>
  );
}

export const useAuth = () => React.useContext(UserContext);
