// client
//     .setEndpoint('https://data.davidmellons.com/v1')
//     .setProject('65e64772e9ce2110c6ee');
// client
//     .setEndpoint(process.env.APPWRITE_ENDPOINT_URL as string)
//     .setProject(process.env.APPWRITE_PROJECT_ID as string);

import { Client, Account } from 'appwrite';
import { createContext, useContext } from 'react';
import type { AppwriteUser } from '@/types/appwrite';

export const client = new Client();


const endpoint: string = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string
const projectId: string = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string
client
.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export { ID } from 'appwrite';


export function useAuth(): AppwriteUser | null {
  return useContext(AuthContext);
}

const AuthContext = createContext<AppwriteUser | null>(null);
export const AuthProvider = (user: AppwriteUser | null) => {
    return (
        <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
    );
};
