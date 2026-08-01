'use client'
import Link from "next/link";
import LoginButton from "../buttons/LoginButton";
import NewSearchBar from "../NewSearchBar";
import MainNav from "./MainNav";
import SafeIcon from "@/components/SafeIcon";
import { Film } from "lucide-react";

// CSS-responsive on purpose: no hooks means no SSR/hydration flash and the
// same markup at every breakpoint. Mobile shows logo + avatar only — search
// lives on the /search tab and nav in the bottom tab bar.
export default function MainHeader() {
    return (
        <div className="bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
            <div className="flex items-center gap-2 md:gap-4 px-3 py-3 md:px-4">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2 text-xl font-bold transition-all duration-200 hover:scale-105"
                >
                    <SafeIcon icon={Film} className="h-6 w-6 text-primary" size={24} />
                    <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Watchlist
                    </span>
                </Link>

                <MainNav />

                {/* Centered in the remaining space between nav and avatar; the
                    results panel anchors to the sticky header, not this box. */}
                <div className="hidden md:flex flex-1 justify-center px-2">
                    <div className="w-full max-w-md">
                        <NewSearchBar />
                    </div>
                </div>

                <div className="ml-auto md:ml-0 shrink-0">
                    <LoginButton />
                </div>
            </div>
        </div>
    );
}
