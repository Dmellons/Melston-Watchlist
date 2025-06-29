'use server'
import { type TMDBApiMovieDetail, type TMDBApiTvDetail, tmdbFetchOptions } from "@/lib/tmdb";
import { WatchlistDocumentCreate } from "@/types/appwrite";
import DetailPageHero from "@/components/DetailPageHero";
import DetailPageContent from "@/components/DetailPageContent";

interface DetailPageProps {
    params: {
        tmdbId: string;
        tmdbType: 'movie' | 'tv';
    }
}

function isMovieDetail(data: TMDBApiMovieDetail | TMDBApiTvDetail): data is TMDBApiMovieDetail {
    return (data as TMDBApiMovieDetail).title !== undefined;
}

function isTvDetail(data: TMDBApiMovieDetail | TMDBApiTvDetail): data is TMDBApiTvDetail {
    return (data as TMDBApiTvDetail).first_air_date !== undefined;
}

const DetailPage = async ({ params }: DetailPageProps) => {
    const { tmdbId, tmdbType } = params;

    const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?append_to_response=credits,images,videos&language=en-US`;
    const response = await fetch(url, tmdbFetchOptions);

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    let data: TMDBApiMovieDetail | TMDBApiTvDetail = await response.json();

    if (!data) {
        throw new Error('Failed to fetch data');
    }

    const title = isMovieDetail(data) ? data.title : data.name;
    const releaseDate = isMovieDetail(data) ? data.release_date : data.first_air_date;
    const runtime = isMovieDetail(data) ? data.runtime : data.episode_run_time?.[0] || 0;

    const addButtonData: WatchlistDocumentCreate = {
        tmdb_id: data.id,
        tmdb_type: tmdbType,
        title: title,
        poster_url: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        backdrop_url: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
        content_type: tmdbType,
        plex_request: false,
        description: data.overview ? data.overview : 'No description available',
        genre_ids: data.genres.map((genre) => genre.id),
        release_date: releaseDate,
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <DetailPageHero 
                data={data}
                title={title}
                releaseDate={releaseDate}
                tmdbType={tmdbType}
                addButtonData={addButtonData}
            />

            {/* Main Content */}
            <DetailPageContent 
                data={data}
                tmdbType={tmdbType}
                releaseDate={releaseDate}
                runtime={runtime}
            />
        </div>
    );
};

export default DetailPage;