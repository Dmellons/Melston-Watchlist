// src/lib/server/appwrite.js
"use server"
import { Client, Account, Models, Databases } from "node-appwrite";
import { cookies } from "next/headers";
import { WatchlistDocument } from "@/types/appwrite";
import { type UserType } from "@/hooks/User";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const session = cookies().get(process.env.COOKIE_NAME);
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    get account() {
      return new Account(client);
    },
  };
}


export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

   
    const { $id, email, name, prefs, status, labels, ...rest } = await account.get();

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)

    const session = cookies().get(process.env.COOKIE_NAME);
      if(!session || !session.value) {
        throw new Error("No session");
  }
    
    client.setSession(session.value);

  const database = new Databases(client)

  const watchlist: Models.DocumentList<WatchlistDocument> | Models.DocumentList<Models.Document> = await database.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID)
  console.log({prefs})
  let user: UserType = {
    id: $id,
    admin: labels?.includes('admin') ? true : false,
    email,
    name,
    status,
    labels,
    image: prefs.image ? prefs.image : null,
    providers: prefs.providers ? prefs.providers : [],
    watchlist: watchlist,
    debug: rest
  }
  console.log({ user })
  return user;
} catch (error) {
  return null;
}
}