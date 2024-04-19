'use client'
import { useUser } from "@/hooks/User"
import AddWatchlist from "@/components/buttons/AddWatchlist"
import SearchMovie from "@/components/SearchMovie"
import NewSearchCard from "@/components/NewSearchCard"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import Image from "next/image"
import NewWatchlistCard from "@/components/NewWatchlistCard"
import { Button } from "@/components/ui/button"
import { account } from "@/lib/appwrite"
import ProvidersSelect from "@/components/ProvidersSelect"

export async function asyncFunc(): Promise<void> {
    const session = await account.getSession('current')
    console.log(session)
}
function TestPage() {
    const { user, } = useUser()

    

    const movie: TMDBMultiSearchResult =
    {
        "backdrop_path": "/8rpDcsfLJypbO6vREc0547VKqEv.jpg",
        "id": 76600,
        "original_title": "Avatar: The Way of Water",
        "overview": "Set more than a decade after the events of the first film, learn the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
        "poster_path": "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        "media_type": "movie",
        "adult": false,
        "title": "Avatar: The Way of Water",
        "original_language": "en",
        "genre_ids": [
            878,
            12,
            28
        ],
        "popularity": 215.037,
        "release_date": "2022-12-14",
        "video": false,
        "vote_average": 7.626,
        "vote_count": 11152
    }


    return (
        <main className="flex min-h-screen flex-col items-center p- sm:p-18">
            {user && user?.admin &&
            <>
            <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={async () => {
                const ueserSession = await asyncFunc()
                console.log({ueserSession})
            }}>
                Test
            </Button>
            <Button 
                onClick={() => {
                    account.updatePrefs({ providers: [] })
                }}
            >Clear Perfs</Button>

            <ProvidersSelect  />
                </>
        }
        </main>
    )
}

export default TestPage