import { getLoggedInUser } from "@/lib/server/appwriteServer"

export default async function AccountPage() {

    const user = await getLoggedInUser()
    console.log({user})

    return (
        <div>
            <h2 className="text-2xl mb-4">Account</h2>
            <p className="text-gray-500">Coming Soon</p>
            {user && <p>{user.email}</p>}
        </div>
    )
}