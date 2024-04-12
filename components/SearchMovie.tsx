'use client'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import MediaSearchCard from "./MediaSearchCard"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { Skeleton } from "./ui/skeleton"
import SkeletonMediaSearchCard from "./skeletons/SkeletonMediaSearchCard"
import NewSearchCard from "@/components/NewSearchCard"


const SearchMovie = ({
    resultsLength=10
    // query
}: {
    resultsLength?: number
        // query:string
        
    }) => {
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<TMDBMultiSearchResult[]>([])
    // const [isPhoneScreen, setIsPhoneScreen] = useState(false);

    // useEffect(() => {
    //     const mediaQuery = window.matchMedia('(max-width: 768px)'); // Example media query for phone size

    //     // Check if the media query matches initially
    //     setIsPhoneScreen(mediaQuery.matches);

    //     // Add event listener to update state when screen size changes
    //     const handleScreenSizeChange = () => {
    //         setIsPhoneScreen(mediaQuery.matches);
    //     };
    //     mediaQuery.addListener(handleScreenSizeChange);
    //     console.log({isPhoneScreen})
    //     // Clean up the event listener
    //     return () => {
    //         mediaQuery.removeListener(handleScreenSizeChange);
    //     };
    // }, [])

    useEffect(() => {
        setLoading(true)
        
        movieList()
        
        
    }, [query])
    const movieList = async () => {
        setResults([])

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`
            }
        };

        const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}`, options)
            .then(res => res.json())
            .then(data => setResults(data.results))
            .catch(error => console.log(error))
        setLoading(false)
        console.log({ loading })
        console.log({ query })
    }




    return (
        <div className="p-3 flex flex-col items-center">
            <h1 className="text-3xl mb-4">Search Movies & TV</h1>

            <Input
                placeholder="Movie, TV Show, Person..."
                value={query}
                className="bg-white/90  text-black w-80"
                onChange={(e) => {

                    setQuery(e.target.value)

                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        movieList()
                    }
                }}
            />
            <div className="flex gap-2">

                <Button
                    className="my-5 w-24 align-middle"
                    onClick={() => movieList()}
                >
                    Search
                </Button>
                <Button
                    variant="secondary"
                    className="my-5 w-24 align-middle"
                    onClick={() => setResults([])}
                >
                    Clear
                </Button>
            </div>



            {
                results.length > 0 &&
                     
                                                                               
                <div className="p-3 my-4 w-full">
                   
                                <div className="flex flex-col lg:flex-row lg:flex-wrap justify-center gap-4 items-center place-items-center lg:w-full m-auto">
                                    {loading ? (

                                        <SkeletonMediaSearchCard />

                                    ) : (
                                   

                                        results.slice(0, resultsLength).map((result) => (
                                            <NewSearchCard key={result.id} media={result} />
                                        ))
                                    )}
                                </div>

    

                </div>
                // )

            }

           


        </div>
    )
}

export default SearchMovie
