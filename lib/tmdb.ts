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
  