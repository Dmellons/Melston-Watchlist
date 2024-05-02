"use server"
import { Client, Account, Models, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";
import { WatchlistDocument } from "@/types/appwrite";
import { type UserType } from "@/hooks/User";

export async function createSessionClient() {
  const jwt = cookies().get(process.env.COOKIE_NAME)?.value;
  // console.log({ jwt });
  if (!jwt) {
    throw new Error("No session");
  }
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setJWT(jwt);
  console.log("Client: ", { client });
  client.setSession(jwt);

  console.log("Client: ", { client });

  const account = new Account(client);
  console.log("Account: ", { account });
  const databases = new Databases(client)
  const users = new Users(client)
  const user = await account.get().catch((error) => {
    if (error.code === 401 && error.type === "user_jwt_invalid") {
      async () => {
        await fetch(`http://localhost:3000/api/jwt/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      };
      throw new Error("Invalid JWT");
    } else {
      throw error;
    }
  });

  console.log('User2: ',{ user });
  const returnObj = {
    "client": client,
    "account": account ,
    "databases": new Databases(client),
    "users": new Users(client)
    }
    // console.log({returnObj})
    return returnObj;
  };
    


export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

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

    // const account = new Account(client);

    console.log({ account, client });   
    const test = await account.get();
    console.log({test})
    const { $id, email, name, prefs, status, labels, ...rest } = await account.get().catch((error) => {
      if(error.code === 401 && error.type === 'user_jwt_invalid') {async () => {
        await fetch(`http://localhost:3000/api/jwt/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })}
            throw new Error("Invalid JWT")
      } else {
        throw error;
      }
    }); 

    console.log({ $id, email, name, prefs, status, labels, rest })

    // const client = new Client()
    //     .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
    //     .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)

    const session = cookies().get(process.env.COOKIE_NAME);
      if(!session || !session.value) {
        throw new Error("No session");
  }
    
    client.setSession(session.value);

  const database = new Databases(client)

  const watchlist: Models.DocumentList<WatchlistDocument> | Models.DocumentList<Models.Document> = await database.listDocuments('watchlist', process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID)
  
  let user: UserType = {
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
    debug: rest
  }
  
  return user;
} catch (error) {
  return null;
}
}