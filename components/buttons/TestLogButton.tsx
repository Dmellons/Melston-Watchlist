'use client'

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


export default function TestLogButton({log_me}:{log_me:string}) {

    const session = useSession();
        
    return(
        <div className="md:mr-8">
            <Button className="bg-red-500 hover:bg-red-600" onClick={ () => console.log(log_me)}>Test Logger</Button>
        </div>
    )
}

