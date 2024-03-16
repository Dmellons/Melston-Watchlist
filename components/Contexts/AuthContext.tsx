import { createContext } from "react";
import { AppwriteUser } from "@/types/appwrite";

type AppwriteContext = {
  user: AppwriteUser | null,
  authStatus: boolean,
  login: () => {},
  logout: () => {},
}

export const AuthContext = createContext<AppwriteContext>({
  user: null,
  authStatus: false,
  login,
  logout
});