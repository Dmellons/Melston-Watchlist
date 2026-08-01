"use server"
import { Client, Account, Models, Databases, Users, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { WatchlistDocument } from "@/types/appwrite";
import { type UserType } from "@/hooks/User";
import { toPlain } from "@/lib/server/serialize";


export async function createSessionClient() {
  const jwt = (await cookies()).get(process.env.COOKIE_NAME!)?.value;
  // // console.log({ jwt });
  if (!jwt) {
    return {
      "client": undefined,
      "account": undefined,
      "databases": undefined,
      "users": undefined
      };
  }
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);
  // console.log("Client: ", { client });
  client.setSession(jwt);

  // console.log("Client: ", { client });

  const account = new Account(client);
  // console.log("Account: ", { account });
  const databases = new Databases(client)
  const users = new Users(client)
  // Validate the JWT. If it's invalid/expired (or any session error), treat the
  // request as logged-out. We must NOT throw here (this runs during server
  // component render — an uncaught throw becomes a 500) and we can't mutate
  // cookies during render, so the stale cookie is simply replaced on next login.
  try {
    await account.get();
  } catch {
    return {
      "client": undefined,
      "account": undefined,
      "databases": undefined,
      "users": undefined,
    };
  }

  // console.log('User2: ',{ user });
  const returnObj = {
    "client": client,
    "account": account ,
    "databases": new Databases(client),
    "users": new Users(client)
    }
    // // console.log({returnObj})
    return returnObj;
  };
    


export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const account = new Account(client);
  const databases = new Databases(client)
  const users = new Users(client)

  return {
    "client": client,
    "account": account,
    "databases": databases,
    "users": users
    }
  };



export async function getLoggedInUser() {
  try {
    const { account, client } = await createSessionClient();

    if (!account || !client) return null;

    const userResponse = await account.get().catch((error: any) => {
      if(error.code === 401 && error.type === 'user_jwt_invalid') {
        // Handle invalid JWT
        return null;
      } else {
        throw error;
      }
    });

    if (!userResponse) return null;

    const { $id, email, name, prefs, status, labels, ...rest } = userResponse;

    if (!$id) return null;

    const session = (await cookies()).get(process.env.COOKIE_NAME!);
    if(!session || !session.value) {
      throw new Error("No session");
    }
    
    client.setSession(session.value);
    const database = new Databases(client)

    // Fetch only the current user's watchlist documents
    // With document-level permissions, this will automatically filter to user's own documents
    const watchlist: Models.DocumentList<WatchlistDocument> = await database.listDocuments<WatchlistDocument>(
      'watchlist', 
      process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
      [
        Query.limit(1000), // Appwrite defaults to 25 docs without an explicit limit
        // Optional: Add explicit user filter for additional safety
        // Query.equal('userId', $id) // If you add a userId field to documents
      ]
    );
  
    const user: UserType = {
      id: $id,
      admin: labels?.includes('admin') ? true : false,
      email,
      name,
      status,
      labels,
      // @ts-ignore
      image: prefs.image ? prefs.image : null,
      // @ts-ignore  
      providers: prefs.providers ? prefs.providers : [],
      watchlist: watchlist,
    }

    // This object is passed to the client UserProvider, and the v27 SDK
    // returns null-prototype objects the RSC serializer rejects.
    return toPlain(user);
  } catch (error) {
    console.error('getLoggedInUser error:', error);
    return null;
  }
}