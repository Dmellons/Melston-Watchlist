import { PlexRequest } from '@/app/admin/columns'
import { Table } from '@tanstack/react-table'
import xlsx, { IJsonSheet } from 'json-as-xlsx'
import { WatchlistDocument } from '@/types/appwrite'

/**
 * Export a user's watchlist documents to an .xlsx file (client-side download).
 * Works directly off the documents already in the useUser context — no fetch.
 */
export function exportWatchlistToExcel(
    documents: WatchlistDocument[],
    fileName = 'My Watchlist',
) {
    const columns: IJsonSheet[] = [
        {
            sheet: 'Watchlist',
            columns: [
                { label: 'Title', value: 'title' },
                { label: 'Type', value: (row: any) => row.content_type ?? '' },
                { label: 'TMDB ID', value: (row: any) => row.tmdb_id ?? '' },
                { label: 'IGDB ID', value: (row: any) => row.igdb_id ?? '' },
                { label: 'Watch Status', value: (row: any) => row.watch_status ?? '' },
                { label: 'Rating', value: (row: any) => (row.rating ?? '') },
                { label: 'Favorite', value: (row: any) => (row.is_favorite ? 'Yes' : 'No') },
                { label: 'Plex Requested', value: (row: any) => (row.plex_request ? 'Yes' : 'No') },
                { label: 'Release Date', value: (row: any) => row.release_date ?? '' },
                {
                    label: 'Date Watched',
                    value: (row: any) =>
                        row.date_watched ? new Date(row.date_watched).toLocaleDateString() : '',
                },
                {
                    label: 'Added',
                    value: (row: any) =>
                        row.$createdAt ? new Date(row.$createdAt).toLocaleDateString() : '',
                },
            ],
            content: documents as any[],
        },
    ]

    xlsx(columns, { fileName })
}
export function downloadToExcel(
    table: Table<PlexRequest>,
    // exportAll: boolean
){
    
    const { data } = table.options
    const { rowSelection, columnFilters, columnVisibility } = table.options.state
    // console.log(exportAll)

    let filteredData: PlexRequest[] = table.getRowModel().rows.map((row) => row.original)

    // if (!exportAll) {

        if (columnFilters && columnFilters.length > 0) {
            filteredData = table.getFilteredRowModel()
                .rows.map((row) => row.original)

            console.log({ filteredData })

        }
        console.log(table.getSelectedRowModel().rows.length)
        if (rowSelection && table.getSelectedRowModel().rows.length > 0) {
            console.log(rowSelection)
            filteredData = table.getSelectedRowModel()
                .rows.map((row) => row.original)
            console.log({ filteredData })
        }
    // }

    const columns: IJsonSheet[] = [
        {
            sheet: 'Plex Requests',
            columns: [
                { label: 'Title', value: 'title' },
                { label: 'Email', value: 'email' },
                { label: 'TMDB ID', value: 'tmdb_id' },
                { label: 'TMDB Type', value: 'tmdb_type' },
                { label: 'Requested', value: 'requested' },
                { label: 'Date', value: (row: any) => row.date ? new Date(row.date).toLocaleDateString() : '' },
            ],
            content: filteredData
        }

    ]
    const settings = {
        fileName: 'Plex Requests', // Name of the resulting spreadsheet
    }
    xlsx(columns, settings)
}