'use client'
import Link from "next/link";
import { useUser } from "@/hooks/User";
import { WatchlistDocument } from "@/types/appwrite";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, Bookmark } from "lucide-react";
import SafeIcon from "@/components/SafeIcon";

const PREVIEW_COUNT = 12;

/**
 * A horizontally-scrolling row of the most recently added watchlist items,
 * with a "View all" link to /watchlist. Reads the watchlist already loaded
 * in the user context — no extra fetch.
 */
const WatchlistPreview = () => {
    const { user } = useUser();

    const documents = (user?.watchlist?.documents ?? []) as WatchlistDocument[];
    if (documents.length === 0) return null;

    const recent = [...documents]
        .sort((a, b) => (b.$createdAt > a.$createdAt ? 1 : -1))
        .slice(0, PREVIEW_COUNT);

    return (
        <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <SafeIcon icon={Bookmark} className="h-5 w-5 text-primary" size={20} />
                    Your Watchlist
                </h2>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link href="/watchlist" className="flex items-center gap-1">
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
                <CarouselContent>
                    {recent.map((item) => (
                        <CarouselItem key={item.$id} className="basis-1/3 sm:basis-1/4 lg:basis-1/6">
                            <Link href={`/${item.tmdb_type}/${item.tmdb_id}`} className="group block space-y-1.5">
                                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                                    <ImageWithFallback
                                        src={item.poster_url}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                        loading="lazy"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                </p>
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </section>
    );
};

export default WatchlistPreview;
