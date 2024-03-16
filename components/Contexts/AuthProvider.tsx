// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { account } from "@/lib/appwrite"; // Import your Appwrite setup
import { type AppwriteUser } from "@/types/appwrite";

// Define the type for your context state
interface AuthContextType {
  user: AppwriteUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to log in the user
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await account.createEmailPasswordSession(email, password);
      const session = await account.get()
      setUser(session); // Or fetch the user data if needed
    } catch (error) {
      console.error(error);
      throw error; // Or handle the error as needed
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out the user
  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Check session on component mount
  useEffect(() => {
    const init = async () => {
      try {
        const session = await account.getSession('current');
        console.log(session)
        setUser(session); // Or fetch the user data if needed
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Render the provider
  return (
    <>
    'use client'
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
    </>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// // 'use client'
// import { ReactNode, createContext, useContext, useState } from "react"

// import { type AppwriteUser } from "@/types/appwrite"
// import { account } from "@/lib/appwrite";

// interface AuthProviderProps {
//     children: ReactNode
// }
// type AuthContextType = {
//     user: AppwriteUser | null;
//     isLoading: boolean;
//     login: (email: string, password: string) => Promise<void>;
//     logout: () => void;
//     setUser: (user: AppwriteUser | null) => void;
// }


// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    
//     const [user, setUser] = useState<AppwriteUser | null>(null);
//     const [isLoading, setIsLoading] = useState(true);


//     const login = async (email: string, password: string) => {
//         try {
//             setIsLoading(true)
//             const result = await account.createEmailPasswordSession(email, password)
//             setUser(await account.get());
//             console.log({user})
//         } catch (error) {
//             console.error(error);
//             throw error; // Or handle the error as needed
//           } finally {
//             setIsLoading(false);
//           }
        
//     }
// }


















// export function useAuth(){
//     return useContext(AuthContext);
// }

// export function AuthProvider({ children, ...props}: AuthProviderProps){
    
//     const [user, setUser] = useState(null)
    
//     const login = async (user: AppwriteUser) => {
//         const user = await account.create(user)
//         setUser(user)
//     }
        
//     const logout = async () => {
//         await account.deleteSession('current')
//         setUser(null)
//     }
    
//     return (<AuthContext.Provider value={{ = (newUser: AppwriteUser | null) => {
//         setUser(newUser)
//     }
    
//     return (<AuthContext.Provider value={{ user, setUser }} {...props}>
//         {children}
//     </AuthContext.Provider>)
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//     const [user, setUser] = useState<AppwriteUser | null>(null)

//     return (
//         <AuthContext.Provider value={{ user, setUser }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }
