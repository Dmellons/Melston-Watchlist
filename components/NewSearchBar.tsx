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
import { useUser } from "@/hooks/User"
import { tmdbFetchOptions } from "@/lib/tmdb"
import GenreFilterDropdown from "./GenreFilterDropdown"

import { ScrollArea } from "./ui/scroll-area"
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { IconButton } from "./ui/button";

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

const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
]

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










    //   const [open, setOpen] = useState(false)
    //   const [value, setValue] = useState("")

    //   return (
    //     <Popover open={open} onOpenChange={setOpen}>
    //       <PopoverTrigger asChild>
    //         <Button
    //           variant="outline"
    //           role="combobox"
    //           aria-expanded={open}
    //           className="w-[200px] justify-between"
    //         >
    //           {value
    //             ? frameworks.find((framework) => framework.value === value)?.label
    //             : "Select framework..."}
    //           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    //         </Button>
    //       </PopoverTrigger>
    //       <PopoverContent className="w-[200px] p-0">
    //         <Command>
    //           <CommandInput placeholder="Search framework..." />
    //           <CommandEmpty>No framework found.</CommandEmpty>
    //           <CommandGroup>
    //             {
    //             frameworks.length > 0 && frameworks.map((framework) => (
    //                 console.log(framework),
    //               <CommandItem
    //                 key={framework.value}
    //                 value={framework.value}
    //                 onSelect={(currentValue) => {
    //                   setValue(currentValue === value ? "" : currentValue)
    //                   setOpen(false)
    //                 }}
    //               >
    //                 <Check
    //                   className={cn(
    //                     "mr-2 h-4 w-4",
    //                     value === framework.value ? "opacity-100" : "opacity-0"
    //                   )}
    //                 />
    //                 {framework.label}
    //               </CommandItem>
    //             ))}
    //           </CommandGroup>
    //         </Command>
    //       </PopoverContent>
    //     </Popover>
    //   )

    const isDesktop = useMediaQuery("(min-width: 768px)")
    console.log(isDesktop)


    return (


        // <div className="w-full  absolute sm:flex top-0 z-10 font-normal">

        <div className="flex flex-col gap-2 items-center w-full">

            <Popover


                className=" w-full"
                onOpenChange={(e) => console.log(e)}
            // onOpenAutoFocus={(e) => e.preventDefault()}
            >

                <PopoverTrigger

                    className="w-full"

                >

                    <div className="flex flex-col m-auto gap-1 sm:gap-2 sm:flex-row items-center w-2/5 my-5  ">
                        {isDesktop &&
                            <>
                                <SearchIcon className="h-5 w-5" />
                                <Input

                                    placeholder="Movie or TV Show..."
                                    value={query}
                                    className="bg-muted/90  text-muted-foreground  focus:w-full  transition  h-8 rounded-md p-2"
                                    onFocusCapture={() => setIsDialogOpen(true)}
                                    onFocus={() => setIsDialogOpen(true)}
                                    onChange={(e) => {

                                        setQuery(e.target.value)
                                        console.log(results.length)
                                        console.log(e.target.value !== "" && results.length === 0)
                                        setIsDialogOpen(((e.target.value !== "") && (results.length === 0)))

                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                            movieList()
                                        }
                                    }} />
                            </>
                        }
                        {!isDesktop &&
                            <div className="group flex flex-col items-center">
                                <SearchIcon className="h-5 w-5 " />
                                <Input

                                    placeholder="Search..."
                                    value={query}
                                    className="bg-muted/90   w-2/5 h-0focus:w-4/5 focus:h-8 text-muted-foreground  rounded-md p-2 "
                                    onFocusCapture={() => setIsDialogOpen(true)}
                                    onFocus={() => setIsDialogOpen(true)}
                                    onChange={(e) => {

                                        setQuery(e.target.value)
                                        console.log(results.length)
                                        console.log(e.target.value !== "" && results.length === 0)
                                        setIsDialogOpen(((e.target.value !== "") && (results.length === 0)))

                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                            movieList()
                                        }
                                    }} />
                            </div>
                        }


                        {/* <Button
                    className="w-18 align-middle h-8 ml-2"
                    onClick={() => movieList()}
                >
                    Search
                </Button> */}
                        {/* <Button
                            variant="secondary"
                            className="w-24 align-middle ml-4 h-8 bg-destructive/50 hover:bg-destructive/80 text-danger-foreground"
                            onClick={() => setResults([])}
                        >
                            Clear
                        </Button> */}
                    </div>
                </PopoverTrigger>

                {/* <GenreFilterDropdown setFilter={setGenreFilter} /> */}
                <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-full bg-transparent shadow-none border-none p-0 m-0"
                >
                    {
                        (
                            (results.length > 0 && !loading) || (results.length > 0 && isDialogOpen)) &&
                        // <div id="search-popover" popover="auto" popovertargetaction="show" >



                        <div
                            className="w-4/5 bg-card/80 rounded-lg py-4 px-2 sm:px-4 mx-4 sm:m-auto shadow-xl shadow-black ">

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
                                        <Button
                                            asChild
                                            variant="link"
                                            disabled
                                            className=" col-span-2 sm:col-span-1text-foreground/60 hover:text-foreground/80 cursor-pointer"
                                        >
                                            <Link href="" >
                                                More Results...
                                                <br />
                                                (Coming Soon)
                                            </Link>
                                        </Button>
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
