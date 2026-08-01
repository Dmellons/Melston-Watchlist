'use client'
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/hooks/User";
import { account, database, ID } from "@/lib/appwrite";
import { getIGDBImageUrl } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import SafeIcon from "@/components/SafeIcon";
import { Gamepad2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface SteamGame { appid: number; name: string; playtime_forever: number; }
const COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!;

function fmtPlaytime(min: number) {
    if (!min) return "—";
    if (min < 60) return `${min}m`;
    return `${Math.round(min / 60)}h`;
}

export default function SteamImport() {
    const { user, setUser } = useUser();
    const [steamInput, setSteamInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<SteamGame[] | null>(null);
    const [persona, setPersona] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });

    // Pre-fill the last-used Steam id from account prefs.
    useEffect(() => {
        account.getPrefs().then((p: any) => { if (p?.steamId) setSteamInput(p.steamId); }).catch(() => {});
    }, []);

    const ownedIgdbIds = useMemo(
        () => new Set((user?.watchlist?.documents ?? []).filter((d: any) => d.content_type === 'videogame').map((d: any) => d.igdb_id)),
        [user?.watchlist],
    );

    const fetchLibrary = async () => {
        if (!steamInput.trim() || loading) return;
        setLoading(true);
        setGames(null);
        try {
            const res = await fetch(`/api/steam/owned?id=${encodeURIComponent(steamInput.trim())}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch library');
            setGames(data.games);
            setPersona(data.persona);
            // default-select games that have actually been played
            setSelected(new Set(data.games.filter((g: SteamGame) => g.playtime_forever > 0).map((g: SteamGame) => g.appid)));
            // persist the resolved id for next time
            const prefs = await account.getPrefs();
            await account.updatePrefs({ ...prefs, steamId: data.steamId });
            if (data.count === 0) toast.message('No games found — the profile may be private (set Game details to Public).');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to fetch Steam library');
        } finally {
            setLoading(false);
        }
    };

    const toggle = (appid: number) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(appid) ? next.delete(appid) : next.add(appid);
            return next;
        });

    const importSelected = async () => {
        if (!user || !games || importing) return;
        const picks = games.filter((g) => selected.has(g.appid));
        if (picks.length === 0) { toast.error('Select at least one game'); return; }

        setImporting(true);
        setProgress({ done: 0, total: picks.length });
        const have = new Set(ownedIgdbIds);
        let added = 0, skipped = 0, failed = 0;

        for (let i = 0; i < picks.length; i++) {
            const g = picks[i];
            try {
                const res = await fetch(`/api/games/search?query=${encodeURIComponent(g.name)}&limit=1`);
                const { results } = await res.json();
                const match = results?.[0];
                if (!match) { failed++; }
                else if (have.has(match.id)) { skipped++; }
                else {
                    const posterUrl = match.cover?.image_id ? getIGDBImageUrl(match.cover.image_id, 'cover_big') : '';
                    const releaseDate = match.first_release_date
                        ? new Date(match.first_release_date * 1000).toISOString().split('T')[0]
                        : '';
                    await database.createDocument('watchlist', COLLECTION, ID.unique(), {
                        title: match.name,
                        content_type: 'videogame',
                        tmdb_id: 0,
                        tmdb_type: 'game',
                        igdb_id: match.id,
                        poster_url: posterUrl,
                        backdrop_url: null,
                        plex_request: false,
                        description: match.summary || 'No description available',
                        genre_ids: match.genres?.map((x: any) => x.id) || [],
                        release_date: releaseDate,
                        watch_status: 'want_to_watch',
                        platforms_owned: ['steam'],
                        play_status: g.playtime_forever > 0 ? 'playing' : 'backlog',
                    }, ['read("any")', `update("user:${user.id}")`, `delete("user:${user.id}")`]);
                    have.add(match.id);
                    added++;
                }
            } catch {
                failed++;
            }
            setProgress({ done: i + 1, total: picks.length });
            await new Promise((r) => setTimeout(r, 250)); // throttle IGDB
        }

        // refresh watchlist in context
        try {
            const updated = await database.listDocuments('watchlist', COLLECTION);
            setUser((prev) => prev ? { ...prev, watchlist: updated } : null);
        } catch { /* ignore */ }

        setImporting(false);
        toast.success(`Imported ${added} game${added !== 1 ? 's' : ''}`, {
            description: `${skipped} already in library · ${failed} no IGDB match`,
        });
    };

    const allSelected = games != null && games.length > 0 && selected.size === games.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <SafeIcon icon={Gamepad2} className="h-4 w-4 text-muted-foreground" size={16} />
                <span className="text-sm font-medium">Import Steam Library</span>
            </div>
            <p className="text-xs text-muted-foreground">
                Paste your SteamID64 or profile URL. Your Steam profile&apos;s “Game details” must be set to Public.
            </p>

            <div className="flex gap-2">
                <Input
                    placeholder="SteamID64 or steamcommunity.com/id/you"
                    value={steamInput}
                    onChange={(e) => setSteamInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchLibrary(); }}
                />
                <Button onClick={fetchLibrary} disabled={!steamInput.trim() || loading} variant="outline">
                    {loading ? <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} /> : 'Fetch'}
                </Button>
            </div>

            {games && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {persona ? `${persona} · ` : ''}{games.length} games · {selected.size} selected
                        </span>
                        {games.length > 0 && (
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => setSelected(allSelected ? new Set() : new Set(games.map((g) => g.appid)))}
                            >
                                {allSelected ? 'Clear' : 'Select all'}
                            </Button>
                        )}
                    </div>

                    {games.length > 0 && (
                        <ScrollArea className="h-56 rounded-md border p-2">
                            <div className="space-y-1">
                                {games.map((g) => (
                                    <label key={g.appid} className="flex items-center gap-3 p-1.5 rounded hover:bg-muted/50 cursor-pointer">
                                        <Checkbox checked={selected.has(g.appid)} onCheckedChange={() => toggle(g.appid)} disabled={importing} />
                                        <span className="text-sm flex-1 truncate">{g.name}</span>
                                        <span className="text-xs text-muted-foreground">{fmtPlaytime(g.playtime_forever)}</span>
                                    </label>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    {importing && (
                        <div className="space-y-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Importing {progress.done} / {progress.total}…</p>
                        </div>
                    )}

                    {games.length > 0 && (
                        <Button onClick={importSelected} disabled={importing || selected.size === 0} className="w-full">
                            {importing
                                ? <><SafeIcon icon={Loader2} className="h-4 w-4 mr-2 animate-spin" size={16} /> Importing…</>
                                : <><SafeIcon icon={Download} className="h-4 w-4 mr-2" size={16} /> Import {selected.size} to watchlist</>}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
