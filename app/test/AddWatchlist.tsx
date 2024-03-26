'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/User";
import { ID, database } from "@/lib/appwrite";
import { 
    // Platform, 
    // ContentType, 
    WatchlistDocumentCreate 
} from "@/types/appwrite";
import { useState } from "react";


const AddWatchlist = () => {
    const { user } = useUser()
    const [title, setTitle] = useState('')

    function handleTitleUpdate(event:React.ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value)
        console.log(title)
    }

    function handleAddWatchlist() {

        const data:WatchlistDocumentCreate = {
            title: title, 
            contentType: ['movie'],
            platform: ['netflix']
        }

        const promise = database.createDocument('watchlist','watchlist',ID.unique(),data)
        promise.then( function (response){
            // add toast on success
            console.log(response)
        }, function (error){
            // add toast on error
            console.log(error)
        })

        setTitle('')

    }
        
    return (
        <>
        <Input
            type="title"
            id="titleSearch"
            placeholder="Title"
            value={title}
            onChange={handleTitleUpdate}
        />
        <Button onClick={handleAddWatchlist}>+Add</Button>
        </>
    )
}


export default AddWatchlist