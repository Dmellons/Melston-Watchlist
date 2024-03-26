'use client'
import { useUser } from "@/hooks/User"
import AddWatchlist from "../../components/buttons/AddWatchlist"

function TestPage() {
    const { user } = useUser()


    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <h1 className="text-3xl font-bold">Test Page</h1>
            <h2 className="text-xl">User info</h2>
            <ul>
                {user ? (
                    <>
                        <li>Name: {user.name}</li>
                        <li>Email: {user.email}</li>
                    <AddWatchlist />
                    </>
                ) : (
                    <li>No user logged in</li>
                )}

            </ul>

        </div>
    )
}

export default TestPage