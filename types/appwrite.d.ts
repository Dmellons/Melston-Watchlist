import { PlatformPath } from "path"

export type AppwriteUser = {

    "$id": string,
    "$createdAt": string,
    "$updatedAt": string,
    "name": string,
    "password": string,
    "hash": string,
    "hashOptions": object
    "registration": string,
    "status": bool,
    "labels": string,
    "passwordUpdate": string,
    "email": string,
    "phone": string,
    "emailVerification": boolean,
    "phoneVerification": bool,
    "prefs": UserPrefs,
    "accessedAt": string
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
    contentType: ContentType[],
    platform: Platform[],

}