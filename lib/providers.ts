import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ProvidersApiCall, StreamingInfo, tmdbFetchOptions } from '@/lib/tmdb';

export type ProvidersResult = {
    data: ProvidersApiCall;
    inPlex: boolean;
};

// Pseudo-provider used to surface Plex library availability alongside TMDB providers
export const PLEX_PROVIDER: StreamingInfo = {
    logo_path: '/logos/plex-logo.svg',
    provider_id: 999,
    provider_name: 'Plex',
    display_priority: 1,
};

export const providersQueryKey = (tmdbType: string, tmdbId: number, plexEnabled: boolean) =>
    ['providers', tmdbType, tmdbId, plexEnabled] as const;

export async function fetchProviders(
    tmdbType: string,
    tmdbId: number,
    plexEnabled: boolean
): Promise<ProvidersResult> {
    const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId.toString()}/watch/providers`;
    const response = await fetch(url, tmdbFetchOptions);

    if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.status}`);
    }

    const data: ProvidersApiCall = await response.json();

    // Check Plex availability. Isolated so a Plex lookup failure never
    // hides streaming providers — it just falls back to inPlex=false.
    let inPlex = false;
    if (plexEnabled) {
        try {
            const plex_collection_id = process.env.NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID;
            const plex_db = await database.listDocuments('watchlist', plex_collection_id!, [
                Query.equal('tmdb_id', tmdbId.toString())
            ]);

            const plex_ids = plex_db.documents.map(doc => doc.tmdb_id);
            inPlex = plex_ids.includes(tmdbId.toString());
        } catch (plexError) {
            console.error('Error checking Plex availability:', plexError);
        }
    }

    return { data, inPlex };
}
