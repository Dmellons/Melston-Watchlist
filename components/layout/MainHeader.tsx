import Link from "next/link";
import LoginButton from "../buttons/LoginButton";
import { Button } from "@/components/ui/button";
import NewSearchBar from "../newSearchBar";

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
          
          text-xl
          font-bold
          lg:flex-nowrap
          "
        >
            <NewSearchBar />
            <div className="flex justify-center lg:order-none lg:self-center">
                <Button asChild variant="link" className="text-xl text-title-foreground font-bold hover">

                    <Link href="/">
                        Watchlist
                    </Link>
                </Button>
            </div>


            {/* Hamburger menu placeholder */}
            {/* <div className=" py-3 hidden md:hidden">
                <button
                className="text-title-foreground inline-flex items-center justify-center rounded-md p-2"
                aria-controls="menu"
                aria-expanded="false"
                >
                <span className="sr-only">Open menu</span>
                <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    </button>
                </div> */}

            {/* Normal Menu */}
            {/* <div className="hidden flex-1 items-center  justify-around lg:flex order-first lg:order-none"
                id="menu">
                <ul
                className="flex  divide-x divide-gray-200 text-title-foreground w-96" 
                
                >
                <li className="px-4 mx-auto text-center">Watchlist</li>
                <li className="px-4 mx-auto text-center">New</li>
                </ul>
            </div> */}

            <div className="my-3 z-20">
                <LoginButton />
            </div>
        </nav>
    )
}