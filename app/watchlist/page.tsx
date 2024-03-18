'use client'
import { useUser } from "@/hooks/User";
import { account } from "@/lib/appwrite";
const WatchlistPage = () => {

    async function asyncUser() {
        const user = await account.get()
        console.log(user)
    }
    asyncUser()
    const { user } = useUser()
    const user2 = asyncUser()
    console.log(user)
    console.log(user2)
    return (
        <div>
            <h1 className="text-3xl font-bold">Watchlist</h1>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
            </ul>
            {
               user ? (
                
                    <p>{JSON.stringify(user.debug)}</p>
                ) : (
                    <p>You are not logged in</p>
                )
            }
        </div>
    );
};

export default WatchlistPage;
