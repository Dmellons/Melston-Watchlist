import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type TMDBApiMovieDetail, type TMDBApiTvDetail, tmdbFetchOptions } from "@/lib/tmdb";
import DetailPageHero from "@/components/DetailPageHero";
import DetailPageContent from "@/components/DetailPageContent";

interface DetailPageProps {
    params: Promise<{
        tmdbId: string;
        tmdbType: 'movie' | 'tv';
    }>;
}

function isMovieDetail(data: TMDBApiMovieDetail | TMDBApiTvDetail): data is TMDBApiMovieDetail {
    return (data as TMDBApiMovieDetail).title !== undefined;
}

function isTvDetail(data: TMDBApiMovieDetail | TMDBApiTvDetail): data is TMDBApiTvDetail {
    return (data as TMDBApiTvDetail).first_air_date !== undefined;
}

export async function generateMetadata(props: DetailPageProps): Promise<Metadata> {
    try {
        const { tmdbId, tmdbType } = await props.params;
        if (tmdbType !== 'movie' && tmdbType !== 'tv') return { title: 'Watchlist' };

        const res = await fetch(
            `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?language=en-US`,
            tmdbFetchOptions
        );
        if (!res.ok) return { title: 'Not Found · Watchlist' };

        const data = await res.json();
        const name = data.title || data.name || 'Details';
        const year = (data.release_date || data.first_air_date || '').split('-')[0];
        const fullTitle = year ? `${name} (${year})` : name;
        const description: string = data.overview || `Streaming providers, cast, and details for ${name}.`;
        const image = data.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
            : data.poster_path
                ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
                : undefined;

        return {
            title: `${fullTitle} · Watchlist`,
            description,
            openGraph: {
                title: fullTitle,
                description,
                type: tmdbType === 'movie' ? 'video.movie' : 'video.tv_show',
                images: image ? [{ url: image }] : undefined,
            },
            twitter: {
                card: image ? 'summary_large_image' : 'summary',
                title: fullTitle,
                description,
                images: image ? [image] : undefined,
            },
        };
    } catch {
        return { title: 'Watchlist' };
    }
}

const DetailPage = async (props: DetailPageProps) => {
    const { tmdbId, tmdbType } = await props.params;

    if (tmdbType !== 'movie' && tmdbType !== 'tv') {
        notFound();
    }

    // Certifications live under different appends per type (release_dates for
    // movies, content_ratings for tv).
    const appends = [
        'credits',
        'images',
        'videos',
        'recommendations',
        'similar',
        'external_ids',
        tmdbType === 'movie' ? 'release_dates' : 'content_ratings',
    ].join(',');
    const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?append_to_response=${appends}&language=en-US`;
    const response = await fetch(url, tmdbFetchOptions);

    // A 404 from TMDB means the title doesn't exist → show the not-found page.
    if (response.status === 404) {
        notFound();
    }
    if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
    }

    const data: TMDBApiMovieDetail | TMDBApiTvDetail = await response.json();

    if (!data) {
        throw new Error('Failed to fetch data');
    }

    const title = isMovieDetail(data) ? data.title : data.name;
    const releaseDate = isMovieDetail(data) ? data.release_date : data.first_air_date;
    const runtime = isMovieDetail(data) ? data.runtime : data.episode_run_time?.[0] || 0;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <DetailPageHero
                data={data}
                title={title}
                releaseDate={releaseDate}
                tmdbType={tmdbType}
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