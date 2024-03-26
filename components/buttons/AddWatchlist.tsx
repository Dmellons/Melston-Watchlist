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
import { ToastAction } from "../ui/toast";


const AddWatchlist = () => {
    const { user } = useUser()
    const [title, setTitle] = useState('')
    const [contentType, setContentType] = useState('')
    const [contentTypes, setContentTypes] = useState<Models.DocumentList<ContentTypeType> | undefined>(undefined)
    // const [platform, setPlatform] = useState('')

    useEffect(() => {
        // let contentTypes: Models.DocumentList<ContentTypeType> | undefined = undefined
        const fetchData = async () => {
            try {
                const result:Models.DocumentList<ContentTypeType> = await database.listDocuments('watchlist', 'content_type')
                
                setContentTypes(result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchData()
    }, [])
    
    // const platforms = database.listDocuments('watchlist', ['platform'])

    if (!user) {
        return null
    }


    function handleContentTypeUpdate(event: React.ChangeEvent<HTMLInputElement>) {
        setContentType(event.$id)

    }

    function handleTitleUpdate(event: React.ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value)
    }

    function handleAddWatchlist() {

        const data: WatchlistDocumentCreate = {
            title: title,
            content_type: [contentType],
            platform: undefined
        }

        const promise = database.createDocument('watchlist', 'watchlist', ID.unique(), data)
        promise.then(function (response) {
            // add toast on success
            toast({
                title: `Successfully added!`,
                description: `Added ${title} to your watchlist.`,
                action: <ToastAction altText="Ok">Ok</ToastAction>,
                variant: 'default'
            })
            console.log(response)
            
            setTitle('')
            
        }, function (error) {
            // add toast on error
            toast({
                title: `Error`,
                description: `Error adding ${title} to your watchlist.`,
                variant: 'destructive'
            })
            console.error(error)
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
            <Button onClick={handleAddWatchlist} className="my-4">+Add</Button>
        </div>
    )


}


export default AddWatchlist