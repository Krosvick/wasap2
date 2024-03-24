import { axios } from "./axiosProvider";
import React, { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { AuthContext } from "./authUtils";
import { jwtDecode } from "jwt-decode";
import { UserJWT } from "../services/userService";

export type ContextJWT = {
  token: string | undefined;
  setToken: (newToken: string) => void;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State to hold the authentication token
  //get token from cookie
  const [token, setToken_] = useState<string | undefined>(Cookies.get("token"));
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Function to set the authentication token
  const setToken = (newToken: string) => {
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const payload = decodedToken as UserJWT;
      const exp = payload.exp;
      const isExpired = Date.now() >= exp * 999;
      setIsExpired(isExpired);
    }
    if (token && !isExpired) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      setToken(token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      Cookies.remove("token");
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token],
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
