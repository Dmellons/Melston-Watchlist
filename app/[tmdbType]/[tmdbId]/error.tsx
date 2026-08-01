'use client'
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/loading-states";

export default function DetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <ErrorState
                title="Couldn't load this title"
                description="Something went wrong fetching the details. Please try again."
                retry={reset}
            />
        </div>
    );
}
