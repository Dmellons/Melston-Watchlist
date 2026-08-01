import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly while the game detail server fetch is in flight.
export default function GameLoading() {
    return (
        <div className="min-h-screen">
            <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden">
                <Skeleton className="absolute inset-0 rounded-none" />
            </div>
            <div className="max-w-5xl mx-auto p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                    <Skeleton className="w-40 h-56 rounded-lg flex-shrink-0 mx-auto sm:mx-0" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-9 w-2/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}
