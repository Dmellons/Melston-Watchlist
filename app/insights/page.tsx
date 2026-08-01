import StreamingInsights from "@/components/StreamingInsights";
import { createSessionClient } from "@/lib/server/appwriteServer";
import { toPlain } from "@/lib/server/serialize";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, Query } from "appwrite";
import { redirect } from "next/navigation";

export default async function InsightsPage() {
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

    if (!user) {
        return <div className="text-3xl font-bold m-auto w-full text-center">please sign in</div>
    }

    const watchlist: Models.DocumentList<WatchlistDocument> = await databases.listDocuments<WatchlistDocument>(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [Query.limit(1000)]
    )

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 gap-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Streaming Insights</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    See which streaming services carry the most of your watchlist
                </p>
            </div>
            <StreamingInsights watchlist={toPlain(watchlist.documents)} />
        </main>
    );
};
