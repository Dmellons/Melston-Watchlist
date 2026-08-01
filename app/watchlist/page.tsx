import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import PageShell from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import SignInGate from "@/components/layout/SignInGate";
import { EmptyState } from "@/components/ui/loading-states";
import { createSessionClient } from "@/lib/server/appwriteServer";
import { toPlain } from "@/lib/server/serialize";
import { WatchlistDocument } from "@/types/appwrite";
import { Bookmark } from "lucide-react";
import { Models, Query } from "appwrite";

export const metadata = { title: 'My Watchlist' };

export default async function WatchlistPage() {
    const signInGate = (
        <SignInGate
            icon={Bookmark}
            title="Sign in to see your watchlist"
            description="Track movies, shows, and games you want to watch."
        />
    )

    const { account, databases } = await createSessionClient()
    if (!account || !databases) {
        return signInGate
    }
    let user
    try {
        user = await account.get()
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && 'type' in error) {
            if (error.code === 401 && error.type === 'general_unauthorized_scope') {
                return signInGate
            }
        }
    }

    if (!user) {
        return signInGate
    }

    const watchlist: Models.DocumentList<WatchlistDocument> = await databases.listDocuments<WatchlistDocument>('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!, [Query.limit(1000)])

    return (
        <PageShell>
            <PageHeader
                title="My Watchlist"
                icon={Bookmark}
                color="rose"
                subtitle="Everything you're tracking, in one place"
            />
            {watchlist && watchlist.total > 0 ? (
                <WatchlistGrid watchlist={toPlain(watchlist)} />
            ) : (
                <EmptyState
                    icon={Bookmark}
                    title="Your watchlist is empty"
                    description="Use the search bar above to add your first title."
                />
            )}
        </PageShell>
    );
};
