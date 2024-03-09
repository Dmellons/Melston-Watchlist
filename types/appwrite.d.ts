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
}

export type UserPrefs = {
    "role": UserRoles
}

export type UserRoles = [
    'Admin',
    'User'
]