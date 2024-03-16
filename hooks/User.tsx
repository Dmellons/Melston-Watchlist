'use client'
import { account } from "@/lib/appwrite";
import { createContext, useContext, useEffect, useState } from "react";

export interface UserState {
    user: UserType | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
}

export type UserType = {
    id: string;
    email: string;
    name: string;
    admin?: boolean;
    status: boolean;
    image?: string;
}

const defaultState: UserState = {
    user: null,
    loading: true,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    signup: () => Promise.resolve()
}

const UserContext = createContext<UserState>(defaultState)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<null | UserType>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { $id, email, name, prefs, status } = await account.get()
                console.log(`User: ${user}`)
                setUser({
                    id: $id,
                    admin: prefs.admin ? true : false,
                    email,
                    name, 
                    status
                });
            } catch (error) {
                console.error(`Check User Error: ${error}`)
                setUser(null)
            } finally {
                setLoading(false)
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const { $id, name, prefs, status } = await account.get()
            setUser({
                id: $id,
                email,
                name,
                admin: prefs.admin ? true : false,
                status
            });
        } catch (error) {
            console.error(`Login Error: ${error}`)
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null)
        } catch (error) {
            console.error(`Logout Error: ${error}`)
        }
    }

    const signup = async (email: string, password: string, name: string) => {
        try {
            await account.create(email, password, name);
            await login(email, password)
        } catch (error) {
            console.error(`Signup Error: ${error}`)
        }
    }

    return (
        <UserContext.Provider value={{ user, loading, login, logout, signup }}>
            {children}
        </UserContext.Provider>
    )
};

export const useUser = () => useContext(UserContext)