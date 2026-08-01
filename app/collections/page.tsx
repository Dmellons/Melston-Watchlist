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
import PageShell from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import SignInGate from "@/components/layout/SignInGate";
import { EmptyState, LoadingSpinner, PageSkeleton } from "@/components/ui/loading-states";

export default function CollectionsPage() {
    const { user, loading } = useUser();
    const { collections, isLoading, create, remove } = useCollections();
    const [newName, setNewName] = useState("");

    if (loading) return <PageShell><PageSkeleton /></PageShell>;

    if (!user) {
        return (
            <SignInGate
                icon={Library}
                title="Sign in to manage collections"
                description="Group your watchlist into custom lists."
            />
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
        <PageShell>
            <PageHeader
                title="Collections"
                icon={Library}
                color="amber"
                subtitle="Group your watchlist items into custom lists"
            />

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
                <LoadingSpinner className="py-10" />
            )}

            {!isLoading && collections.length === 0 && (
                <EmptyState
                    icon={Library}
                    title="No collections yet"
                    description="Create one above, or use 'Add to Collection' on any title."
                />
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
        </PageShell>
    );
}
