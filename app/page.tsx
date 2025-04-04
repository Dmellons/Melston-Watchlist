'use client'
import SearchMovie from "@/components/SearchMovie";
import WatchlistGrid from "@/components/buttons/WatchlistGrid";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/MediaQuery";
import { useUser } from "@/hooks/User";
import { WatchlistDocument } from "@/types/appwrite";
import { Models } from "appwrite";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { user, loginWithGoogle } = useUser()
  // const isDesktop = useMediaQuery("(min-width: 768px)")
  console.log({ user })
  // const watchlist: Models.DocumentList<WatchlistDocument> = user?.watchlist

  return (
    <div className=" p-2 sm:p-18 flex  flex-col items-center  ">
      {/* {!isDesktop &&
      } */}
      {/* <SearchMovie resultsLength={10} /> */}


      {!user &&
        <Button variant={"link"} onClick={() => loginWithGoogle()}>Please sign in</Button>
      }
      {user?.watchlist &&
        <WatchlistGrid watchlist={user?.watchlist as Models.DocumentList<WatchlistDocument>} />
      }
    </div>
  )
}