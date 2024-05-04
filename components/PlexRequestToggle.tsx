'use client'

import { useState } from "react"
import { Switch } from "./ui/switch"
import { database } from "@/lib/appwrite"
import { toast } from "sonner"
import { Label } from "./ui/label"
import { useUser } from "@/hooks/User"

const PlexRequestToggle = ({
    documentId,
    mediaTitle = 'media',
    requested
}: {
    documentId: string,
    mediaTitle?: string,
    requested?: boolean
}) => {

    const [requestState, setRequestState] = useState(requested)
    const { user } = useUser()
    if(!user?.labels?.includes('plex')){
        return null
    }
    return (
        <div className="gap-2 flex align-middle ">
            <div >
                Plex Request
                </div>
            <Switch
                id="plex-request-toggle"
                checked={requestState}
                
                onCheckedChange={() => {
                    // const promise = database.updateDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, documentId, {
                        //     plex_request: !requestState
                        // })
                        toast.promise(database.updateDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, documentId, {
                            plex_request: !requestState
                        }), {
                            loading: 'Updating Plex Request...',
                            success: (res) => {
                                setRequestState(!requestState)
                                console.log({ res })
                                if (requestState) {
                                    
                                    return `Removed Plex Request from ${mediaTitle} `
                                } else {
                                    return `Requested ${mediaTitle} from Plex`
                                }
                            },
                        error: (res) => {
                            // setRequestState(!requestState)
                            console.error({ res })
                            return (`Oops! There was an error updating Plex Request.\n\nError: ${res.response.message} `)
                        }

                    })
                }}
                
                
                />
        </div>
    )
}

export default PlexRequestToggle