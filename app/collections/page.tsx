'use client'
import { useState } from "react";
import { useUser } from "@/hooks/User";
import { useCollections } from "@/hooks/useCollections";
import NewWatchlistCard from "@/components/NewWatchlistCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import SafeIcon from "@/components/SafeIcon";
import { Library, Plus, Trash2, Loader2 } from "lucide-react";
import { WatchlistDocument } from "@/types/appwrite";
import { toast } from "sonner";

export default function CollectionsPage() {
    const { user, loading } = useUser();
    const { collections, isLoading, create, remove } = useCollections();
    const [newName, setNewName] = useState("");

    if (loading) return null;

    if (!user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Please sign in to manage collections.</p>
            </div>
        );
    }

    const docs = (user.watchlist?.documents ?? []) as WatchlistDocument[];
    const byId = new Map(docs.map((d) => [d.$id, d]));

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) return;
        create.mutate({ name }, {
            onSuccess: () => { setNewName(""); toast.success(`Created "${name}"`); },
            onError: () => toast.error("Couldn't create collection"),
        });
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <SafeIcon icon={Library} className="h-6 w-6 text-primary" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Collections</h1>
                    <p className="text-muted-foreground">Group your watchlist items into custom lists.</p>
                </div>
            </div>

            {/* Create */}
            <Card>
                <CardContent className="flex gap-2 p-4">
                    <Input
                        placeholder="New collection name…"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                    />
                    <Button onClick={handleCreate} disabled={!newName.trim() || create.isPending}>
                        {create.isPending
                            ? <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                            : <><SafeIcon icon={Plus} className="h-4 w-4 mr-1" size={16} /> Create</>}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex justify-center py-10 text-muted-foreground">
                    <SafeIcon icon={Loader2} className="h-6 w-6 animate-spin" size={24} />
                </div>
            )}

            {!isLoading && collections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <SafeIcon icon={Library} className="h-10 w-10 mx-auto mb-3" size={40} />
                    <p>No collections yet. Create one above, or use “Add to Collection” on any title.</p>
                </div>
            )}

            <Accordion type="multiple" className="space-y-3">
                {collections.map((col) => {
                    const members = (col.item_ids ?? []).map((id) => byId.get(id)).filter(Boolean) as WatchlistDocument[];
                    return (
                        <AccordionItem key={col.id} value={col.id} className="border rounded-lg px-4">
                            <div className="flex items-center justify-between">
                                <AccordionTrigger className="flex-1">
                                    <span className="font-semibold">{col.name}</span>
                                    <span className="ml-3 text-sm text-muted-foreground">{members.length} item{members.length !== 1 ? 's' : ''}</span>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Delete ${col.name}`}
                                    onClick={() => {
                                        if (confirm(`Delete collection "${col.name}"?`)) {
                                            remove.mutate(col.id, { onError: () => toast.error("Couldn't delete") });
                                        }
                                    }}
                                >
                                    <SafeIcon icon={Trash2} className="h-4 w-4 text-destructive" size={16} />
                                </Button>
                            </div>
                            <AccordionContent>
                                {members.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">This collection is empty.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center py-4">
                                        {members.map((m) => (
                                            <NewWatchlistCard key={m.$id} media={m} />
                                        ))}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
