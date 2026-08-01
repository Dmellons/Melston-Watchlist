import ContentRow from "@/components/home/ContentRow";

export const metadata = {
  title: "New & Upcoming",
};

export default function NewPage() {
  return (
    <div className="p-2 sm:p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">New & Upcoming</h1>
        <p className="text-muted-foreground">Fresh releases and what&apos;s coming soon.</p>
      </div>

      <div className="space-y-8">
        <ContentRow title="Now Playing in Theaters" endpoint="movie/now_playing" fallbackType="movie" />
        <ContentRow title="Upcoming Movies" endpoint="movie/upcoming" fallbackType="movie" />
        <ContentRow title="On the Air" endpoint="tv/on_the_air" fallbackType="tv" />
        <ContentRow title="Airing Today" endpoint="tv/airing_today" fallbackType="tv" />
      </div>
    </div>
  );
}
