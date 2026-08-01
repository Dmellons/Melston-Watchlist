'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import SafeIcon from "@/components/SafeIcon";
import { useUser } from "@/hooks/User";
import {
    ACCOUNT_ITEMS,
    DISCOVER_ITEMS,
    LIBRARY_ITEMS,
} from "@/components/layout/nav-config";

export default function CommandK() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const go = (href: string) => {
        setOpen(false);
        setQuery("");
        router.push(href);
    };

    const pages = [
        { label: "Home", href: "/", icon: Home, colorClass: "text-primary" },
        ...LIBRARY_ITEMS,
        ...DISCOVER_ITEMS,
        ...ACCOUNT_ITEMS.filter((item) => !item.adminOnly || user?.admin),
    ];

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Jump to a page or search..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {query.trim().length >= 2 && (
                    <>
                        <CommandGroup heading="Search">
                            {/* forceMount: cmdk's filter would drop this synthetic row */}
                            <CommandItem
                                forceMount
                                onSelect={() => go(`/search?q=${encodeURIComponent(query.trim())}&type=media`)}
                            >
                                <SafeIcon icon={Search} className="h-4 w-4 mr-2 text-primary" size={16} />
                                Search for &quot;{query.trim()}&quot;
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}
                <CommandGroup heading="Pages">
                    {pages.map((page) => (
                        <CommandItem key={page.href} onSelect={() => go(page.href)}>
                            <SafeIcon
                                icon={page.icon}
                                className={cn("h-4 w-4 mr-2", page.colorClass)}
                                size={16}
                            />
                            {page.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
