"use client"

import { Check, SearchIcon } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import { Separator } from "./ui/separator"
import ImageWithFallback from "./ImageWithFallback"

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

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TMDBMultiSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [moreResults, setMoreResults] = useState(false)
  const [resultsLength, setResultsLength] = useState(5)

  useEffect(() => {
    setLoading(true)
    const movieList = async () => {
      // setLoading(false)
      // setResults([])
      console.log(query)
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}`, tmdbFetchOptions)
        .then(res => res.json())
        .then(data => {
          console.log(data)
          setResults(data.results)
          setMoreResults(data.results.length > resultsLength)

        })
        // .then(() => setLoading(false))
        .catch(error => console.log(error))
      setLoading(false)

    }

    movieList()
    // setShowResults(!query.length > 0)
    // setIsDialogOpen(query !== "" && results.length === 0)


  }, [query])

  console.log(results)
  // const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SearchIcon strokeWidth={4} className="ml-2 h-4 w-4 shrink-0 opacity-80 " />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            value={query}

            onValueChange={(e) => setQuery(e)}
            placeholder="Movies, TV..." />
          {showResults &&
            <CommandList>
              {/* <CommandEmpty>No framework found.</CommandEmpty> */}
              <CommandGroup>
                {results.map((result) => {
                  const name = result.title || result.name

                  return (

                    <CommandItem
                      key={result.id}
                      value={name}
                    // onSelect={(currentValue) => {
                    //   setValue(currentValue === value ? "" : currentValue)
                    //   setOpen(false)
                    // }}
                    >
                      <div className="ml-2 flex gap-2">
                        {/* <ImageWithFallback
                          src={`https://image.tmdb.org/t/p/w500${result.poster_path}`
                  // alt=`${result.title || result.name} poster`}
                  /> */}

                        {name}
                      </div>
                      {/* <Separator /> */}
                    </CommandItem>
                  )
                }
                )}
              </CommandGroup>
            </CommandList>
          }
        </Command>
      </PopoverContent>
    </Popover>
  )
}


