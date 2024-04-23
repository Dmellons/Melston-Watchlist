'use client'

import { useState } from "react"
import { Switch } from "./ui/switch"
import { database } from "@/lib/appwrite"
import { toast } from "sonner"

const PlexRequestToggle = ({
    documentId,
    requested
}: {
    documentId: string,
    requested?: boolean
}) => {

    const [requestState, setRequestState] = useState(requested)

    // const handleOnChange = () => {
    //     setRequestState(!requestState)
    //     const promise = database.updateDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, documentId, {
    //         requested: !requestState
    //     })
    //     promise.then(function (response) {
    //         console.log(response)
    //     }, function (error) {
    //         console.log(error)
    //     }
    // }
    console.log({ requestState })
    console.log({ documentId })

    return (
    <Switch
            id="plex-request-toggle"
            checked={requestState}

            onCheckedChange={() => {
                // const promise = database.updateDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, documentId, {
                    //     plex_request: !requestState
                    // })
                    toast.promise(database.updateDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, documentId,{
                        plex_request: true
                    }), {
                        loading: 'Updating Plex Request...',
                        success: (res) => {
                        setRequestState(!requestState)
                        console.log({res})
                        return `Updated Plex Request!`
                    },
                    error: (res) => {
                        // setRequestState(!requestState)
                        console.error({ res })
                        return (`Oops! There was an error updating Plex Request.\n\nError: ${res.response.message} `)
                    }
                    
                })
            }}
                

        />)
}

export default PlexRequestToggle