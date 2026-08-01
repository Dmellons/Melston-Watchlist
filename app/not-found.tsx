'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/loading-states";
import { Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <EmptyState
                icon={Compass}
                title="Page not found"
                description="The page you're looking for doesn't exist or has moved."
                action={
                    <Button asChild>
                        <Link href="/">Go home</Link>
                    </Button>
                }
            />
        </div>
    );
}
