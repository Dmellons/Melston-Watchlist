
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
    poster_url?: string | null,
    description: string,
    genre_ids: number[],
    notes?: string[],   

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
