'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/User";
import { ID, Models, database } from "@/lib/appwrite";
import {
    ContentTypeType,

    // ListDocumentsType,
    // Platform, 
    // ContentType, 
    WatchlistDocumentCreate
} from "@/types/appwrite";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "../ui/use-toast";


const AddWatchlist = () => {
    const { user } = useUser()
    const [title, setTitle] = useState('')
    const [contentType, setContentType] = useState([])
    const [contentTypes, setContentTypes] = useState<Models.DocumentList<ContentTypeType> | undefined>(undefined)
    // const [platform, setPlatform] = useState('')

    useEffect(() => {
        // let contentTypes: Models.DocumentList<ContentTypeType> | undefined = undefined
        const fetchData = async () => {
            try {
                const result:Models.DocumentList<ContentTypeType> = await database.listDocuments('watchlist', 'content_type')
                console.log(result)
                setContentTypes(result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchData()
    }, [])
    console.log(contentTypes)
    // const platforms = database.listDocuments('watchlist', ['platform'])

    if (!user) {
        return null
    }


    function handleContentTypeUpdate(event: React.ChangeEvent<HTMLInputElement>) {
        setContentType(event.$id)

        console.log(event)
        console.log(contentType)
    }

    function handleTitleUpdate(event: React.ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value)
        console.log(title)
    }

    function handleAddWatchlist() {

        const data: WatchlistDocumentCreate = {
            title: title,
            contentType: contentType[0],
            platform: undefined
        }

        const promise = database.createDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, ID.unique(), data)
        promise.then(function (response) {
            // add toast on success
            console.log(response)
            toast({
                title: `Successfully added!`,
                description: `Added ${title} to your watchlist.`,
            })
            setTitle('')
        }, function (error) {
            // add toast on error
            console.log(error)
        })


    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto">
            <Input
                type="title"
                id="titleSearch"
                placeholder="Title"
                value={title}
                onChange={handleTitleUpdate}
                className="mb-4"
            />
            <Select
                
                onValueChange={handleContentTypeUpdate}
            >
                <SelectTrigger >
                    <SelectValue
                        placeholder="Movie, TV Show, etc..."
                        value={contentType}
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel></SelectLabel>
                        {contentTypes && contentTypes.documents && contentTypes.documents.map(type => (
                            <SelectItem key={type.label} value={type}>{type.label}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button onClick={handleAddWatchlist} className="mb-4">+Add</Button>
        </div>
    )


}


export default AddWatchlist