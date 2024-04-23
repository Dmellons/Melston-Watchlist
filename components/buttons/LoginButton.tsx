'use client'
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { useUser } from "@/hooks/User";

export default function LoginButton() {
    const { user, logout, loginWithGoogle } = useUser()
    

    // console.log({ user })
    if (user) {

        // const imgUrl = session?.user?.image ? session.user.image : undefined  
        const imgUrl = user?.image ? user.image : undefined

        const userInitials = user ? user?.name.split(" ").map((initial) => initial[0]).join('') : "NA"

        const handleLogout = async () => {
            try {
                await logout()
            } catch (e) {
                console.error(e)
            }
        }

    return (
        <div >
            <Popover>
                <PopoverTrigger>
                    <Avatar className=" hover:shadow-md hover:shadow-primary border border-secondary">
                        <AvatarImage src={imgUrl} />
                        <AvatarFallback className="bg-popover text-popover-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col items-center justify-items-center w-80 bg-popover sm:mr-10 sm:mt-2">
                    <p>Welcome, {user.name}</p>
                    <p className="text-card-foreground/50 font-thin text-sm">{user.email}</p>
                    <div className="">

                    <div className="flex gap-1 w-2/3">

                        <Button asChild variant="link" >
                            <Link href="/profile" className="text-popover-foreground">User Profile</Link>
                        </Button>

                        <Button asChild variant="link" >
                            <Link href="/watchlist" className="text-popover-foreground">Watchlist</Link>
                        </Button>

                        { user.admin &&
                            <Button asChild variant="link" >
                            <Link href="/admin" className="text-popover-foreground">Admin</Link>
                        </Button>
                        }

                    </div>
                        </div>
                    <div className="flex w-full justify-between ">

                        <ModeToggle />
                    <Button
                        onClick={handleLogout}
                        className="m-auto bg-destructive text-destructive-foreground hover:bg-muted hover:text-muted-foreground "
                        >
                        Sign out
                    </Button>
                        </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
return (
    <div className="m-auto">
        <Button className="bg-primary hover:bg-muted text-primary-foreground hover:text-muted-foreground" onClick={() => loginWithGoogle()}>Sign in</Button>
    </div>
)
}

