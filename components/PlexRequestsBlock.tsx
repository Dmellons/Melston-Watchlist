'use client'
import { Models, database } from "@/lib/appwrite"
import { WatchlistDocument } from "@/types/appwrite"
import { useEffect, useState } from "react"

const PlexRequestBlock = () => {
    

    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result: Models.DocumentList<WatchlistDocument> = await database.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID)
                setData(result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchData()
    }, [])

    console.log( data )
    

    
    if (!data) return <p>No results found</p>

    return (
        <div>
            <p>Plex Requests</p>
            {data &&
            data.documents.map((doc) => (
                <div key={doc.$id}>
                    <p>{doc.title}</p>
                </div>
            ))}
        </div>
    )
}

export default PlexRequestBlock