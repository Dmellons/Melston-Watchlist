'use client'
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useEffect, useState } from "react"

type School = {
    sc: string
    name: string
  }
const SearchBar = () => {

    const [open, setOpen] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
    return (
        <div>
            <SearchResultsBox setOpen={setOpen} setSelectedSchool={setSelectedSchool} />
        </div>
    )
}

function SearchResultsBox({
    setOpen,
    setSelectedSchool,
  }: {
    setOpen: (open: boolean) => void
    setSelectedSchool: (school: string | null) => void
  }) {

    const [searchResults, setSearchResults] = useState<School[] | null>(null)
      useEffect(() => {
        //   setOpen(true)
            const schools: School[] = [
                
                {
            
          sc: "1",
          name: "SLUSD District School",
        },
        {
          sc: "2",
          name: "Garfield Elementary School",
        },
        {
          sc: "3",
          name: "Jefferson Elementary School",
        },
        {
          sc: "4",
          name: "Madison Elementary School",
        },
        {
          sc: "5",
          name: "McKinley Elementary School",
        },
        {
          sc: "6",
          name: "Monroe Elementary School",
        },
        {
          sc: "7",
          name: "Roosevelt Elementary School",
        },
        {
          sc: "8",
          name: "Washington Elementary School",
        },
        {
          sc: "9",
          name: "Halkin Elementary School",
        },
        {
          sc: "11",
          name: "Bancroft Middle School",
        },
        {
          sc: "12",
          name: "John Muir Middle School",
        },
        {
          sc: "15",
          name: "Lincoln High School",
        },
        {
          sc: "16",
          name: "San Leandro High school",
        },
        {
          sc: "50",
          name: "Non-Public School",
        },
        {
          sc: "60",
          name: "SLVA Elementary",
        },
        {
          sc: "61",
          name: "SLVA Middle",
        },
        {
          sc: "62",
          name: "SLVA High",
        },
      ]
      const results = schools
      setSearchResults(results)

    }, [])


    return (
      <Command>
        <CommandInput placeholder="Filter status..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {searchResults && searchResults.map((status) => (
              <CommandItem
                key={status.sc}
                value={status.sc}
                onSelect={(value) => {
                    console.log(value)
                  setSelectedSchool(
                    searchResults.find((school) => school.sc === value) || null
                  )
                //   setOpen(false)
                }}
              >
                {status.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    )
  }


export default SearchBar