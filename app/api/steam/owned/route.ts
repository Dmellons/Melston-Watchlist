import { NextRequest, NextResponse } from "next/server";
import { steamService } from "@/lib/services/steamService";

// GET /api/steam/owned?id=<steamid|vanity|profileURL>
// Resolves the id and returns the user's owned games (server-side; needs STEAM_API_KEY).
export async function GET(req: NextRequest) {
    const input = req.nextUrl.searchParams.get('id')?.trim();
    if (!input) {
        return NextResponse.json({ error: 'Missing Steam ID or profile URL' }, { status: 400 });
    }
    if (!steamService.isConfigured()) {
        return NextResponse.json({ error: 'Steam API key not configured on the server' }, { status: 503 });
    }

    try {
        const steamId = await steamService.parseSteamId(input);
        if (!steamId) {
            return NextResponse.json({ error: "Couldn't resolve that Steam ID / vanity URL" }, { status: 404 });
        }

        const [games, summary] = await Promise.all([
            steamService.getOwnedGames(steamId),
            steamService.getPlayerSummary(steamId).catch(() => null),
        ]);

        const sorted = [...games].sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0));

        return NextResponse.json({
            steamId,
            persona: summary?.personaname ?? null,
            count: sorted.length,
            games: sorted.map((g) => ({
                appid: g.appid,
                name: g.name,
                playtime_forever: g.playtime_forever ?? 0,
            })),
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Steam request failed' },
            { status: 502 },
        );
    }
}
