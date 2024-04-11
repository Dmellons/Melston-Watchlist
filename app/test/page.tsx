'use client'
import { useUser } from "@/hooks/User"
import AddWatchlist from "@/components/buttons/AddWatchlist"
import SearchMovie from "@/components/SearchMovie"
import NewSearchCard from "@/components/NewSearchCard"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"

function TestPage() {
    const { user } = useUser()
    const movie:TMDBMultiSearchResult = {
        id: 0,
        title: "The Godfather",
        overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        media_type: "movie",
        release_date: "1972-03-14",
        adult: false,
        backdrop_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        original_language: 'en',
         original_title: "The Godfather",
         video: false,
         vote_average: 0,
         vote_count: 0

    }

    return (
        <div className="flex flex-col items-center w-full h- justify-center">
            <NewSearchCard media={movie}/>
        </div>
    )
}

export default TestPage