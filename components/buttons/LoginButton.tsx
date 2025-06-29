'use client'
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { useUser } from "@/hooks/User";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SafeIcon from "@/components/SafeIcon";
import { 
    User, 
    Settings, 
    Shield, 
    LogOut, 
    Crown,
    Loader2,
    Star
} from "lucide-react";

export default function LoginButton() {
    const { user, logout, loginWithGoogle } = useUser()

    if (user) {
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
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                        >
                            <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                                <AvatarImage src={imgUrl} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            {user.admin && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center">
                                    <SafeIcon icon={Crown} className="h-2.5 w-2.5 text-white" size={10} />
                                </div>
                            )}
                        </Button>
                    </PopoverTrigger>
                    
                    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl" align="end">
                        <Card className="border-none shadow-none">
                            <CardContent className="p-6 space-y-4">
                                {/* User Info Header */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                                        <AvatarImage src={imgUrl} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-lg truncate">{user.name}</p>
                                            {user.admin && (
                                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                                                    <SafeIcon icon={Crown} className="h-3 w-3 mr-1" size={12} />
                                                    Admin
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* User Labels */}
                                {user.labels && user.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {user.labels.map(label => (
                                            <Badge 
                                                key={label} 
                                                variant={label === 'admin' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {label === 'admin' && <SafeIcon icon={Shield} className="h-3 w-3 mr-1" size={12} />}
                                                {label === 'plex' && <SafeIcon icon={Star} className="h-3 w-3 mr-1" size={12} />}
                                                {label.charAt(0).toUpperCase() + label.slice(1)}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <Separator />

                                {/* Navigation Links */}
                                <div className="space-y-2">
                                    <Button asChild variant="ghost" className="w-full justify-start h-10">
                                        <Link href="/profile" className="flex items-center gap-3">
                                            <SafeIcon icon={User} className="h-4 w-4" size={16} />
                                            <span>Profile & Settings</span>
                                        </Link>
                                    </Button>

                                    {user.admin && (
                                        <Button asChild variant="ghost" className="w-full justify-start h-10">
                                            <Link href="/admin" className="flex items-center gap-3">
                                                <SafeIcon icon={Shield} className="h-4 w-4" size={16} />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <Separator />

                                {/* Bottom Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Theme:</span>
                                        <ModeToggle />
                                    </div>

                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        size="sm"
                                        className="
                                            border-destructive/20 text-destructive 
                                            hover:bg-destructive hover:text-destructive-foreground
                                            transition-all duration-200
                                        "
                                    >
                                        <SafeIcon icon={LogOut} className="h-4 w-4 mr-2" size={16} />
                                        Sign out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </PopoverContent>
                </Popover>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button 
                className="
                    bg-primary hover:bg-primary/90 text-primary-foreground
                    transition-all duration-200 hover:scale-105 active:scale-95
                    shadow-lg hover:shadow-xl
                " 
                onClick={() => loginWithGoogle()}
            >
                <SafeIcon icon={User} className="h-4 w-4 mr-2" size={16} />
                Sign in with Google
            </Button>
        </div>
    )
}