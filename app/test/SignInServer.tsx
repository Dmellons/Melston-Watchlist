'use client'

import { Button } from "@/components/ui/button"

const SignInServer = ({
    signInWithGoogle
}:{
    signInWithGoogle:() => void
}) => {
    return (
    <Button 
        className="bg-red-500 hover:bg-red-600"
        onClick={() => signInWithGoogle()} 
        >Sign In with Google</Button>
    )
}



export default SignInServer