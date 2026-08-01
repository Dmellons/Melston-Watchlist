import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/server/appwriteServer";
import { getAdminUsers } from "@/lib/server/adminUsers";

export async function GET() {
    const user = await getLoggedInUser();
    if (!user?.admin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const result = await getAdminUsers();
    return NextResponse.json(result);
}
