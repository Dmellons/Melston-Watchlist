'use client'
import { account, database } from "@/lib/appwrite";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, OAuthProvider } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";

export interface UserState {
    user: UserType | null;
    loading: boolean;
    setUser: (user: UserType | null) => Promise<void>;
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
    watchlist?: Models.DocumentList<WatchlistDocument>;
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

export const useUserState = () => useContext(UserContext)


const UserContext = createContext<UserState>(defaultState)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUserInternal] = useState<null | UserType>(null);
    const [loading, setLoading] = useState(true)
    // const [watchlist, setWatchlist] = useState<Models.DocumentList<WatchlistDocument> | undefined>(undefined)
    const setUser = async (user: UserType | null) => {
        await setUserInternal(user)
    }
    useEffect(() => {
        const checkUser = async () => {
            try {
                const watchlist: Models.DocumentList<WatchlistDocument> = await database.listDocuments('watchlist', 'watchlist').then((data) => {

                    return data
                })
                const { $id, email, name, prefs, status, labels, ...rest } = await account.get()
                console.log(watchlist)
                setUserInternal({
                    id: $id,
                    admin: labels?.includes('admin') ? true : false,
                    email,
                    name,
                    status,
                    labels,
                    image: prefs.image ? prefs.image : null,
                    watchlist: watchlist,
                    // debug: rest
                });
            } catch (error) {
                console.error(`Check User Error: ${error}`)
                setUserInternal(null)
            } finally {
                setLoading(false)
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const { $id, name, prefs, status, ...rest } = await account.get()
            setUserInternal({
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

            const { $id, name, email, prefs, status, ...debug } = await account.get()

            console.log(`Login With Google debug: ${debug}`)

            setUserInternal({
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
            setUserInternal(null)
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
