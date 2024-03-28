export type AutocompleteResult = {
    id: number
    image_url: string
    imdb_id: string
    name: string
    relevance: number
    result_type: string
    tmdb_id: number
    tmdb_type: string
    type: string
    year: number
}

export type WatchmodeApi<T> = {
    results: T[]
}