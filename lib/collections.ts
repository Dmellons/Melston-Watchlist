import { account } from "@/lib/appwrite";

/**
 * Collections are stored in the user's Appwrite account preferences (the same
 * reliable mechanism used for providers / notifications), so they need no
 * separate Appwrite collection, schema, or env var.
 *
 * Shape in prefs: prefs.collections = StoredCollection[]
 */
export interface StoredCollection {
    id: string;
    name: string;
    item_ids: string[]; // watchlist document $ids
}

function genId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listCollections(): Promise<StoredCollection[]> {
    const prefs = (await account.getPrefs()) as any;
    return Array.isArray(prefs?.collections) ? prefs.collections : [];
}

async function writeCollections(next: StoredCollection[]): Promise<StoredCollection[]> {
    const prefs = (await account.getPrefs()) as any;
    await account.updatePrefs({ ...prefs, collections: next });
    return next;
}

export async function createCollection(name: string): Promise<StoredCollection> {
    const list = await listCollections();
    const col: StoredCollection = { id: genId(), name, item_ids: [] };
    await writeCollections([col, ...list]);
    return col;
}

export async function renameCollection(id: string, name: string): Promise<StoredCollection[]> {
    const list = await listCollections();
    return writeCollections(list.map((c) => (c.id === id ? { ...c, name } : c)));
}

export async function deleteCollection(id: string): Promise<StoredCollection[]> {
    const list = await listCollections();
    return writeCollections(list.filter((c) => c.id !== id));
}

/** Add or remove a watchlist item id from a collection. */
export async function toggleCollectionItem(
    collectionId: string,
    itemId: string,
    present: boolean,
): Promise<StoredCollection[]> {
    const list = await listCollections();
    return writeCollections(
        list.map((c) => {
            if (c.id !== collectionId) return c;
            const set = new Set(c.item_ids);
            if (present) set.add(itemId);
            else set.delete(itemId);
            return { ...c, item_ids: Array.from(set) };
        }),
    );
}
