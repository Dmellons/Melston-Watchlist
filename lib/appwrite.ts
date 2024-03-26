import { Client, Account, Databases } from 'appwrite';

export const client = new Client();


client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)

export const account = new Account(client);
export const database = new Databases(client)
export { ID,  type Models } from 'appwrite';

