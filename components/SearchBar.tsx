'use client'
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useEffect, useState } from "react"
import { tmdbFetchOptions } from "@/lib/tmdb"
import { TMDBMultiSearchResult } from "@/types/tmdbApi"
import NewSearchCard from "@/components/NewSearchCard"
import { useUser } from "@/hooks/User"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { SearchIcon } from "lucide-react"

type School = {
  sc: string
  name: string
}
const SearchBar = ({
  resultsLength = 10
  // query
}: {
  resultsLength?: number
  // query:string

}) => {

  const [open, setOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  return (
    <div>
      <SearchResultsBox setOpen={setOpen} setSelectedSchool={setSelectedSchool} />
    </div>
  )
}

function SearchResultsBox({
  resultsLength = 10
  // query
}: {
  resultsLength?: number
  // query:string

}) {

  const [searchResults, setSearchResults] = useState<School[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState<string>("")
  const [results, setResults] = useState<TMDBMultiSearchResult[]>([])
  const [moreResults, setMoreResults] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)


  const { user } = useUser()

  // useEffect(() => {
  //   //   setOpen(true)
  //   const schools: School[] = [

  //     {

  //       sc: "1",
  //       name: "SLUSD District School",
  //     },
  //     {
  //       sc: "2",
  //       name: "Garfield Elementary School",
  //     },
  //     {
  //       sc: "3",
  //       name: "Jefferson Elementary School",
  //     },
  //     {
  //       sc: "4",
  //       name: "Madison Elementary School",
  //     },
  //     {
  //       sc: "5",
  //       name: "McKinley Elementary School",
  //     },
  //     {
  //       sc: "6",
  //       name: "Monroe Elementary School",
  //     },
  //     {
  //       sc: "7",
  //       name: "Roosevelt Elementary School",
  //     },
  //     {
  //       sc: "8",
  //       name: "Washington Elementary School",
  //     },
  //     {
  //       sc: "9",
  //       name: "Halkin Elementary School",
  //     },
  //     {
  //       sc: "11",
  //       name: "Bancroft Middle School",
  //     },
  //     {
  //       sc: "12",
  //       name: "John Muir Middle School",
  //     },
  //     {
  //       sc: "15",
  //       name: "Lincoln High School",
  //     },
  //     {
  //       sc: "16",
  //       name: "San Leandro High school",
  //     },
  //     {
  //       sc: "50",
  //       name: "Non-Public School",
  //     },
  //     {
  //       sc: "60",
  //       name: "SLVA Elementary",
  //     },
  //     {
  //       sc: "61",
  //       name: "SLVA Middle",
  //     },
  //     {
  //       sc: "62",
  //       name: "SLVA High",
  //     },
  //   ]
  //   const results = schools

  //   setSearchResults(results)

  // }, [])


  useEffect(() => {
    setLoading(true)

    movieList()
    setIsDialogOpen(query !== "" && results.length === 0)


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
        console.log(data)
        setResults(data.results)
        setMoreResults(data.results.length > resultsLength)
      })
      // .then(() => setLoading(false))
      .catch(error => console.log(error))
    setLoading(false)

  }


  return (
    // <div className="flex justify-center w-full h-full">
    <Popover open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <PopoverTrigger >
        <Button
          variant="outline"
          className="w-32"
        >
        <SearchIcon className="w-6 h-6" />
          Search
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="right" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder="Movie or TV Show..." value={query}
            className=" text-muted-foreground sm:w-72 rounded-md p-2"
            onChangeCapture={(e) => {

              setQuery(e.target.value)

            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                movieList()
              }
            }}
          />
          <CommandList
            className="max-h-[600px] bg-transparent overflow-y-auto"


          // className="grid grid-cols-2 sm:flex w-4/5  justify-center gap-4 items-center place-items-center lg:w-full m-auto"
          >

            {results && results.slice(0, resultsLength).map((result) => (


              <div key={result.id}
                className="w-full p-2 m-auto bg-muted/10 hover:bg-muted/80 rounded-md cursor-pointer"
              >
                <NewSearchCard media={result} userProviders={user?.providers} />
                <CommandItem
                  key={result.id}
                  value={result.id.toString()}
                >
                  {result.name}
                </CommandItem>
              </div>

            ))}
            {/* {results.slice(0, resultsLength).map((result) => (
          <CommandItem key={result.id} value={result.id.toString()}>
          
          </CommandItem>
        ))} */}

          </CommandList>
        </Command>
      </PopoverContent>
    </Popover >
    // </div>
  )
}


export default SearchBar