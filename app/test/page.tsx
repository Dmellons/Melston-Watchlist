'use client'
import { useUser } from "@/hooks/User"
import AddWatchlist from "@/components/buttons/AddWatchlist"
import SearchMovie from "@/components/SearchMovie"

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
                        
                    </>
                ) : (
                    <li>No user logged in</li>
                    )}

            </ul>
                    <div className="border m-4 p-10 rounded-lg">
                    <SearchMovie 
                        // query="Spider Man" 
                    />

                    {/* <AddWatchlist /> */}
                    </div>
        </div>
    )
}

export default TestPage