namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_USER_DEBUG: string;
        NEXT_PUBLIC_URL_BASE: string;

        NEXT_PUBLIC_APPWRITE_ENDPOINT_URL: string;
        NEXT_PUBLIC_APPWRITE_PROJECT_ID: string;
        APPWRITE_API_KEY: string;
        NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID: string;
        NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID: string;
        
        NEXT_PUBLIC_WATCHMODE_API_KEY: string;

        NEXT_PUBLIC_TMDB_API_KEY: string;
        NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN: string;

        COOKIE_NAME: string;

        PLEX_TOKEN: string;
        PLEX_SERVER_BASE_URL: string;
    }
}