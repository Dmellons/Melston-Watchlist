'use client'
import SearchMovie from "@/components/SearchMovie";
import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/User";
import { WatchlistDocument } from "@/types/appwrite";
import { Models } from "appwrite";
import Image from "next/image";

export default function Home() {
  const { user, loginWithGoogle } = useUser()
  console.log({user})
  const watchlist:Models.DocumentList<WatchlistDocument> = user?.watchlist 
  
  return (
    <div className="flex  flex-col items-center  p-2 sm:p-18">
      {/* <SearchMovie resultsLength={10} /> */}

      
      {!user &&
      <Button variant={"link"} onClick={() => loginWithGoogle()}>Please sign in</Button>
      } 
      {watchlist &&       
        <WatchlistGrid watchlist={watchlist} />
      }
    </div>
  )
}