
import AdminGatekeeper from "@/components/GateKeeper";
import { client, sdkAccount, skdDatabases, sdkUsers } from "@/lib/appwriteServer"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"




async function AdminPage() {
    const data = await skdDatabases.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID);
    const users = await sdkUsers.list()
    console.log(data);

    
    return (
        <AdminGatekeeper>
            <main className="flex min-h-screen flex-col m-auto sm:p-18">
                {users.users.map((user) => (
                    <div
                        key={user.$id}
                        className="flex flex-col justify-start items-left sm:p-18  mb-2 px-4"
                    >


                        <h2 className="text-2xl justify-start text-left border-b-2 border-primary">{user.email}</h2>
                        <p className="text-sm text-foreground/50 align-baseline">{user.name}</p>
                        {data.documents
                            .filter(doc => (doc.$permissions.includes(`update("user:${user.$id}")`)))
                            .map((document) => (
                                <div key={document.$id}>
                                    <p>{document.title}</p>
                                </div>
                            ))}

                        {data.documents
                            .filter(doc => (doc.$permissions.includes(`update("user:${user.$id}")`)))
                            // doc.$permissions.includes(`read("user:${user.$id}")update("user:${user.$id}")delete("user:${user.$id}")`)
                            .map((document) => (
                                <div key={document.$id}>
                                    <p>{document.$permissions}</p>



                                </div>
                            ))}
                    </div>
                ))}

            </main >
        </AdminGatekeeper>
    )
}

export default AdminPage
