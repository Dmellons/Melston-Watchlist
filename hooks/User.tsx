'use client'
import { account, database } from "@/lib/appwrite";
import { getProviderImage } from "@/lib/getProviderImage";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, OAuthProvider } from "appwrite";
import { redirect, useRouter } from "next/navigation";
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
    debug?: any;
}

export type UserPrefs = {
    providers?: number[];
    image?: string;
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

export const UserProvider = ({ children, serverUser }: { children: React.ReactNode, serverUser: any }) => {

    const [userState, setUserState] = useState<null | UserType>(null);
    const [loading, setLoading] = useState(true)

    

    useEffect((serverUser) => {
        const checkUser = async (serverUser) => {
            // console.log({serverUser})
            if (serverUser) {
                console.log({ serverUser })

                try {
                    setUserState(serverUser)


                    console.log({ userState })
                } catch (error) {
                    console.error(`Check User Error: ${error}`)
                } finally {
                    setLoading(false)
                }
        } else {

                try {
                    const { $id, email, name, prefs, status, labels, ...rest } = await account.get()
                    
                    const jwt = await account.createJWT();
                    fetch(`${process.env.NEXT_PUBLIC_URL_BASE}/api/jwt/set`, {
                        method: 'POST',
                        body: JSON.stringify(jwt),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const watchlist: Models.DocumentList<WatchlistDocument> | Models.DocumentList<Models.Document> = await database.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID).then((data) => {

                        return data
                    })

                    const userData = {
                        id: $id,
                        admin: labels?.includes('admin') ? true : false,
                        email,
                        name,
                        status,
                        labels,
                        image: prefs.image ? prefs.image : null,
                        providers: prefs.providers ? prefs.providers : [],
                        watchlist: watchlist,
                        debug: rest
                    }

                    setUserState({
                        id: $id,
                        admin: labels?.includes('admin') ? true : false,
                        email,
                        name,
                        status,
                        labels,
                        image: prefs.image ? prefs.image : null,
                        providers: prefs.providers ? prefs.providers : [],
                        watchlist: watchlist,
                        debug: rest
                    });
                    
                } catch (error) {
                    console.error(`Check User Error: ${error}`)
                    setUserState(null)
                } finally {
                    setLoading(false)
                }
            }
        };
        checkUser(serverUser);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const { $id, name, prefs, status, ...rest } = await account.get()
            setUserState({
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
                // `${process.env.NEXT_PUBLIC_URL_BASE}/watchlist`,
                `${process.env.NEXT_PUBLIC_URL_BASE}/`,
                `${process.env.NEXT_PUBLIC_URL_BASE}/failure`,
                [
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                ]
            );


            const imageUrl = await getProviderImage()            
            const test = await account.updatePrefs({ imageUrl })

            console.log(test)

            

            const { $id, name, email, prefs, status, ...debug } = await account.get()

            const jwt = await account.createJWT();

            fetch(`${process.env.next_public_url_base}/api/jwt/set`, {
                method: 'POST',
                body: JSON.stringify(jwt),
                headers: { 'Content-Type': 'application/json' }
            })

            console.log(`Login With Google debug: ${debug}`)


            console.log(`Login With Google image: ${imageUrl}`)

            setUserState({
                id: $id,
                email,
                name,
                admin: prefs.admin ? true : false,
                status,
                debug
            });
            console.log({ userState })
            
        } catch (error) {
            console.error(`Login With Google Error: ${error}`)
        }
    }


    const setUserLabels = async (labels: string[]) => {
        try {
            await account.updatePrefs({ labels })
        } catch (error) {
            console.error(`Set User Labels Error: ${error}`)
        }
    }
    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUserState(null)
            await fetch(`/api/jwt/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
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
