import AISuggestions from "@/components/AISuggestions";
import { getLoggedInUser } from "@/lib/server/appwriteServer";
import { Sparkles } from "lucide-react";

export default async function AIPage() {
    const user = await getLoggedInUser();

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h1 className="text-2xl font-bold">Please sign in</h1>
                    <p className="text-muted-foreground">
                        Sign in to get personalized AI recommendations
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-4xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        AI Suggestions
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Get personalized movie, TV show, and game recommendations based on your preferences and watchlist.
                    </p>
                </div>

                {/* AI Suggestions Component */}
                <AISuggestions />
            </div>
        </main>
    );
}
