import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly while the detail page's server fetch is in flight.
export default function DetailLoading() {
    return (
        <div className="min-h-screen">
            {/* Hero skeleton */}
            <div className="relative w-full h-[40vh] sm:h-[55vh] overflow-hidden">
                <Skeleton className="absolute inset-0 rounded-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 space-y-4">
                    <Skeleton className="h-8 sm:h-12 w-2/3 max-w-md" />
                    <div className="flex gap-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-36" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                </div>

                <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Cast strip skeleton */}
                <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 space-y-2">
                                <Skeleton className="w-20 sm:w-32 h-24 sm:h-48 rounded-lg" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
