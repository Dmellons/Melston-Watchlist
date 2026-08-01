import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import { createSessionClient } from "@/lib/server/appwriteServer";
import { toPlain } from "@/lib/server/serialize";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, Query } from "appwrite";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
    const { account, databases } = await createSessionClient()
    if (!account || !databases) {
        redirect('/')
    }
    let user
    try {
        user = await account.get()
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && 'type' in error) {
            if (error.code === 401 && error.type === 'general_unauthorized_scope') {
                redirect('/')
            }
        }
    }

    const watchlist: Models.DocumentList<WatchlistDocument> = await databases.listDocuments<WatchlistDocument>('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!, [Query.limit(1000)])

    if (!user) {
        return <div className="text-3xl font-bold m-auto w-full text-center">please sign in </div>
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8">
            <h1 className="text-3xl font-bold">Watchlist</h1>
            {watchlist && watchlist.total > 0 ? (
                <WatchlistGrid watchlist={toPlain(watchlist)} />
            ) : (
                <p className="mt-8 text-muted-foreground">
                    Your watchlist is empty — use the search bar above to add your first title.
                </p>
            )}
        </main>
    );
};
