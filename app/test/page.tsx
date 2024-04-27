
import { getLoggedInUser } from '@/lib/server/appwriteServer';
import { signInWithGoogle } from '@/lib/server/oauth'
import { redirect } from 'next/navigation';




export default async function TestPage() {
   const user = await getLoggedInUser();


   return (
      <>
         {/* ... existing form */}
         <form action={signInWithGoogle}>
            <button type="submit">Sign up with GitHub</button>
         </form>

         {user ?
            <div className='p-2'>
               <p>You are signed in</p>
               {user?.email}
               {user?.name}
            </div>
               :
               <p>You are not signed in</p>
            }
      </>
   )
}


