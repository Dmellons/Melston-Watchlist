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

    return (
        <nav className="flex flex-wrap items-center justify-between bg-title text-title-foreground w-full text-xl font-bold lg:flex-nowrap">
            <div className="flex justify-center lg:order-none lg:self-center">
                <Button asChild variant="link" className="z-20 text-xl text-title-foreground font-bold hover">
                    <Link href="/">
                        Watchlist
                    </Link>
                </Button>
            </div>

            <div className="my-3 z-20 mx-2">
                <LoginButton />
            </div>
            
            {/* Only render search bar after hydration and on appropriate pages */}
            {hasMounted && showSearchBar && (
                <div className="w-full absolute sm:flex top-0 z-10 font-normal">
                    <NewSearchBar />
                </div>
            )}
        </nav>
    );
}