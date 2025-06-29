'use client'
import Link from "next/link";
import LoginButton from "../buttons/LoginButton";
import { Button } from "@/components/ui/button";
import NewSearchBar from "../NewSearchBar";
import { useMediaQuery } from "@/hooks/MediaQuery";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function MainHeader() {
    const [hasMounted, setHasMounted] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)", { defaultValue: false });
    const pathname = usePathname();
    
    // Paths where search bar should not be shown
    const hideSearchBarPaths = ["/profile", "/admin"];
    const showSearchBar = !hideSearchBarPaths.some(path => pathname.includes(path));

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // Render a basic header structure during SSR/hydration
        return (
            <nav className="bg-title text-title-foreground w-full">
                <div className="flex items-center justify-between p-4">
                    <Button asChild variant="link" className="text-xl text-title-foreground font-bold">
                        <Link href="/">
                            Watchlist
                        </Link>
                    </Button>
                    <LoginButton />
                </div>
            </nav>
        );
    }

    if (isDesktop) {
        // Desktop layout: single row with search bar integrated
        return (
            <nav className="bg-title text-title-foreground w-full">
                <div className="flex items-center justify-between p-4">
                    <Button asChild variant="link" className="text-xl text-title-foreground font-bold">
                        <Link href="/">
                            Watchlist
                        </Link>
                    </Button>
                    
                    {showSearchBar && (
                        <div className="flex-1 max-w-md mx-8">
                            <NewSearchBar />
                        </div>
                    )}
                    
                    <LoginButton />
                </div>
            </nav>
        );
    }

    // Mobile layout: stacked elements with proper spacing
    return (
        <nav className="bg-title text-title-foreground w-full">
            {/* Top row: Watchlist title and login button */}
            <div className="flex items-center justify-between p-4 pb-2">
                <Button asChild variant="link" className="text-xl text-title-foreground font-bold">
                    <Link href="/">
                        Watchlist
                    </Link>
                </Button>
                <LoginButton />
            </div>
            
            {/* Search bar row (mobile only) */}
            {showSearchBar && (
                <div className="px-4 pb-4">
                    <NewSearchBar />
                </div>
            )}
        </nav>
    );
}