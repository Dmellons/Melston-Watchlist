import { Card, CardContent } from "@/components/ui/card";
import GoogleSignInButton from "./GoogleSignInButton";
import { Film, type LucideIcon } from "lucide-react";

interface SignInGateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
}

/**
 * The one signed-out treatment for gated pages: says what's here and signs
 * the user in on the spot (rather than redirecting them away).
 *
 * Deliberately NOT a client component — server pages pass `icon` as a
 * component function, which must not cross a server->client boundary. The
 * client boundary lives inside GoogleSignInButton instead.
 */
export default function SignInGate({
    icon: Icon = Film,
    title = "Sign in to continue",
    description = "Sign in with Google to use this page.",
}: SignInGateProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <Card className="max-w-md w-full">
                <CardContent className="p-8 text-center space-y-4">
                    <div className="h-14 w-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                    <GoogleSignInButton />
                </CardContent>
            </Card>
        </div>
    );
}
