'use client'
import SearchMovie from "@/components/SearchMovie";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/User";
import Image from "next/image";

export default function Home() {
  const { user, loginWithGoogle } = useUser()
  return (
    <main className="flex min-h-screen flex-col items-center  p-2 sm:p-18">
      <SearchMovie resultsLength={100} />
      
      {!user &&
        <Button variant={"link"} onClick={() => loginWithGoogle()}>Please sign in</Button>
      }
    </main>  
  )
}