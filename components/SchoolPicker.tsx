"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/MediaQuery"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Status = {
  value: string
  label: string
}
type School = {
  sc: string
  name: string
}
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
const statuses: Status[] = [
  {
    value: "backlog",
    label: "Backlog",
  },
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in progress",
    label: "In Progress",
  },
  {
    value: "done",
    label: "Done",
  },
  {
    value: "canceled",
    label: "Canceled",
  },
]

export function SchoolPicker() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(
    null
  )

  console.log({ selectedStatus: selectedSchool })

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selectedSchool ? <>{selectedSchool.name}</> : <>+ Set status</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList setOpen={setOpen} setSelectedStatus={setSelectedSchool} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {selectedSchool ? <>{selectedSchool.label}</> : <>+ Set status</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StatusList setOpen={setOpen} setSelectedStatus={setSelectedSchool} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatusList({
  setOpen,
  setSelectedStatus,
}: {
  setOpen: (open: boolean) => void
  setSelectedStatus: (status: School | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {schools.map((status) => (
            <CommandItem
              key={status.sc}
              value={status.sc}
              onSelect={(value) => {
                setSelectedStatus(
                  schools.find((priority) => priority.sc === value) || null
                )
                setOpen(false)
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
