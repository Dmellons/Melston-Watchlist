"use server"
import { createAdminClient } from "@/lib/server/appwriteServer";
import { Query } from "node-appwrite";

const WATCHLIST = process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!;

export interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    lastActive: string | null;
    status: boolean;
    labels: string[];
    role: 'admin' | 'tester' | 'user';
    watchlistCount: number;
    plexRequests: number;
}

export interface AdminOverview {
    totalItems: number;
    movies: number;
    tvShows: number;
    games: number;
    plexRequests: number;
    itemsThisMonth: number;
    itemsTrendPct: number;
    /** null when the API key lacks the users.read scope. */
    totalUsers: number | null;
    usersThisMonth: number | null;
    usersTrendPct: number | null;
}

function extractOwnerId(perms: string[] = []): string | null {
    const p = perms.find((x) => x.includes('update("user:'));
    return p?.match(/user:([^"]+)/)?.[1] ?? null;
}

// Real month-over-month from ISO timestamps (current vs previous calendar month).
function monthOverMonth(timestamps: string[]) {
    const now = new Date();
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    let thisMonth = 0;
    let lastMonth = 0;
    for (const t of timestamps) {
        const ms = new Date(t).getTime();
        if (ms >= thisStart) thisMonth++;
        else if (ms >= lastStart) lastMonth++;
    }
    const pct = lastMonth === 0
        ? (thisMonth > 0 ? 100 : 0)
        : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    return { thisMonth, lastMonth, pct };
}

export async function getAdminUsers(): Promise<
    { success: true; data: AdminUserRow[]; total: number } | { success: false; error: string }
> {
    try {
        const { users, databases } = await createAdminClient();
        const userList = await users.list([Query.limit(200)]);
        const docs = await databases.listDocuments('watchlist', WATCHLIST, [Query.limit(1000)]);

        const byOwner = new Map<string, { count: number; plex: number }>();
        for (const d of docs.documents as any[]) {
            const owner = extractOwnerId(d.$permissions);
            if (!owner) continue;
            const e = byOwner.get(owner) ?? { count: 0, plex: 0 };
            e.count++;
            if (d.plex_request) e.plex++;
            byOwner.set(owner, e);
        }

        const rows: AdminUserRow[] = userList.users.map((u: any) => {
            const labels: string[] = u.labels ?? [];
            return {
                id: u.$id,
                name: u.name || '(no name)',
                email: u.email,
                joinDate: u.$createdAt,
                lastActive: u.accessedAt || null,
                status: u.status,
                labels,
                role: labels.includes('admin') ? 'admin' : labels.includes('tester') ? 'tester' : 'user',
                watchlistCount: byOwner.get(u.$id)?.count ?? 0,
                plexRequests: byOwner.get(u.$id)?.plex ?? 0,
            };
        });

        return { success: true, data: rows, total: userList.total };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to load users' };
    }
}

export async function getAdminOverview(): Promise<
    { success: true; data: AdminOverview } | { success: false; error: string }
> {
    try {
        const { databases, users } = await createAdminClient();
        const docsRes = await databases.listDocuments('watchlist', WATCHLIST, [
            Query.limit(1000),
            Query.orderDesc('$createdAt'),
        ]);
        const docs = docsRes.documents as any[];
        const itemsMoM = monthOverMonth(docs.map((d) => d.$createdAt));

        // User count + trend may fail if the API key lacks users.read scope.
        let totalUsers: number | null = null;
        let usersThisMonth: number | null = null;
        let usersTrendPct: number | null = null;
        try {
            const userList = await users.list([Query.limit(1000)]);
            totalUsers = userList.total;
            const u = monthOverMonth(userList.users.map((x: any) => x.$createdAt));
            usersThisMonth = u.thisMonth;
            usersTrendPct = u.pct;
        } catch {
            /* no users.read scope — leave user metrics null */
        }

        return {
            success: true,
            data: {
                totalItems: docsRes.total,
                movies: docs.filter((d) => d.content_type === 'movie').length,
                tvShows: docs.filter((d) => d.content_type === 'tv').length,
                games: docs.filter((d) => d.content_type === 'videogame').length,
                plexRequests: docs.filter((d) => d.plex_request).length,
                itemsThisMonth: itemsMoM.thisMonth,
                itemsTrendPct: itemsMoM.pct,
                totalUsers,
                usersThisMonth,
                usersTrendPct,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to load overview' };
    }
}
