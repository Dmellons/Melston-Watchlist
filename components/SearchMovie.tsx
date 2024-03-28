import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import MediaSearchCard from "./MediaSearchCard"
import { AutocompleteResult, WatchmodeApi } from "@/types/watchmodeApi"

const SearchMovie = ({
    // query
}: {
        // query:string
    }) => {


    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<AutocompleteResult[]>([])

    const movieList = async () => {
        /*
        * Set this to 1 to include titles and people in results. 
        Set this to 2 to include titles only. 
        Set this to 3 to include movies only. 
        Set this to 4 to include TV only. 
        Set this to 5 to include people only. 
        By default this is set to 1
        *
        */
        const res = fetch(`https://api.watchmode.com/v1/autocomplete-search?apiKey=${process.env.NEXT_PUBLIC_WATCHMODE_API_KEY}&search_value=${query}&search_type=1`)
            .then(res => res.json())
            .then(data => setResults(data.results))
            .catch(error => console.log(error))

        console.log(results)
    }

    useEffect(() => {
        console.log({ results })

    }, [results])

    return (
        <div className="p-3 flex flex-col items-center">
            <h1 className="text-3xl mb-4">Search Movies & TV</h1>

            <Input
                placeholder="Search Movie"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button
                className="my-5 w-24 align-middle"
                onClick={() => movieList()}
            >
                Search
            </Button>
            <div className="p-3 my-4 w-full">
                {results.length === 0 && <div>No results</div>}
                {results.length > 0 &&
                    <>
                        <h2>Results!</h2>
                        <div className="flex flex-col gap-4">
                            {results.map((result) => (
                                <MediaSearchCard key={result.tmdb_id} media={result} />
                            ))}
                        </div>
                    </>
                }
            </div>

        </div>
    )
}

export default SearchMovie
