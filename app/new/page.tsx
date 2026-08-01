'use client'
import ContentRow from "@/components/home/ContentRow";
import PageShell from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarClock } from "lucide-react";

export default function NewPage() {
  return (
    <PageShell>
      <PageHeader
        title="New & Upcoming"
        icon={CalendarClock}
        color="violet"
        subtitle="Fresh releases and what's coming soon"
      />

      <div className="space-y-8">
        <ContentRow title="Now Playing in Theaters" endpoint="movie/now_playing" fallbackType="movie" />
        <ContentRow title="Upcoming Movies" endpoint="movie/upcoming" fallbackType="movie" />
        <ContentRow title="On the Air" endpoint="tv/on_the_air" fallbackType="tv" />
        <ContentRow title="Airing Today" endpoint="tv/airing_today" fallbackType="tv" />
      </div>
    </PageShell>
  );
}
