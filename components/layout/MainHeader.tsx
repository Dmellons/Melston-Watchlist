'use client'
import Link from "next/link";
import LoginButton from "../buttons/LoginButton";
import { Button } from "@/components/ui/button";
import NewSearchBar from "../NewSearchBar";
import { useMediaQuery } from "@/hooks/MediaQuery";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SafeIcon from "@/components/SafeIcon";
import { Film } from "lucide-react";

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
            <Card className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg rounded-none">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                        <Button asChild variant="ghost" className="text-xl font-bold hover:bg-transparent">
                            <Link href="/" className="flex items-center gap-2">
                                <SafeIcon icon={Film} className="h-6 w-6 text-primary" size={24} />
                                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    Watchlist
                                </span>
                            </Link>
                        </Button>
                        <LoginButton />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isDesktop) {
        // Desktop layout: single row with search bar integrated
        return (
            <Card className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg rounded-none">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 gap-6">
                        <Button asChild variant="ghost" className="text-xl font-bold hover:bg-transparent shrink-0">
                            <Link href="/" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                                <SafeIcon icon={Film} className="h-6 w-6 text-primary" size={24} />
                                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    Watchlist
                                </span>
                            </Link>
                        </Button>
                        
                        {showSearchBar && (
                            <div className="flex-1 max-w-md mx-8">
                                <NewSearchBar />
                            </div>
                        )}
                        
                        <LoginButton />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Mobile layout: stacked elements with proper spacing
    return (
        <Card className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg rounded-none">
            <CardContent className="p-0">
                {/* Top row: Watchlist title and login button */}
                <div className="flex items-center justify-between p-4 pb-2">
                    <Button asChild variant="ghost" className="text-xl font-bold hover:bg-transparent">
                        <Link href="/" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                            <SafeIcon icon={Film} className="h-6 w-6 text-primary" size={24} />
                            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                Watchlist
                            </span>
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
            </CardContent>
        </Card>
    );
}