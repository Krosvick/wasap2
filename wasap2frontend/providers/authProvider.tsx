import axios from "axios";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import Cookies from "js-cookie";

type ContextJWT = {
  token: string | null;
  setToken: (newToken: string) => void;
};

const AuthContext = createContext<ContextJWT>({
  token: null,
  setToken: () => {},
});
const AuthProvider = ({ children }) => {
  // State to hold the authentication token
  //get token from cookie
  const [token, setToken_] = useState<string>(Cookies.get("token"));

  // Function to set the authentication token
  const setToken = (newToken) => {
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      Cookies.set("token", token);
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

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
