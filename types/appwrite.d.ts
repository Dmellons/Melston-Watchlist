// types/appwrite.d.ts - Enhanced version
import { Models } from "appwrite"

export type AppwriteUser = {
    id: string,
    createdAt: string,
    updatedAt: string,
    name: string,
    password: string,
    hash: string,
    hashOptions: object
    registration: string,
    status: boolean,
    labels: string,
    passwordUpdate: string,
    email: string,
    phone: string,
    emailVerification: boolean,
    phoneVerification: boolean,
    prefs: UserPrefs,
    accessedAt: string
} | Models.User<Models.Preferences>

export type UserPrefs = {
    "role": UserRoles
}

export type UserRoles = [
    'Admin',
    'User'
]

export enum ContentType {
    boardgame = 'boardgame',
    book = 'book',
    music = 'music',
    videogame = 'videogame',
    tv = 'tv',
    movie = 'movie'
}

export enum Platform {
    Netflix = 'Netflix',
    Nintendo = 'Nintendo',
    AmazonPrime = 'AmazonPrime',
    AppleTv = 'AppleTv',
    Xbox = 'Xbox',
    PlayStation = 'Playstation',
    Hulu = 'Hulu',
    Max = 'Max',
    CrunchyRoll = 'CrunchyRoll'
}



export type WatchlistDocumentCreate = {
    title: string,
    watched?: boolean,
    content_type: string,
    tmdb_id: number,
    imdb_id?: string,
    tmdb_type: string,
    release_date?: string,
    poster_url: string,
    backdrop_url?: string | null,
    plex_request: boolean,
    description: string,
    genre_ids: number[],
    notes?: string[],
    // New fields
    watch_status: WatchStatus,
    user_rating?: number, // 1-10 scale
    user_review?: string,
    date_watched?: string,
    rewatch_count?: number,
    is_favorite?: boolean,
    tags?: string[], // Custom user tags
    progress?: {
        current_episode?: number,
        total_episodes?: number,
        current_season?: number,
        total_seasons?: number,
    }
}

export type DocumentType = {
    label: string,
    icon?: string,
} & Models.Document

export type ContentTypeType = {
    label: string,
    icon?: string,
    website?: string
} & Models.Document

export type WatchlistDocument = WatchlistDocumentCreate & {
    platform: Platform[],
} & Models.Document

// New type for user statistics
export type UserStats = {
    total_items: number,
    movies_watched: number,
    tv_shows_watched: number,
    total_watch_time: number, // in minutes
    average_rating: number,
    favorite_genres: Array<{genre: string, count: number}>,
    yearly_stats: Array<{year: number, count: number}>,
    watch_status_breakdown: {
        want_to_watch: number,
        watching: number,
        completed: number,
        on_hold: number,
        dropped: number,
    }
}