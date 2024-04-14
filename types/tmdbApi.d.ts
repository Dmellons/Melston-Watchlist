export type TMDBMultiSearchResult = TMDBMovieSearchResult | TMDBTelevisionSearchResult;

export type TMDBTelevisionSearchResult = {
    adult: boolean;
    backdrop_path: string;
    id: number;
    name: string;
    original_language: string;
    original_name: string;
    overview: string;
    poster_path: string;
    media_type: "tv";
    genre_ids: number[];
    popularity: number;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    origin_country: string[];
};
export type TMDBMovieSearchResult = {
    adult: boolean;
    backdrop_path: string;
    id: number;
    title: string;
    original_language: string;
    original_title: string;
    overview: string;
    poster_path: string;
    media_type: "movie";
    genre_ids: number[];
    popularity: number;
    release_date: string;
    video: false;
    vote_average: number;
    vote_count: number;
};
export type TMDBImage = {
    aspect_ratio: number;
    height: number;
    iso_639_1: string | null;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
};
export type TMDBImagResult = {
    "id": number,
    "backdrops": TMDBImage[];
    "logos": TMDBImage[];
    "posters": TMDBImage[]
}


export type TMDBSearchResult<T> = {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export type CastMember = {
    adult: boolean;
    gender: number; 
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
  }
  
  export type Credits = {
    cast: CastMember[];
  }