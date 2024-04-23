'use client'

import { useUser } from "@/hooks/User"

export default function AdminGatekeeper({ 
    children,
    label='admin' 
}: { 
    children: React.ReactNode
     label?:string 
}) {
    const { user } = useUser()

    if (label === 'admin'){
       
        if (user?.admin) {
            return <>{children}</>
        } else {
            return <></>
        }
        
    }
}
    