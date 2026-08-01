'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SafeIcon from "@/components/SafeIcon";
import { useUser } from "@/hooks/User";
import ContentRow from "@/components/home/ContentRow";
import { Film, Tv, Gamepad2, Star, Search, ListChecks } from "lucide-react";

const FEATURES = [
    { icon: Search, title: "Search everything", desc: "Movies, TV, and games in one place." },
    { icon: ListChecks, title: "Track & rate", desc: "Build your watchlist and rate what you've seen." },
    { icon: Star, title: "Where to watch", desc: "See streaming availability across your services." },
];

export default function LandingHero() {
    const { loginWithGoogle } = useUser();

    return (
        <div className="space-y-12 sm:space-y-16 pb-12">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-14 sm:px-12 sm:py-20 text-center">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <SafeIcon icon={Film} className="h-8 w-8" size={32} />
                        <SafeIcon icon={Tv} className="h-8 w-8" size={32} />
                        <SafeIcon icon={Gamepad2} className="h-8 w-8" size={32} />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
                        Your watchlist for{" "}
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            movies, shows & games
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground">
                        Track what you want to watch and play, rate what you've finished, and see where everything is streaming — all in one place.
                    </p>
                    <div className="flex justify-center">
                        <Button size="lg" onClick={() => loginWithGoogle()} className="transition-transform hover:scale-105">
                            Sign in with Google
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="grid gap-4 sm:grid-cols-3">
                {FEATURES.map((f) => (
                    <Card key={f.title} className="border-border/50">
                        <CardContent className="p-6 space-y-2">
                            <div className="inline-flex p-2 rounded-lg bg-primary/10">
                                <SafeIcon icon={f.icon} className="h-5 w-5 text-primary" size={20} />
                            </div>
                            <h3 className="font-semibold">{f.title}</h3>
                            <p className="text-sm text-muted-foreground">{f.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Public content preview */}
            <section className="space-y-8">
                <ContentRow title="Trending This Week" endpoint="trending/all/week" fallbackType="movie" />
                <ContentRow title="Now Playing in Theaters" endpoint="movie/now_playing" fallbackType="movie" />
            </section>
        </div>
    );
}
