import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/server/appwriteServer";
import { getAnalyticsData } from "@/lib/server/adminAnalytics";

export async function GET() {
    const user = await getLoggedInUser();
    if (!user?.admin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const result = await getAnalyticsData();
    return NextResponse.json(result);
}
