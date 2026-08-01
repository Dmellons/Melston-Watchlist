'use client'
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AISuggestionCard from "@/components/AISuggestionCard";
import SafeIcon from "@/components/SafeIcon";
import { AISuggestion } from "@/types/ai";
import { Sparkles, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const PRESETS = [
    { label: "Something new tonight", prompt: "Suggest something new for me to watch tonight based on my taste" },
    { label: "Help me finish a show", prompt: "Remind me of shows I have started but not finished, or suggest similar ones worth picking back up" },
    { label: "Hidden gems", prompt: "Suggest hidden gems similar to my favorite movies and shows" },
];

async function fetchSuggestions(prompt: string): Promise<AISuggestion[]> {
    const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mediaType: 'all', limit: 5 }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestions');
    }
    return data.data.suggestions || [];
}

const HomeAISuggestions = () => {
    const [prompt, setPrompt] = useState<string | null>(null);

    // Fetches only after a chip is clicked (prompt starts null) — the vLLM
    // endpoint is slow, so never fetch on mount. staleTime: Infinity means a
    // previously-run prompt shows its cached result instantly; the refresh
    // button forces a re-run via refetch().
    const { data, isFetching, error, refetch } = useQuery<AISuggestion[]>({
        queryKey: ['ai', 'home-suggestions', prompt],
        enabled: prompt !== null,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
        retry: false,
        queryFn: () => fetchSuggestions(prompt!),
    });

    const runPrompt = (nextPrompt: string) => {
        if (nextPrompt === prompt) {
            refetch();
        } else {
            setPrompt(nextPrompt);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <SafeIcon icon={Sparkles} className="h-5 w-5 text-primary" size={20} />
                    AI Picks
                </CardTitle>
                {prompt && !isFetching && (
                    <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh picks">
                        <SafeIcon icon={RefreshCw} className="h-4 w-4" size={16} />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                        <Button
                            key={preset.label}
                            variant={preset.prompt === prompt ? "default" : "outline"}
                            size="sm"
                            disabled={isFetching}
                            onClick={() => runPrompt(preset.prompt)}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>

                {!prompt && !data && (
                    <p className="text-sm text-muted-foreground">
                        Pick a prompt to get personalized suggestions from your watchlist history.
                    </p>
                )}

                {isFetching && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking about your watchlist...
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-24 w-16 rounded-md shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isFetching && error && (
                    <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                        <span>{error instanceof Error ? error.message : 'Failed to get suggestions'}</span>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                )}

                {!isFetching && !error && data && data.length > 0 && (
                    <div className="space-y-3">
                        {data.map((suggestion, i) => (
                            <AISuggestionCard key={`${suggestion.title}-${i}`} suggestion={suggestion} />
                        ))}
                    </div>
                )}

                {!isFetching && !error && data && data.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No suggestions this time — try another prompt.
                    </p>
                )}

                <div className="flex justify-end">
                    <Button asChild variant="link" size="sm" className="text-muted-foreground">
                        <Link href="/ai" className="flex items-center gap-1">
                            More options
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default HomeAISuggestions;
