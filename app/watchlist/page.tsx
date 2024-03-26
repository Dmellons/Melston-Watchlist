'use client'
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
                    // [
                    //     Query.
                    // ]
                    )
                console.log("result: ", result)
                if (!user) {
                    return
                }


                // const data: Models.DocumentList<WatchlistDocument> = await database.listDocuments(
                //     'watchlist', 
                //     'watchlist',
                //     [
                //         Query.equal('user', user.id)
                //     ]
                //     )
        
                // console.log("data: ", data)
                setWatchlist(result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchData()
    }, [user])

    return (
        <div>
            <h1 className="text-3xl font-bold">Watchlist</h1>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
                {
                    user ? (
                        watchlist?.documents && watchlist?.documents.map((document) => (
                            <li key={document.$id}>{document.title}</li>
                        ))


                    ) : (
                        <p>You are not logged in</p>
                    )
                }
            </ul>
            <AddWatchlist />
        </div>
    );
};

export default WatchlistPage;