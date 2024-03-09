import Link from "next/link";
import LoginButton from "../buttons/LoginButton";
import { Button } from "@/components/ui/button";

export default function MainHeader() {

    // const session = await serverAuth()   

    return (
        <nav
            className="
          flex flex-wrap
          items-center
          justify-between
          bg-title
          text-title-foreground
          w-full
          md:py-0
          px-4
          text-xl
          font-bold
        "
        >
            <div>
                <Button asChild variant="link" className="text-xl text-title-foreground font-bold hover">

                    <Link href="/">
                        Watchlist
                    </Link>
                </Button>
            </div>


            <div className="hidden w-full md:flex md:items-center md:w-auto" id="menu">
                <ul
                    className="
              text-base 
              text-secondary
              md:flex
              md:pt-0"
                >
                </ul>
                <div className="py-3">
                    <LoginButton />
                </div>
            </div>
        </nav>
    )
}