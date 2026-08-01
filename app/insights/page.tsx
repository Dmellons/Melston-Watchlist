import StreamingInsights from "@/components/StreamingInsights";
import PageShell from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import SignInGate from "@/components/layout/SignInGate";
import { createSessionClient } from "@/lib/server/appwriteServer";
import { toPlain } from "@/lib/server/serialize";
import { WatchlistDocument } from "@/types/appwrite";
import { BarChart3 } from "lucide-react";
import { Models, Query } from "appwrite";

export const metadata = { title: 'Streaming Insights' };

export default async function InsightsPage() {
    const signInGate = (
        <SignInGate
            icon={BarChart3}
            title="Sign in for streaming insights"
            description="See which services carry the most of your watchlist."
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

    const watchlist: Models.DocumentList<WatchlistDocument> = await databases.listDocuments<WatchlistDocument>(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        [Query.limit(1000)]
    )

    return (
        <PageShell>
            <PageHeader
                title="Streaming Insights"
                icon={BarChart3}
                color="green"
                subtitle="See which streaming services carry the most of your watchlist"
            />
            <StreamingInsights watchlist={toPlain(watchlist.documents)} />
        </PageShell>
    );
};
