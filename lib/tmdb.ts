import { CastMember, Credits } from "@/types/tmdbApi";

export const tmdbFetchOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`, 
    }
  };

  export type StreamingInfo = {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
  }
  
  export type CountryInfo = {
    link: string;
    flatrate?: StreamingInfo[];
    buy?: StreamingInfo[];
    ads?: StreamingInfo[];
    free?: StreamingInfo[];
    // Add additional arrays as needed based on data inspection
  }
  
  export type Results = {
    [key: string]: CountryInfo[];
  }
  
  export type ProvidersApiCall = {
    id: number;
    results: Results;
  }
  

  export interface TMDBApiMovieDetail {
    adult: boolean;
    backdrop_path: string;
    belongs_to_collection: BelongsToCollection;
    budget: number;
    genres: Genre[];
    homepage: string;
    id: number;
    imdb_id: string;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    credits: Credits;
    release_date: string;
    revenue: number;
    runtime: number;
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }

  export type TMDBApiTvDetail = {
    adult: boolean;
    backdrop_path: string;
    created_by: Array<{
      id: number;
      credit_id: string;
      name: string;
      original_name: string;
      gender: number;
      profile_path: string | null;
    }>;
    episode_run_time: number[];
    first_air_date: string;
    genres: Array<{
      id: number;
      name: string;
    }>;
    homepage: string;
    id: number;
    in_production: boolean;
    languages: string[];
    last_air_date: string;
    last_episode_to_air: {
      id: number;
      overview: string;
      name: string;
      vote_average: number;
      vote_count: number;
      air_date: string;
      episode_number: number;
      episode_type: string;
      production_code: string;
      runtime: number;
      season_number: number;
      show_id: number;
      still_path: string;
    };
    name: string;
    next_episode_to_air: null | {
      id: number;
      overview: string;
      name: string;
      vote_average: number;
      vote_count: number;
      air_date: string;
      episode_number: number;
      episode_type: string;
      production_code: string;
      runtime: number;
      season_number: number;
      show_id: number;
      still_path: string;
    };
    networks: Array<{
      id: number;
      logo_path: string;
      name: string;
      origin_country: string;
    }>;
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: Array<{
      id: number;
      logo_path: string | null;
      name: string;
      origin_country: string | null;
    }>;
    production_countries: Array<{
      iso_3166_1: string;
      name: string;
    }>;
    seasons: Array<{
      air_date: string;
      episode_count: number;
      id: number;
      name: string;
      overview: string;
      poster_path: string;
      season_number: number;
      vote_average: number;
    }>;
    spoken_languages: Array<{
      english_name: string;
      iso_639_1: string;
      name: string;
    }>;
    status: string;
    tagline: string;
    type: string;
    vote_average: number;
    vote_count: number;
    credits: Credits
  };
  
  
  
  export interface BelongsToCollection {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  }
  
  export interface Genre {
    id: number;
    name: string;
  }
  
  export interface ProductionCompany {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }
  
  export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
  }
  
  export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
  }