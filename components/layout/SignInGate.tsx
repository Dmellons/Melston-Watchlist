'use client'
import { useUser } from "@/hooks/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/SafeIcon";
import { Film, type LucideIcon } from "lucide-react";

interface SignInGateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
}

/**
 * The one signed-out treatment for gated pages: says what's here and signs
 * the user in on the spot (rather than redirecting them away).
 */
export default function SignInGate({
    icon = Film,
    title = "Sign in to continue",
    description = "Sign in with Google to use this page.",
}: SignInGateProps) {
    const { loginWithGoogle } = useUser();

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <Card className="max-w-md w-full">
                <CardContent className="p-8 text-center space-y-4">
                    <div className="h-14 w-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                        <SafeIcon icon={icon} className="h-7 w-7 text-muted-foreground" size={28} />
                    </div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                    <Button size="lg" onClick={() => loginWithGoogle()}>
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
