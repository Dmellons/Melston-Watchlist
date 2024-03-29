import { WatchlistDocumentCreate } from '@/types/appwrite';
import { AutocompleteResult } from '@/types/watchmodeApi';
import { Client, Account, Databases, ID } from 'appwrite';
import { toast } from 'sonner';

export const client = new Client();


client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)

export const account = new Account(client);
export const database = new Databases(client)
export { ID,  type Models } from 'appwrite';

// export function handleAddWatchlist({ media }: { media: AutocompleteResult }) {

//     const data:WatchlistDocumentCreate = {
//         title: media.name,
//         content_type: media.type,
//         tmdb_id: media.tmdb_id,
//         imdb_id: media.imdb_id,
//         tmdb_type: media.tmdb_type,
//         year: media.year,
//         image_url: media.image_url   
//     }

//     // const promise = database.createDocument('watchlist', 'watchlist', ID.unique(), data).catch((error) => {
//     //     console.error(error)
//     // })
    
//     toast.promise(database.createDocument('watchlist', 'watchlist', ID.unique(), data), {
//         loading: 'Adding...',
//         success: (res) => {
//             console.log({res})
//             return `Added "${media.name}" to your watchlist!`
//         }
//             ,
//         error: (res) => {
//             console.error({res})
//             return`Oops! There was an error adding "${media.name}" to your watchlist.\n\nError: ${res.response.message} `
//         },
//     })


// }

export function handleWatchlistDelete({ id }: { id: string }) {
    toast.promise(database.deleteDocument('watchlist', 'watchlist', id), {
        loading: 'Deleting...',
        success: (res) => {
            console.log({res})
            return `Deleted "${id}" from your watchlist!`
        }
            ,
        error: (res) => {
            console.error({res})
            return`Oops! There was an error deleting "${id}" from your watchlist.\n\nError: ${res.response.message} `
        },
    })
}