import sdk from 'node-appwrite';

export const client = new sdk.Client();


client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string)
    

export const sdkAccount = new sdk.Account(client)
export const skdDatabases = new sdk.Databases(client)
export const sdkUsers = new sdk.Users(client)
