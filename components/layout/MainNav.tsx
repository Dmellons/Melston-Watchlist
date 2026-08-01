'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SafeIcon from "@/components/SafeIcon";
import {
    DISCOVER_ITEMS,
    LIBRARY_ITEMS,
    isActive,
    isGroupActive,
    type NavItem,
} from "./nav-config";

const activeClasses =
    "text-primary font-semibold after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary";

const NavLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
    <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
            "relative inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? activeClasses : "text-muted-foreground hover:text-foreground"
        )}
    >
        {label}
    </Link>
);

const NavGroup = ({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) => {
    const active = isGroupActive(pathname, items);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "relative gap-1 text-sm group",
                        active ? activeClasses : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {label}
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {items.map((item) => {
                    const itemActive = isActive(pathname, item.href);
                    return (
                        <DropdownMenuItem key={item.href} asChild>
                            <Link
                                href={item.href}
                                aria-current={itemActive ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-3 cursor-pointer",
                                    itemActive && "text-primary font-medium"
                                )}
                            >
                                <SafeIcon icon={item.icon} className={cn("h-4 w-4", item.colorClass)} size={16} />
                                <span>{item.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function MainNav() {
    const pathname = usePathname();
    return (
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            <NavLink href="/" label="Home" active={isActive(pathname, "/")} />
            <NavGroup label="Library" items={LIBRARY_ITEMS} pathname={pathname} />
            <NavGroup label="Discover" items={DISCOVER_ITEMS} pathname={pathname} />
        </nav>
    );
}
