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
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { ToastAction } from "../ui/toast";
import { revalidatePath } from "next/cache";


const AddWatchlist = () => {
    const { user } = useUser()
    const [title, setTitle] = useState('')
    const [contentType, setContentType] = useState('')
    const [contentTypes, setContentTypes] = useState<Models.DocumentList<ContentTypeType> | undefined>(undefined)
    const searchRef = useRef()
    // const [platform, setPlatform] = useState('')

    useEffect(() => {
        // let contentTypes: Models.DocumentList<ContentTypeType> | undefined = undefined
        const fetchData = async () => {
            try {
                const result: Models.DocumentList<ContentTypeType> = await database.listDocuments('watchlist', 'content_type')
                const data = result.documents.filter((item) => item.$permissions)
                console.log({ data })
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
        console.log({ event })
        setContentType(event.target.value.$id)

    }

    function handleTitleUpdate(event: React.ChangeEvent<HTMLInputElement>) {
        // event.preventDefault()
        setTitle(event.target.value)
        // console.log(searchRef.current.value)
    }

    function handleAddWatchlist() {

        const data: WatchlistDocumentCreate = {
            title: title,
            content_type: contentType,
            platform: undefined
        }

        const promise = database.createDocument('watchlist', 'watchlist', ID.unique(), data)
        
        toast.promise(promise, {
            loading: 'Adding...',
            success: `Added "${title}" to your watchlist!`,
            error: `Oops! There was an error adding "${title}" to your watchlist.`,
        })
        // revalidatePath(window.location.href)


    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto">
            <Input
                type="title"
                id="titleSearch"
                placeholder="Title"
                // ref={searchRef}
                value={title}
                onChange={handleTitleUpdate}
                className="mb-4"
            />
            <Select onValueChange={(value) => handleContentTypeUpdate({ target: { value } })} >
                <SelectTrigger >
                    <SelectValue
                        placeholder="Movie, TV Show, etc..."
                    // value={contentType}
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