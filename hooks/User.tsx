'use client'
import { account, database } from "@/lib/appwrite";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, OAuthProvider } from "appwrite";
import { SetStateAction, createContext, useContext, useEffect, useState, Dispatch } from "react";

export interface UserState {
    user: UserType | null;
    loading: boolean;
    setUser: Dispatch<SetStateAction<UserType | null>>
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>
}

export type UserType = {
    id?: string;
    email: string;
    name: string;
    admin?: boolean;
    status: boolean;
    labels?: string[]
    watchlist?: Models.DocumentList<WatchlistDocument> | Models.DocumentList<Models.Document>
    image?: string;
    providers?: number[]
}

export type UserPrefs = {
    providers?: number[];
    profileImage?: string;
}

const defaultState: UserState = {
    user: null,
    loading: true,
    setUser: () => Promise.resolve(),
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    signup: () => Promise.resolve(),
    loginWithGoogle: () => Promise.resolve()
}

const UserContext = createContext<UserState>(defaultState)

export const UserProvider = ({ children, serverUser }: { children: React.ReactNode, serverUser: any }) => {
    const [userState, setUserState] = useState<null | UserType>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            if (serverUser) {
                try {
                    setUserState(serverUser)
                } catch (error) {
                    console.error(`Check User Error: ${error}`)
                } finally {
                    setLoading(false)
                }
            } else {
                try {
                    const { $id, email, name, status, labels, ...rest } = await account.get()
                    const prefs = await account.getPrefs()

                    const jwt = await account.createJWT();
                    await fetch(`${process.env.NEXT_PUBLIC_URL_BASE}/api/jwt/set`, {
                        method: 'POST',
                        body: JSON.stringify(jwt),
                        headers: { 'Content-Type': 'application/json' }
                    })

                    const watchlist: Models.DocumentList<WatchlistDocument> = await database.listDocuments(
                        'watchlist', 
                        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!
                    );

                    const userData: UserType = {
                        id: $id,
                        admin: labels?.includes('admin') ? true : false,
                        email,
                        name,
                        status,
                        labels,
                        image: prefs.profileImage ? prefs.profileImage : undefined,
                        providers: prefs.providers ? prefs.providers : [],
                        watchlist: watchlist,
                    }

                    setUserState(userData);
                } catch (error) {
                    console.error(`Check User Error: ${error}`)
                    setUserState(null)
                } finally {
                    setLoading(false)
                }
            }
        };
        checkUser();
    }, [serverUser]);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            await account.createEmailPasswordSession(email, password);
            const { $id, name, status, labels, ...rest } = await account.get()
            const prefs = await account.getPrefs();
            
            const watchlist = await database.listDocuments(
                'watchlist', 
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!
            );

            setUserState({
                id: $id,
                email,
                name,
                admin: labels?.includes('admin') ? true : false,
                status,
                labels,
                image: prefs.profileImage ? prefs.profileImage : undefined,
                providers: prefs.providers ? prefs.providers : [],
                watchlist: watchlist,
            });
        } catch (error) {
            console.error(`Login Error: ${error}`)
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            await account.createOAuth2Session(
                OAuthProvider.Google,
                `${process.env.NEXT_PUBLIC_URL_BASE}/profile`,
                `${process.env.NEXT_PUBLIC_URL_BASE}/failure`,
                [
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                ]
            );
        } catch (error) {
            console.error(`Login With Google Error: ${error}`)
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        try {
            setLoading(true);
            await account.deleteSession('current');
            setUserState(null)
            await fetch(`/api/jwt/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (error) {
            console.error(`Logout Error: ${error}`)
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const signup = async (email: string, password: string, name: string) => {
        try {
            setLoading(true);
            await account.create(email, password, name);
            await login(email, password)
        } catch (error) {
            console.error(`Signup Error: ${error}`)
            throw error;
        }
    }

    return (
        <UserContext.Provider value={{
            user: userState,
            loading: loading,
            login: login,
            logout: logout,
            signup: signup,
            setUser: setUserState,
            loginWithGoogle: loginWithGoogle
        }}>
            {children}
        </UserContext.Provider>
    )
};

export const useUser = () => useContext(UserContext)