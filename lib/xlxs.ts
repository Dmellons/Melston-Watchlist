import { PlexRequest } from '@/app/admin/columns'
import { Table } from '@tanstack/react-table'
import xlsx, { IJsonSheet } from 'json-as-xlsx'
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

    let columns: IJsonSheet[] = [
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
    let settings = {
        fileName: 'Plex Requests', // Name of the resulting spreadsheet
    }
    xlsx(columns, settings)
}