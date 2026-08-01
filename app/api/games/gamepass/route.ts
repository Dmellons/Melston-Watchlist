import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/services/subscriptionService";

// GET /api/games/gamepass?title=...  ->  { available: boolean }
// Runs the Microsoft catalog lookup server-side (avoids CORS) and fails safe.
export async function GET(req: NextRequest) {
    const title = req.nextUrl.searchParams.get('title');
    if (!title) return NextResponse.json({ available: false });

    try {
        const available = await subscriptionService.checkGamePass(title);
        return NextResponse.json({ available });
    } catch {
        return NextResponse.json({ available: false });
    }
}
