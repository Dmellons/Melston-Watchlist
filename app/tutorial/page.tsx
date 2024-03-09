'use client'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { account, ID } from "@/lib/appwrite"
import { OAuthProvider } from "appwrite"
import { Skeleton } from "@/components/ui/skeleton"

export default function Tutorial() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState<any>(null)
    const [loadingUser, setLoadingUser] = useState(false)

    console.log({ user })
    console.log({ loadingUser })
    useEffect(() => {
        async function getUser() {

            setUser(await account.get())
            setLoadingUser(false)
        }
        getUser()
    }, [])

    async function handleLogin() {
        console.log(`in handle login`)
        try {
            setLoadingUser(true)
            await account.createEmailPasswordSession(email, password)

            setUser(await account.get())
            setLoadingUser(false)
            setEmail('')
            setPassword('')
        } catch (e) {
            console.error(e)
        }
    }
    async function handleRegister() {
        try {
            await account.create(ID.unique(), email, password)
            await handleLogin()
        } catch (e) {
            console.error(e)
        }
    }

    async function handleLogout() {
        try {
            await account.deleteSession('current')
            setUser(null)
        } catch (e) {
            console.error(e)
        }
    }

    async function handleGoogleLogin() {
        try {
            await account.createOAuth2Session(OAuthProvider.Google,
                'http://localhost:3000/', 
                'http://localhost:3000/tutorial',
                [
                   'https://www.googleapis.com/auth/userinfo.profile' 
                ] )
            setUser(await account.get())
            console.log({user})
            setEmail('')
            setPassword('')
        } catch (e) {
            console.error(e)
        }
    }

    if (loadingUser) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
                <div className="p-8 bg-white shadow-md rounded-lg max-w-sm text-center">
                    <Skeleton className="mb-4 h-[30px] w-[80%]" />
                    <Skeleton className="mb-4 h-[20px] w-[90%]" />
                    <Skeleton className="mb-6 h-[20px] w-[60%]" />
                    <Skeleton className="h-[40px] w-[50%]" />
                </div>
            </div>
        )
    }

    if (user) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
                <div className="p-8 bg-white shadow-lg rounded-lg max-w-sm text-center">
                    <h2 className="text-xl font-semibold mb-4">You're Already Logged In</h2>
                    <p className="mb-4">You can access your account details and settings in your dashboard.</p>
                    <Button
                        onClick={handleLogout}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        logout
                    </Button>
                </div>
            </div>

        )
    }


    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

    return (
        <main className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-4">Log In or Sign Up</h1>
                <form className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <Button
                            type="button"
                            onClick={handleLogin}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Login
                        </Button>
                        <Button
                            type="button"
                            onClick={handleRegister}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Register
                        </Button>
                    </div>
                </form>
                <Separator className="my-4" />
                <div className="flex justify-center items-center">
                    <Button
                        className="m-auto"
                        onClick={handleGoogleLogin}> Login With Google </Button>
                </div>
                <div className="h-10 w-10 bg-background" >

                </div>
            </div>
        </main>

    )
}