'use client'
import { tmdbFetchOptions } from "@/lib/tmdb"
import { Dispatch, SetStateAction, useEffect } from "react"

const GenreFilterDropdown = ({
    setFilter
}: {
    setFilter:Dispatch<SetStateAction<number[]>>
}) => {
    const [movieGenres, setMovieGenres] = useState<any[]>([])
    useEffect(() => {
        console.log({setFilter})
        const fetchMovieGenres = async () => {
            const mGenres = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', tmdbFetchOptions)
            .then(res => res.json())
            console.log({mGenres})
            return mGenres
        }
        
        const movieGenres = fetchMovieGenres()
        
    }, [setFilter])
        console.log(movieGenres)

    // useEffect(() => {
    //     async function fetchMovieGenres(){
    //         const movieGenres =(await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', tmdbFetchOptions)).json()
    //         console.log({movieGenres})
    //         return movieGenres
    //     } 
    //         // .then(res => res.json())
    //     fetchMovieGenres()

    // }, [setFilter])
    return (
        <div className="dropdown dropdown-end">
            <label
                tabIndex={0}
                className="btn btn-ghost btn-circle"
                onClick={setFilter}
            >
                {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h7"
                    />
                </svg> */}
            </label>
        </div>
    )
}

export default GenreFilterDropdown