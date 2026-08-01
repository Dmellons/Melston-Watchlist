import { createAdminClient } from "@/lib/server/appwriteServer";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Account, Client } from "node-appwrite";

export async function POST(request: NextRequest) {

  const url = new URL(request.nextUrl.toString());

 
  
  // cookies().delete(process.env.COOKIE_NAME);
  // return Response.json({
  //   status: 200,
  //   message: 'success',
  //   headers: headers(),
  // });
  
  return NextResponse.redirect(url.origin, 303)
}

