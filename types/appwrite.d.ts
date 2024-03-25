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

export enum ContentType = {
    boardgame,
    videogame,
    tv,
    movie
}

export enum platform {
    Netflix,
    Nintendo,
    Xbox,
    Playstaation,
    Hulu,
    Max,
    CrunchyRoll,
}

export type WatchlistDocumentCreate = {
    title: string,
    content_type: ContentType[],
    patform: Platform[],

}