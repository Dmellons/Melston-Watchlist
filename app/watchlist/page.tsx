'use client'
import WatchlistMediaCard from "@/components/WatchlistMediaCard";
import AddWatchlist from "@/components/buttons/AddWatchlist";
import { useUser } from "@/hooks/User";
import { database } from "@/lib/appwrite";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, Query } from "appwrite";
import { useEffect, useState } from "react";
const WatchlistPage = () => {
    const { user } = useUser()
    const [watchlist, setWatchlist] = useState<Models.DocumentList<WatchlistDocument> | undefined>(undefined)


    useEffect(() => {
        const fetchData = async () => {
            try {
                const result: Models.DocumentList<WatchlistDocument> = await database.listDocuments(
                    'watchlist',
                    'watchlist',
                )
                console.log("result: ", result)
                if (!user) {
                    return
                }

                setWatchlist(result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchData()
    }, [user])
    console.log({ watchlist })

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-3xl font-bold">Watchlist</h1>
            <AddWatchlist />
            {
                user ? (
                    <div className="flex flex-col gap-4 sm:flex sm:flex-row ">

                        {watchlist?.documents && watchlist?.documents.map((document) => {
                            
                            return <WatchlistMediaCard key={document.$id} media={document} />
                        })}
                    </div>
                ) : (
                    <p>Please Login</p>
                )
            }
        </main>
    );
};

export default WatchlistPage;