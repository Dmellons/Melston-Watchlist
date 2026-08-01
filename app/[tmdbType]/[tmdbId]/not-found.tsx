'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/loading-states";
import { Film } from "lucide-react";

export default function DetailNotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <EmptyState
                icon={Film}
                title="Title not found"
                description="We couldn't find that movie or show. It may have been removed, or the link is incorrect."
                action={
                    <Button asChild>
                        <Link href="/">Back to your watchlist</Link>
                    </Button>
                }
            />
        </div>
    );
}
