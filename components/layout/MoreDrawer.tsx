'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import SafeIcon from "@/components/SafeIcon";
import { ModeToggle } from "@/components/buttons/ModeToggle";
import { useUser } from "@/hooks/User";
import {
    ACCOUNT_ITEMS,
    DISCOVER_ITEMS,
    LIBRARY_ITEMS,
    isActive,
    type NavItem,
} from "./nav-config";

const DrawerNavLink = ({ item, pathname }: { item: NavItem; pathname: string }) => {
    const active = isActive(pathname, item.href);
    return (
        <DrawerClose asChild>
            <Button asChild variant="ghost" className="w-full justify-start h-12">
                <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex items-center gap-3", active && "text-primary font-medium")}
                >
                    <SafeIcon icon={item.icon} className={cn("h-5 w-5", item.colorClass)} size={20} />
                    <span>{item.label}</span>
                </Link>
            </Button>
        </DrawerClose>
    );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-4 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {children}
    </p>
);

export default function MoreDrawer({ active }: { active: boolean }) {
    const pathname = usePathname();
    const { user, logout } = useUser();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <button
                    aria-current={active ? "page" : undefined}
                    className={cn(
                        "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <LayoutGrid className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                    More
                </button>
            </DrawerTrigger>
            <DrawerContent className="pb-[env(safe-area-inset-bottom)]">
                <DrawerTitle className="sr-only">More navigation</DrawerTitle>
                <div className="px-2 pb-4 space-y-1">
                    <SectionLabel>Library</SectionLabel>
                    {LIBRARY_ITEMS.map((item) => (
                        <DrawerNavLink key={item.href} item={item} pathname={pathname} />
                    ))}

                    <SectionLabel>Discover</SectionLabel>
                    {DISCOVER_ITEMS.map((item) => (
                        <DrawerNavLink key={item.href} item={item} pathname={pathname} />
                    ))}

                    {user && (
                        <>
                            <Separator className="my-2" />
                            {ACCOUNT_ITEMS.filter((item) => !item.adminOnly || user.admin).map((item) => (
                                <DrawerNavLink key={item.href} item={item} pathname={pathname} />
                            ))}
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between px-4 py-2">
                                <ModeToggle />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <SafeIcon icon={LogOut} className="h-4 w-4 mr-2" size={16} />
                                    Sign out
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
