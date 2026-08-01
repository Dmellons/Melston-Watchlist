'use client'
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import SafeIcon from "@/components/SafeIcon";
import { useCollections } from "@/hooks/useCollections";
import { ListPlus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddToCollectionDialogProps {
    itemId: string;
    trigger?: React.ReactNode;
}

export default function AddToCollectionDialog({ itemId, trigger }: AddToCollectionDialogProps) {
    const { collections, isLoading, create, toggleItem } = useCollections();
    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState("");

    const handleToggle = (collectionId: string, present: boolean) => {
        toggleItem.mutate(
            { collectionId, itemId, present },
            {
                onError: () => toast.error("Couldn't update collection"),
            },
        );
    };

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) return;
        create.mutate(
            { name },
            {
                onSuccess: (col) => {
                    setNewName("");
                    // immediately add the item to the freshly-created collection
                    handleToggle(col.id, true);
                    toast.success(`Created "${name}"`);
                },
                onError: () => toast.error("Couldn't create collection"),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                        <SafeIcon icon={ListPlus} className="h-3 w-3 sm:h-4 sm:w-4 mr-2" size={16} />
                        Add to Collection
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to collection</DialogTitle>
                    <DialogDescription>Organize this title into your collections.</DialogDescription>
                </DialogHeader>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                            <SafeIcon icon={Loader2} className="h-5 w-5 animate-spin" size={20} />
                        </div>
                    )}

                    {!isLoading && collections.length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">No collections yet — create one below.</p>
                    )}

                    {collections.map((col) => {
                        const checked = (col.item_ids ?? []).includes(itemId);
                        return (
                            <label
                                key={col.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => handleToggle(col.id, !!v)}
                                />
                                <span className="text-sm flex-1">{col.name}</span>
                                <span className="text-xs text-muted-foreground">{(col.item_ids ?? []).length}</span>
                            </label>
                        );
                    })}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                    <Input
                        placeholder="New collection name…"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                    />
                    <Button onClick={handleCreate} disabled={!newName.trim() || create.isPending}>
                        {create.isPending ? (
                            <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                        ) : (
                            <SafeIcon icon={Plus} className="h-4 w-4" size={16} />
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
