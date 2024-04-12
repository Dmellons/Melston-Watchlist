'use client'
import SearchMovie from "@/components/SearchMovie";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/User";
import Image from "next/image";

export default function Home() {
  const { user } = useUser()
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2 sm:p-18">
      {/* {user && */}
        <SearchMovie resultsLength={100} />
      {/* } */}
      {!user &&
        <p>Please sign in</p>
      }
    </main>  
  )
}