'use client'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/User";
import {
    listCollections,
    createCollection,
    renameCollection,
    deleteCollection,
    toggleCollectionItem,
    type StoredCollection,
} from "@/lib/collections";

export function useCollections() {
    const { user } = useUser();
    const qc = useQueryClient();
    const key = ['collections', user?.id];

    const query = useQuery({
        queryKey: key,
        enabled: !!user,
        queryFn: () => listCollections(),
    });

    const collections: StoredCollection[] = query.data ?? [];
    const invalidate = () => qc.invalidateQueries({ queryKey: key });

    const create = useMutation({
        mutationFn: ({ name }: { name: string }) => createCollection(name),
        onSuccess: invalidate,
    });

    const rename = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => renameCollection(id, name),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => deleteCollection(id),
        onSuccess: invalidate,
    });

    const toggleItem = useMutation({
        mutationFn: ({ collectionId, itemId, present }: { collectionId: string; itemId: string; present: boolean }) =>
            toggleCollectionItem(collectionId, itemId, present),
        onSuccess: invalidate,
    });

    return { ...query, collections, create, rename, remove, toggleItem };
}
