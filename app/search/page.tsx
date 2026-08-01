import { Suspense } from "react";
import SearchPageContent from "@/components/search/SearchPageContent";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Search | Watchlist",
    description: "Search movies, TV shows, and games",
};

function SearchPageSkeleton() {
    return (
        <div className="p-4 sm:p-8 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchPageContent />
        </Suspense>
    );
}
