import { axios } from "./axiosProvider";
import React, { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { AuthContext } from "./authUtils";
import { jwtDecode } from "jwt-decode";
import { UserJWT } from "../services/userService";

export type ContextJWT = {
  token: string | undefined;
  userId: string | undefined;
  setToken: (newToken: string | undefined) => void;
  logout: () => void;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State to hold the authentication token
  //get token from cookie
  const [token, setToken_] = useState<string | undefined>(Cookies.get("token"));
  const [userId, setUserId] = useState<string | undefined>();

  // Function to set the authentication token
  const setToken = (newToken: string | undefined) => {
    setToken_(newToken);
  };

  const logout = () => {
    setToken(undefined);
  };

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const payload = decodedToken as UserJWT;
      const userId = payload.id;
      setUserId(userId);
    }
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      setToken(token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setToken(undefined);
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      userId,
      setToken,
      logout,
    }),
    [token, userId],
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
