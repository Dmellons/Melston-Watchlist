import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import SafeIcon from "@/components/SafeIcon";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface RecItem {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    media_type?: 'movie' | 'tv';
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
}

interface RecommendationsRowProps {
    title: string;
    items: RecItem[];
    fallbackType: 'movie' | 'tv';
}

export default function RecommendationsRow({ title, items, fallbackType }: RecommendationsRowProps) {
    const withPoster = items.filter((i) => i.poster_path).slice(0, 18);
    if (withPoster.length === 0) return null;

    return (
        <section className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
            <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
                <CarouselContent>
                    {withPoster.map((item) => {
                        const name = item.title || item.name || '';
                        const type = item.media_type === 'tv' || item.media_type === 'movie' ? item.media_type : fallbackType;
                        const year = (item.release_date || item.first_air_date || '').split('-')[0];
                        return (
                            <CarouselItem key={item.id} className="basis-1/3 sm:basis-1/4 lg:basis-1/6">
                                <Link href={`/${type}/${item.id}`} className="group block space-y-1.5">
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                            alt={name}
                                            fill
                                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                            loading="lazy"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {year && <span>{year}</span>}
                                        {typeof item.vote_average === 'number' && item.vote_average > 0 && (
                                            <span className="flex items-center gap-0.5">
                                                <SafeIcon icon={Star} className="h-3 w-3 text-yellow-400 fill-current" size={12} />
                                                {item.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </section>
    );
}
