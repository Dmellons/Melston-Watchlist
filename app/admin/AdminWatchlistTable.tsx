import { DataTable } from "@/app/admin/data-table";
import { columns, type PlexRequest } from './columns';
import { createAdminClient,  getLoggedInUser } from "@/lib/server/appwriteServer";
import { WatchlistDocument } from "@/types/appwrite";
import { Models } from "appwrite";
import { Models as ServerModels } from "node-appwrite";
import { redirect } from "next/navigation";


export function requestingUser(appUsers: ServerModels.UserList<Models.Preferences>, document: WatchlistDocument): string {
    let requester:string = 'unknown'
    appUsers.users.forEach(u => {

        if (document.$permissions.includes(`update("user:${u.$id}")`)) {
            requester = u.email
            return
        } 
    })

    return requester 
}

export default async function AdminWatchlistTable() {
    const { databases, users } = await createAdminClient()
    const appUsers = await users.list()
    const user = await getLoggedInUser()
    if (!user || user.admin !== true) {
        redirect('/')
    }


    const watchlist: Models.DocumentList<WatchlistDocument> = await databases?.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID)
    const data: PlexRequest[] = watchlist.documents.map((item) => {
        const requester = requestingUser(appUsers, item)

        return {
            title: item.title,
            email: requester,
            // status: item.status,
            added: item.added,
            tmdb_id: item.tmdb_id,
            requested: item.plex_request,
            date: item.$createdAt,
            id: item.$id,
            tmdb_type: item.tmdb_type,
        }
    })

    return (
        <section className='pt-6'>
            <div className="container">
                <h1 className="text-3xl font-bold mb-2">Plex Requests</h1>
                <DataTable columns={columns} data={data} suppressHydrationWarning  />
            </div>
        </section>
    )
}