'use client'

import { useState } from "react"
import { database } from "@/lib/appwrite"
import { toast } from "sonner"
import { Label } from "./ui/label"
import { useUser } from "@/hooks/User"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import SafeIcon from "./SafeIcon"
import { Star, Loader2 } from "lucide-react"

const PlexRequestToggle = ({
    documentId,
    setPlexRequest,
    mediaTitle = 'media',
    requested,
}: {
    documentId: string,
    setPlexRequest: (value: boolean) => void
    requested: boolean,
    mediaTitle?: string,
}) => {
    const [requestState, setRequestState] = useState(requested)
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useUser()
    
    if (!user?.labels?.includes('plex')) {
        return null
    }

    const handleToggle = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            await database.updateDocument(
                'watchlist', 
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!, 
                documentId, 
                {
                    plex_request: !requestState
                }
            );

            const newState = !requestState;
            setRequestState(newState);
            setPlexRequest(newState);

            if (newState) {
                toast.success(
                    `Requested "${mediaTitle}" from Plex`,
                    {
                        description: "Your request has been submitted to the admin.",
                        icon: "⭐"
                    }
                );
            } else {
                toast.success(
                    `Removed Plex request for "${mediaTitle}"`,
                    {
                        description: "Your request has been cancelled."
                    }
                );
            }
        } catch (error) {
            console.error('Plex request error:', error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to update Plex request';
                
            toast.error(
                `Error updating Plex request`,
                {
                    description: errorMessage
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={`
            transition-all duration-300 
            ${requestState 
                ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 shadow-lg shadow-amber-500/10' 
                : 'border-border/50 hover:border-primary/30'
            }
            hover:shadow-lg hover:-translate-y-1
        `}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <button
                                onClick={handleToggle}
                                disabled={isLoading}
                                className={`
                                    p-2 rounded-lg transition-all duration-200
                                    ${requestState 
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' 
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }
                                    ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                                    disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50
                                `}
                            >
                                {isLoading ? (
                                    <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                                ) : (
                                    <SafeIcon 
                                        icon={Star} 
                                        className={`h-4 w-4 transition-all duration-200 ${requestState ? 'fill-current' : ''}`} 
                                        size={16} 
                                    />
                                )}
                            </button>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {requestState 
                                    ? "Requested from Plex server" 
                                    : "Click star to request from Plex server"
                                }
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <Label 
                                htmlFor="plex-request-toggle" 
                                className="text-sm font-medium"
                            >
                                Plex Request
                            </Label>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PlexRequestToggle