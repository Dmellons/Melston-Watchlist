'use client'
import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/SafeIcon";
import { useUser } from "@/hooks/User";
import { database } from "@/lib/appwrite";
import { toast } from "sonner";

interface FavoriteButtonProps {
    /** The watchlist document $id to toggle favorite on. */
    documentId: string;
    className?: string;
    /** size="icon" compact heart only (for cards). */
    iconOnly?: boolean;
}

/**
 * Toggles the `is_favorite` boolean on a watchlist document.
 * Optimistic update through useUser context (mirrors AddWatchlistButton/DeleteButton),
 * with rollback on failure. Requires the `is_favorite` attribute on the watchlist collection.
 */
export default function FavoriteButton({ documentId, className, iconOnly }: FavoriteButtonProps) {
    const { user, setUser } = useUser();
    const [busy, setBusy] = useState(false);

    const doc = user?.watchlist?.documents.find((d) => d.$id === documentId) as any;
    if (!user || !doc) return null;

    const isFav = !!doc.is_favorite;

    const apply = (value: boolean) =>
        setUser((prev) =>
            prev?.watchlist
                ? {
                      ...prev,
                      watchlist: {
                          ...prev.watchlist,
                          documents: prev.watchlist.documents.map((d) =>
                              d.$id === documentId ? { ...d, is_favorite: value } : d,
                          ) as typeof prev.watchlist.documents,
                      },
                  }
                : prev,
        );

    const toggle = async () => {
        if (busy) return;
        const next = !isFav;
        setBusy(true);
        apply(next); // optimistic
        try {
            await database.updateDocument(
                'watchlist',
                process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
                documentId,
                { is_favorite: next },
            );
        } catch (e) {
            apply(isFav); // rollback
            console.error('Favorite toggle failed:', e);
            toast.error("Couldn't update favorite");
        } finally {
            setBusy(false);
        }
    };

    if (iconOnly) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                disabled={busy}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                className={className}
            >
                {busy ? (
                    <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                ) : (
                    <SafeIcon icon={Heart} className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} size={16} />
                )}
            </Button>
        );
    }

    return (
        <Button variant="outline" onClick={toggle} disabled={busy} className={className}>
            {busy ? (
                <SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} />
            ) : (
                <SafeIcon icon={Heart} className={`h-4 w-4 mr-2 ${isFav ? 'fill-red-500 text-red-500' : ''}`} size={16} />
            )}
            {isFav ? 'Favorited' : 'Add to Favorites'}
        </Button>
    );
}
