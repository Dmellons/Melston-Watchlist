import { client } from '@/lib/appwrite';
import { createAdminClient } from "@/lib/server/appwriteServer";
import { cookies } from "next/headers";

import { NextRequest, NextResponse } from "next/server";
import { Account, Client } from "node-appwrite";

export async function GET(req: NextRequest, res: NextResponse) {

    return NextResponse.json({
        status: 200,
        message: 'success',
    });
}
export async function POST(req: NextRequest, res: NextResponse) {
    console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    const data = await req.json()

    // console.log({ data })
    try {

        let jwt = data.jwt

        if (jwt) {

            const client = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
                .setJWT(jwt);



            const account = new Account(client);
            // console.log({account})

            const user = await account.get();
            // console.log({user})

            cookies().set(process.env.COOKIE_NAME, jwt, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
            return NextResponse.json({
                status: 200,
                message: 'success',
                jwt,
                user,
                account,
                client
                //  session
            });
        }

        
        return Response.json({
            status: 500,
            message: 'No jwt provided',
            'user': undefined,
            'jwt': undefined,
        });
    } catch (error: any) {
        console.error(error);
        return Response.json({
            status: 500,
            message: error.message,
            'jwt': undefined,
            'user': undefined,
        });
    }
}
