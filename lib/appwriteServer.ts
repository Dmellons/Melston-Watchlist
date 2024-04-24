import { request } from 'http';
import sdk from 'node-appwrite';
import { cookies } from "next/headers";

export const adminClient = new sdk.Client();


adminClient
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string)
    

export const adminServerAccount = new sdk.Account(adminClient)
export const adminServerDatabases = new sdk.Databases(adminClient)
export const adminServerUsers = new sdk.Users(adminClient)


const serverClient = new sdk.Client()

serverClient
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)

const session = cookies().get('session')