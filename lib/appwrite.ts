import { WatchlistDocumentCreate } from '@/types/appwrite';
import { AutocompleteResult } from '@/types/watchmodeApi';
import { Client, Account, Databases, ID, Permission, Role } from 'appwrite';
import { toast } from 'sonner';

export const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)

export const account = new Account(client);
export const database = new Databases(client)

export { ID, Permission, Role, type Models } from 'appwrite';


export async function updateUserPreferences(preferences: object): Promise<object> {
    try {
        const response = await account.updatePrefs(preferences);
        return response;
    } catch (error) {
        console.log(error); // Failure
        throw error;
    }
}


export async function getCurrentPreferences(): Promise<object> {
    try {
        const response = await account.getPrefs();
        return response;
    } catch (error) {
        console.log(error); // Failure
        throw error;
    }
}



export function handleWatchlistDelete({ id }: { id: string }) {
    toast.promise(database.deleteDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, id), {
        loading: 'Deleting...',
        success: (res) => {
            console.log({ res })
            return `Deleted "${id}" from your watchlist!`
        }
        ,
        error: (res) => {
            console.error({ res })
            return `Oops! There was an error deleting "${id}" from your watchlist.\n\nError: ${res.response.message} `
        },
    })
}