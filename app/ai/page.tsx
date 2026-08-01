import AISuggestions from "@/components/AISuggestions";
import PageShell from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import SignInGate from "@/components/layout/SignInGate";
import { getLoggedInUser } from "@/lib/server/appwriteServer";
import { Sparkles } from "lucide-react";

export const metadata = { title: 'AI Suggestions' };

export default async function AIPage() {
    const user = await getLoggedInUser();

    if (!user) {
        return (
            <SignInGate
                icon={Sparkles}
                title="Sign in for AI suggestions"
                description="Get personalized movie, TV, and game recommendations."
            />
        );
    }

    return (
        <PageShell width="narrow">
            <PageHeader
                title="AI Suggestions"
                icon={Sparkles}
                subtitle="Personalized picks based on your watchlist and taste"
            />
            <AISuggestions />
        </PageShell>
    );
}
