'use client'

import { useUser } from "@/hooks/User"

export default function AdminGatekeeper({ children }: { children: React.ReactNode }) {
    const { user } = useUser()

    if (user?.admin) {
        return <>{children}</>
    } else {
        return <></>
    }
}
    