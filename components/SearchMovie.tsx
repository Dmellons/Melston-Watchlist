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


const SearchMovie = ({
    // query
}: {
        // query:string
    }) => {
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<TMDBMultiSearchResult[]>([])

    const SearchSkeleton = () => {
        const skeletonArray = [1, 2, 3,4,5 ]

        return skeletonArray.map((item) => <SkeletonMediaSearchCard key={item}/>)
    }

    useEffect(() => {
        setLoading(true)
        console.log(loading)
        movieList()

        console.log(loading)
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


            <div className="p-3 my-4 w-full">
                {loading ? (
                    <div className="flex flex-row p-3 gap-4 items-center w-full">
                    <SearchSkeleton />
                    </div>
                ) : (

                    results.length > 0 &&
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full sm:min-w-96" >
                        <AccordionItem value="item-1" >
                            <AccordionTrigger>Results!</AccordionTrigger>
                            <AccordionContent>
                            <div className="grid grid-cols-2 gap-4 items-center place-items-center w-xl">

                                    {results.map((result) => (
                                        <MediaSearchCard key={result.id} media={result} />
                                    ))}
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                )

                }
                {/*
<Carousel >
<CarouselContent >

                        {results.map((result) => (
                            <CarouselItem className="basis-1/4  hover:z-0 pl-4 -ml-4" key={result.id}>
                                <MediaSearchCard key={result.id} media={result} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                 </div> */}
            </div>

        </div>
    )
}

export default SearchMovie
