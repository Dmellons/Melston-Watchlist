"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/DataTablePagination"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { downloadToExcel } from "@/lib/xlxs"
import { PlexRequest } from "./columns"
import { SelectTrigger } from "@radix-ui/react-select"
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  // const [plexRequests, setPlexRequests] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  useEffect(() => {
    setColumnVisibility({ requested: true })
    setColumnFilters([{ id: "requested", value: true }])
  }, [])

  const table = useReactTable<PlexRequest>({
    // @ts-ignore
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    }
  })
  console.log({ rowSelection })
  console.log({ table })

  function handleEmailFilterChange(e) {
    return table.getColumn("email")?.setFilterValue(e.target.value)
  }

  function getUniqueValues(data: PlexRequest[], key: string) {
    const uniqueValues = new Set()
    data.forEach((row) => {
      if (key in row) {
        uniqueValues.add(row[key]);
      }
    });

    return Array.from(uniqueValues);
  }


  return (
    <div>

      <div className="flex py-4 justify-between ">
        {/* Filters */}
        <div className="bg-card mt-4 rounded-lg">
          <div className="p-4">
            <h2 className="text-lg font-bold">Filters</h2>
          </div>
          <div className="px-4 py-2">
            <Input
              placeholder="Filter by email..."
              value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
              onChange={e => handleEmailFilterChange(e)}
              className="max-w-sm shadow-sm rounded-md border-gray-300 px-3 py-2"
            />
            {/* <Select>
              <SelectTrigger
                className="h-8 w-[70px] bg-slate-400"
              >
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent>
                {

                  console.log(table.getColumn("email")?.getFilterValue() as string)
                    .map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select> */}

            {/* <DataTableEmailFilter /> */}
            <div className="flex items-center mt-4">
              <Label className="ml-2" htmlFor="request-filter">Plex Requests Only</Label>
              <Switch
                id="request-filter"
                checked={(table.getColumn("requested")?.getFilterValue() as boolean) ?? false}
                onCheckedChange={(e) => {
                  if (table.getColumn("requested")?.getFilterValue() as boolean) {
                    table.getColumn('requested')?.setFilterValue(undefined)
                    return
                  }
                  table.getColumn('requested')?.setFilterValue(true)
                }}
                className="ml-2 rounded-full ring-2 ring-primary"
              />
            </div>
            <Button
              // variant="primary"
              className="mt-4 bg-green-500 hover:bg-green-600 text-gray-900
               font-bold"
              onClick={() => downloadToExcel(table)}
            >
              Export to Excel
            </Button>
          </div>
        </div>
        <div className="h-100%">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2">

        <DataTablePagination table={table} />
      </div>

    </div>
  )
}
