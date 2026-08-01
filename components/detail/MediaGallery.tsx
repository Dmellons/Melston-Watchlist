'use client'
import { useState } from "react";
import Image from "next/image";
import { Play, Film, ImageIcon } from "lucide-react";
import SafeIcon from "@/components/SafeIcon";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface TMDBVideo {
    key: string;
    site: string;
    type: string;
    name: string;
}
interface TMDBImage {
    file_path: string;
}

interface MediaGalleryProps {
    title: string;
    videos?: { results?: TMDBVideo[] };
    images?: { backdrops?: TMDBImage[]; posters?: TMDBImage[] };
}

// Trailers/teasers first, then everything else from YouTube.
function pickVideos(videos?: { results?: TMDBVideo[] }): TMDBVideo[] {
    const all = (videos?.results ?? []).filter((v) => v.site === 'YouTube');
    const rank = (t: string) => (t === 'Trailer' ? 0 : t === 'Teaser' ? 1 : 2);
    return all.sort((a, b) => rank(a.type) - rank(b.type)).slice(0, 8);
}

export default function MediaGallery({ title, videos, images }: MediaGalleryProps) {
    const clips = pickVideos(videos);
    const backdrops = (images?.backdrops ?? []).slice(0, 12);
    const [activeKey, setActiveKey] = useState<string | null>(clips[0]?.key ?? null);
    const [playing, setPlaying] = useState(false);

    const hasMedia = clips.length > 0 || backdrops.length > 0;

    if (!hasMedia) {
        return (
            <div className="text-center py-10 sm:py-14 text-muted-foreground">
                <SafeIcon icon={Film} className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3" size={48} />
                <p className="text-sm sm:text-base">No trailers or images available for this title.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Trailer */}
            {activeKey && (
                <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <SafeIcon icon={Play} className="h-5 w-5 text-primary" size={20} />
                        Trailers & Videos
                    </h3>

                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                        {playing ? (
                            <iframe
                                className="absolute inset-0 h-full w-full"
                                src={`https://www.youtube-nocookie.com/embed/${activeKey}?autoplay=1&rel=0`}
                                title={`${title} trailer`}
                                allow="accelerated-encoder; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setPlaying(true)}
                                className="group absolute inset-0 h-full w-full"
                                aria-label="Play trailer"
                            >
                                <Image
                                    src={`https://img.youtube.com/vi/${activeKey}/hqdefault.jpg`}
                                    alt={`${title} trailer thumbnail`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                                />
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg transition-transform group-hover:scale-110">
                                        <SafeIcon icon={Play} className="h-8 w-8 text-primary-foreground fill-current ml-1" size={32} />
                                    </span>
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Other clips */}
                    {clips.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {clips.map((clip) => (
                                <button
                                    key={clip.key}
                                    type="button"
                                    onClick={() => { setActiveKey(clip.key); setPlaying(false); }}
                                    className={`relative flex-shrink-0 w-32 aspect-video rounded-md overflow-hidden border-2 transition-colors ${activeKey === clip.key ? 'border-primary' : 'border-transparent hover:border-border'}`}
                                    title={clip.name}
                                >
                                    <Image
                                        src={`https://img.youtube.com/vi/${clip.key}/mqdefault.jpg`}
                                        alt={clip.name}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Image gallery */}
            {backdrops.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <SafeIcon icon={ImageIcon} className="h-5 w-5 text-primary" size={20} />
                        Gallery
                    </h3>
                    <Carousel opts={{ align: 'start' }} className="w-full">
                        <CarouselContent>
                            {backdrops.map((img, i) => (
                                <CarouselItem key={img.file_path} className="basis-4/5 sm:basis-1/2 lg:basis-1/3">
                                    <div className="relative aspect-video overflow-hidden rounded-lg">
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                                            alt={`${title} still ${i + 1}`}
                                            fill
                                            sizes="(max-width: 768px) 80vw, 33vw"
                                            loading="lazy"
                                            className="object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                </div>
            )}
        </div>
    );
}
