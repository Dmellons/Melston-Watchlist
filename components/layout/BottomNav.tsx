'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import MoreDrawer from "./MoreDrawer";
import {
    ACCOUNT_ITEMS,
    DISCOVER_ITEMS,
    LIBRARY_ITEMS,
    isActive,
} from "./nav-config";

const TABS: Array<{ label: string; href: string; icon: LucideIcon }> = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
];

// Everything reachable only through the More drawer, minus what has its own tab.
const MORE_ITEMS = [...LIBRARY_ITEMS, ...DISCOVER_ITEMS, ...ACCOUNT_ITEMS]
    .filter((item) => !TABS.some((tab) => tab.href === item.href));

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
                    {TABS.map((tab) => (
                        <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
                    ))}
                    <MoreDrawer active={moreActive} />
                </div>
            </div>
        </nav>
    );
}
