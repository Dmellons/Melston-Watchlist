'use client'
import { useUser } from "@/hooks/User";
import { Button } from "@/components/ui/button";

export default function GoogleSignInButton() {
    const { loginWithGoogle } = useUser();
    return (
        <Button size="lg" onClick={() => loginWithGoogle()}>
            Sign in with Google
        </Button>
    );
}
