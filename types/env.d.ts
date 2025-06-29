namespace NodeJS {
    interface ProcessEnv {
        // Node environment
        readonly NODE_ENV: 'development' | 'production' | 'test';
        
        // App configuration
        readonly NEXT_PUBLIC_URL_BASE: string;

        // Appwrite configuration
        readonly NEXT_PUBLIC_APPWRITE_ENDPOINT_URL: string;
        readonly NEXT_PUBLIC_APPWRITE_PROJECT_ID: string;
        readonly NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID: string;
        readonly NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID: string;
        
        // Server-only Appwrite
        readonly APPWRITE_API_KEY: string;
        
        // TMDB API (make server-only for security)
        readonly TMDB_API_KEY: string;
        readonly NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN: string;
        
        // Authentication
        readonly COOKIE_NAME: string;
        readonly NEXTAUTH_SECRET?: string;
        readonly NEXTAUTH_URL?: string;

        // Plex configuration
        readonly PLEX_TOKEN: string;
        readonly PLEX_SERVER_BASE_URL: string;

        // External APIs
        readonly WATCHMODE_API_KEY?: string;
        
        // Optional debugging
        readonly NEXT_PUBLIC_USER_DEBUG?: string;
    }
}

// Runtime environment validation
export const requiredEnvVars = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT_URL',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID',
    'APPWRITE_API_KEY',
    'NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN',
    'COOKIE_NAME'
] as const;

export const validateEnv = () => {
    const missing = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
    );
    
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }
};

// Helper to safely access environment variables
export const env = {
    // Public variables (safe for client-side)
    NEXT_PUBLIC_URL_BASE: process.env.NEXT_PUBLIC_URL_BASE || 'http://localhost:3000',
    NEXT_PUBLIC_APPWRITE_ENDPOINT_URL: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL!,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
    NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID!,
    NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN: process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN!,
    
    // Server-only variables
    ...(typeof window === 'undefined' && {
        APPWRITE_API_KEY: process.env.APPWRITE_API_KEY!,
        TMDB_API_KEY: process.env.TMDB_API_KEY!,
        COOKIE_NAME: process.env.COOKIE_NAME!,
        PLEX_TOKEN: process.env.PLEX_TOKEN,
        PLEX_SERVER_BASE_URL: process.env.PLEX_SERVER_BASE_URL,
    })
} as const;