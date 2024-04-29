
import { getLoggedInUser } from '@/lib/server/appwriteServer';
import ClickJwt from './ClickJwt';
import { NextRequest } from 'next/server';
import ClickJwtDelete from './ClickJwtDelete';
import { cookies } from 'next/headers';
import { Account, Client } from 'node-appwrite';




export default async function TestPage(req: NextRequest) {
   console.log({ req })
   // const user = await getLoggedInUser();
   let user
   const jwt = cookies().get(process.env.COOKIE_NAME)?.value
   const allCookies = cookies().getAll()

   console.log({ allCookies })

   if (!jwt) {
      return (
         <>
            <p>You are not signed in</p>
         </>
      )
   } else {
      try{

         
         const client = new Client()
         .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
         .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
         .setJWT(jwt);
         
         const account = new Account(client)
         
         user = await account.get();
         
         console.log({ user })
      } catch (error) {
         console.error(`Login Error: ${error}`)
      }


      return (
         <>
            {/* ... existing form */}

            {/* <SignInServer signInWithGoogle={signInWithGoogle} /> */}
            {/* <SignInClient /> */}
            <ClickJwt />
            <ClickJwtDelete />
            {JSON.stringify(req.headers)}

            {user ?
               <div className='p-2 gap-2'>
                  <p>You are signed in</p>
                  <p>
                     {user?.email}
                     </p>
                     <p>

                  {user?.name}
                     </p>
               </div>
               :
               <p>You are not signed in</p>
            }
         </>
      )
   }

}
