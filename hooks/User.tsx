'use client'
import { account } from "@/lib/appwrite";
import { OAuthProvider } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";

export interface UserState {
    user: UserType | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>
}

export type UserType = {
    id: string;
    email: string;
    name: string;
    admin?: boolean;
    status: boolean;
    labels?: string[]
    image?: string;
    debug?: any;

}

const defaultState: UserState = {
    user: null,
    loading: true,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    signup: () => Promise.resolve(),
    loginWithGoogle: () => Promise.resolve()
}

export const useUserState = () => useContext(UserContext)


const UserContext = createContext<UserState>(defaultState)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<null | UserType>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { $id, email, name, prefs, status, labels, ...rest } = await account.get()
                // console.log(`User: ${user}`)
                setUser({
                    id: $id,
                    admin: labels?.includes('admin') ? true : false,
                    email,
                    name,
                    status,
                    labels, 
                    image: prefs.image ? prefs.image : null,
                    // debug: rest
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

    const mainSetUser = async () => {
        const { $id, email, name, prefs, status, ...rest } = await account.get()
        setUser({
            id: $id,
            admin: prefs.admin ? true : false,
            email,
            name,
            status,
            image: prefs.image ? prefs.image : null,
            // debug: rest
        })
    }
    const login = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const { $id, name, prefs, status, ...rest } = await account.get()
            setUser({
                id: $id,
                email,
                name,
                admin: prefs.admin ? true : false,
                status, 
                debug: rest
            });
        } catch (error) {
            console.error(`Login Error: ${error}`)
        }
    };

    const loginWithGoogle = async () => {
    
        try {
            await account.createOAuth2Session(
                OAuthProvider.Google,
                `${process.env.NEXT_PUBLIC_URL_BASE}/watchlist`,
                `${process.env.NEXT_PUBLIC_URL_BASE}/failure`,
                [
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                ]
            );
            
            const { $id, name, email, prefs, status , ...debug} = await account.get()

            console.log(`Login With Google debug: ${debug}`)

            setUser({
                id: $id,
                email,
                name,
                admin: prefs.admin ? true : false,
                status,  
                debug 
            });
        } catch (error) {
            console.error(`Login With Google Error: ${error}`)
        }
    }


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
        <UserContext.Provider value={{ user, loading, login, logout, signup, loginWithGoogle }}>
            {children}
        </UserContext.Provider>
    )
};

export const useUser = () => useContext(UserContext)