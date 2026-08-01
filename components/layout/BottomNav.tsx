'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import MoreDrawer from "./MoreDrawer";
import { openSearchOverlay } from "@/components/search/SearchOverlay";
import {
    ACCOUNT_ITEMS,
    DISCOVER_ITEMS,
    LIBRARY_ITEMS,
    isActive,
} from "./nav-config";

// Everything reachable only through the More drawer, minus what has its own tab.
const TAB_HREFS = ['/', '/watchlist'];
const MORE_ITEMS = [...LIBRARY_ITEMS, ...DISCOVER_ITEMS, ...ACCOUNT_ITEMS]
    .filter((item) => !TAB_HREFS.includes(item.href));

const TabLink = ({ label, href, icon: Icon, active }: { label: string; href: string; icon: LucideIcon; active: boolean }) => (
    <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "text-primary" : "text-muted-foreground"
        )}
    >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
        {label}
    </Link>
);

export default function BottomNav() {
    const pathname = usePathname();
    const moreActive = MORE_ITEMS.some((item) => isActive(pathname, item.href));

    return (
        <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 md:hidden">
            <div className="mx-auto max-w-7xl border-t border-border/50 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
                <div className="grid grid-cols-4 h-16">
                    <TabLink label="Home" href="/" icon={Home} active={isActive(pathname, '/')} />
                    {/* Opens the search overlay; /search stays the deep-browse page */}
                    <button
                        onClick={openSearchOverlay}
                        aria-label="Search"
                        className={cn(
                            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive(pathname, '/search') ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Search className="h-5 w-5" strokeWidth={isActive(pathname, '/search') ? 2.5 : 2} />
                        Search
                    </button>
                    <TabLink label="Watchlist" href="/watchlist" icon={Bookmark} active={isActive(pathname, '/watchlist')} />
                    <MoreDrawer active={moreActive} />
                </div>
            </div>
        </nav>
    );
}
