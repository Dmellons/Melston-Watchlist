'use client'
import { useQuery } from "@tanstack/react-query";
import { tmdbFetchOptions } from "@/lib/tmdb";
import RecommendationsRow from "@/components/detail/RecommendationsRow";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentRowProps {
    title: string;
    /** TMDB path after /3/, e.g. "trending/all/week" or "movie/now_playing". */
    endpoint: string;
    fallbackType: 'movie' | 'tv';
}

/**
 * A titled, horizontally-scrolling row of TMDB poster cards.
 * Cached via TanStack Query so revisiting the home page is instant.
 */
export default function ContentRow({ title, endpoint, fallbackType }: ContentRowProps) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['tmdb-row', endpoint],
        staleTime: 1000 * 60 * 30, // 30 min
        queryFn: async () => {
            const join = endpoint.includes('?') ? '&' : '?';
            const res = await fetch(
                `https://api.themoviedb.org/3/${endpoint}${join}language=en-US`,
                tmdbFetchOptions,
            );
            if (!res.ok) throw new Error(`TMDB row failed: ${res.status}`);
            const json = await res.json();
            return (json.results ?? []).filter((r: any) => r.media_type !== 'person');
        },
    });

    if (isError) return null;

    if (isLoading) {
        return (
            <section className="space-y-3 sm:space-y-4">
                <Skeleton className="h-7 w-48" />
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-1/3 sm:w-1/4 lg:w-1/6 space-y-2">
                            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!data?.length) return null;

    return <RecommendationsRow title={title} items={data} fallbackType={fallbackType} />;
}
