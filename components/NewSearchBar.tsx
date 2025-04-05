'use client'
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import MediaSearchCard from "./MediaSearchCard"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { Skeleton } from "./ui/skeleton"
import SkeletonMediaSearchCard from "./skeletons/SkeletonMediaSearchCard"
import NewSearchCard from "@/components/NewSearchCard"
import { useUser } from "@/hooks/User"
import { tmdbFetchOptions } from "@/lib/tmdb"
import GenreFilterDropdown from "./GenreFilterDropdown"

import { ScrollArea } from "./ui/scroll-area"
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";

import { Check, ChevronsUpDown, Search, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"



import Link from "next/link"


import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useMediaQuery } from "@/hooks/MediaQuery"


const NewSearchBar = ({
    resultsLength = 10
    // query
}: {
    resultsLength?: number
    // query:string

}) => {
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<TMDBMultiSearchResult[]>([])
    const [moreResults, setMoreResults] = useState<boolean>(false)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [genreFilter, setGenreFilter] = useState<number[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const { user } = useUser()


    useEffect(() => {
        setLoading(true)

        movieList()
        // setIsDialogOpen(query !== "" && results.length === 0)


    }, [query])
    const movieList = async () => {
        setLoading(false)
        setResults([])

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`
            }
        };

        const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}`, tmdbFetchOptions)
            .then(res => res.json())
            .then(data => {
                setResults(data.results)
                setMoreResults(data.results.length > resultsLength)
            })
            // .then(() => setLoading(false))
            .catch(error => console.log(error))
        setLoading(false)

    }
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            movieList()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent space key from causing issues
        if (e.key === " ") {
            e.stopPropagation()
        }
    }


    const isDesktop = useMediaQuery("(min-width: 768px)")
   
    const resultsMarginTop = isDesktop ? "mt-2" : "mt-14"
    
     
        return (
    
    
            // <div className="w-full  absolute sm:flex top-0 z-10 font-normal">
    
            <div className="flex flex-col gap-2 items-center w-full">
    
                <Popover
    
    
                    className=" w-full"
                    onOpenChange={(e) => console.log(e)}
                onOpenAutoFocus={(e) => e.preventDefault()}
                >
    
                    <PopoverTrigger
    
                        className="w-2/3 mt-2"
    
                    >
    
                        <div className={`flex flex-col m-auto gap-1 sm:gap-2 sm:flex-row items-center sm:w-2/5 ${resultsMarginTop}`}>
                            
                                <> 
                                    {isDesktop ?
                                    <SearchIcon className="h-5 w-5" />
                                     :<></> 
                                    }
                                    <Input
    
                                        placeholder="Movie or TV Show..."
                                        value={query}
                                        ref={inputRef}
                                        className="bg-muted/90  text-muted-foreground  focus:w-full  transition  h-8 rounded-md p-2"
                                        onFocusCapture={() => setIsDialogOpen(true)}
                                        onFocus={() => setIsDialogOpen(true)}
                                        
                                        onChange={(e) => {
    
                                            setQuery(e.target.value)
                                            console.log(results.length)
                                            console.log(e.target.value !== "" && results.length === 0)
                                            setIsDialogOpen(((e.target.value !== "") && (results.length === 0)))
    
                                        }}
                                        onKeyUp={handleKeyUp} 
                                        onKeyDown={handleKeyDown}
                                        />
                                </>
                            
                            
                        </div>
                    </PopoverTrigger>
    
                    {/* <GenreFilterDropdown setFilter={setGenreFilter} /> */}
                    <PopoverContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className={`w-full bg-transparent shadow-none border-none p-0 m-0 mt-2`}
                    >
                        {
                            (
                                (results.length > 0 && !loading) || (results.length > 0 && isDialogOpen)) &&
                            // <div id="search-popover" popover="auto" popovertargetaction="show" >
    
    
    
                            <div
                                className="w-full bg-card/80 rounded-lg py-4 px-2 sm:px-4 sm:m-auto shadow-xl shadow-black ">
    
                                <ScrollArea className=" z-40 w-5/8  h-[350px] sm:h-[600px] sm:max-w-5xl ">
    
    
                                    <div className="grid grid-cols-2 sm:flex  lg:flex-row lg:flex-wrap justify-center gap-4 items-center place-items-center lg:w-full m-auto">
                                        {loading ? (
    
                                            <SkeletonMediaSearchCard />
    
                                        ) : (
    
    
                                            results.slice(0, resultsLength).map((result) => (
                                                <NewSearchCard key={result.id} media={result} userProviders={user?.providers} />
                                            ))
    
    
                                        )
    
                                        }
                                        {moreResults &&
                                            // <Button
                                            //     asChild
                                            //     variant="link"
                                            //     disabled
                                            //     className=" col-span-2 sm:col-span-1text-foreground/60 hover:text-foreground/80 cursor-pointer"
                                            // >
                                                <Link href="" >
                                                    More Results...
                                                    <br />
                                                    (Coming Soon)
                                                </Link>
                                            // </Button>
                                        }
    
                                    </div>
    
                                </ScrollArea>
                            </div>
    
    
                            // </div>
                        }
                    </PopoverContent>
    
                </Popover >
            </div >
            // </div >
        )

    }

export default NewSearchBar
