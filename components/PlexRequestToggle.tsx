'use client'

import { useState } from "react"
import { Switch } from "./ui/switch"
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
                        <div className={`
                            p-2 rounded-lg transition-colors duration-200
                            ${requestState 
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                : 'bg-muted text-muted-foreground'
                            }
                        `}>
                            {isLoading ? (
                                <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                            ) : (
                                <SafeIcon 
                                    icon={Star} 
                                    className={`h-4 w-4 ${requestState ? 'fill-current' : ''}`} 
                                    size={16} 
                                />
                            )}
                        </div>
                        
                        <div className="space-y-1">
                            <Label 
                                htmlFor="plex-request-toggle" 
                                className="text-sm font-medium cursor-pointer"
                            >
                                Plex 
                            </Label>
                            {/* <p className="text-xs text-muted-foreground">
                                {requestState 
                                    ? "Requested from Plex server" 
                                    : "Request from Plex server"
                                }
                            </p> */}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {requestState && (
                            <Badge 
                                variant="secondary" 
                                className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            >
                                Requested
                            </Badge>
                        )}
                        
                        <Switch
                            id="plex-request-toggle"
                            checked={requestState}
                            onCheckedChange={handleToggle}
                            disabled={isLoading}
                            className={`
                                transition-all duration-200
                                ${requestState 
                                    ? 'data-[state=checked]:bg-amber-500' 
                                    : ''
                                }
                            `}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PlexRequestToggle