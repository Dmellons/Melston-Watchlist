'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Check, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"
import { database } from "@/lib/appwrite"
import { toast } from "sonner"


export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}



export type PlexRequest = {
    title: string
    email: string | null
    // status: string
    tmdb_id: number
    tmdb_type: string
    requested: boolean
    date: string
    id: string
    
}

export const columns: ColumnDef<PlexRequest, unknown>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <Button 
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        }
    },
    {
        accessorKey: 'email',
        header: ({ column }) => {
            return (
                <Button 
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        }
    },
    {
        accessorKey: 'tmdb_type',
        header: 'Media Type'
    },
    // {
        //     accessorKey: 'status',
        //     header: 'Status'
        // }, 
        {
            accessorKey: 'tmdb_id',
            header: 'TMDB ID'
        },
        {
            accessorKey: 'requested',
            header: 'Requested',
            cell: ({ row }) => {
                if (row.getValue('requested') === true) {
                    return <Check className="h-4 w-4 text-emerald-500" />
                } else {
                    return null
                }
        }
    },
    {
        accessorKey: 'date',
        header: ({ column }) => {
            return (
                <Button 
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({ row }) => {
            return new Date(row.getValue('date')).toLocaleDateString('en-CA')
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const media = row.original
            
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(media.tmdb_id.toString())}
                        >
                            Copy tmdb ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/${media.tmdb_type}/${media.tmdb_id}`}>
                            <DropdownMenuItem
                                onClick={() => redirect(`/${media.tmdb_type}/${media.tmdb_id}`)}
                            >View detail page</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                            className='bg-destructive text-destructive-foreground'
                            onClick={() => {
                                const id = media.id
                                toast.promise(
                                    
                                    database.deleteDocument('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID, id)
                                    ,
                                    {
                                        loading: 'Deleting...',
                                        success: () => {
                                            return 'Request deleted'
                                        },
                                        error: (error) => {
                                            console.error({ error })
                                            return 'Oops! There was an error deleting the request. Error: ' + error
                                        }
                                    }

                                )
                            }}
                        >Delete Request</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]