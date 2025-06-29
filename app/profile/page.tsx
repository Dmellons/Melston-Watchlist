'use client'
import { useUser } from "@/hooks/User";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ProvidersSelect from "@/components/ProvidersSelect";
import ImageGetter from "@/components/ImageGetter";
import SafeIcon from "@/components/SafeIcon";
import { 
  User, 
  Mail, 
  Calendar, 
  Film, 
  Tv, 
  Star, 
  Settings, 
  Shield,
  Palette,
  Bell,
  Download,
  Eye,
  Crown
} from "lucide-react";

const ProfilePage = () => {
  const { user } = useUser();
  const [isTester, setIsTester] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (user) {
      const labels = user.labels || [];
      setIsTester(labels.includes('tester'));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <SafeIcon icon={User} className="h-8 w-8 text-muted-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold">No User Found</h2>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userInitials = user.name.split(" ").map((n) => n[0]).join('').toUpperCase();
  
  // Calculate watchlist stats
  const watchlistStats = {
    total: user.watchlist?.total || 0,
    movies: user.watchlist?.documents?.filter(item => item.content_type === 'movie').length || 0,
    tvShows: user.watchlist?.documents?.filter(item => item.content_type === 'tv').length || 0,
    requested: user.watchlist?.documents?.filter(item => item.plex_request).length || 0,
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="relative mb-8">
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {user.admin && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2 shadow-lg">
                    <SafeIcon icon={Crown} className="h-4 w-4 text-white" size={16} />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <SafeIcon icon={Mail} className="h-4 w-4" size={16} />
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* Labels */}
                {user.labels && user.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {user.labels.map(label => (
                      <Badge key={label} variant={label === 'admin' ? 'default' : 'secondary'}>
                        {label === 'admin' && <SafeIcon icon={Shield} className="h-3 w-3 mr-1" size={12} />}
                        {label === 'plex' && <SafeIcon icon={Star} className="h-3 w-3 mr-1" size={12} />}
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <SafeIcon icon={Eye} className="h-6 w-6 text-primary" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">{watchlistStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>

        <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <SafeIcon icon={Film} className="h-6 w-6 text-blue-500" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-500">{watchlistStats.movies}</div>
            <div className="text-xs text-muted-foreground">Movies</div>
          </CardContent>
        </Card>

        <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <SafeIcon icon={Tv} className="h-6 w-6 text-green-500" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-500">{watchlistStats.tvShows}</div>
            <div className="text-xs text-muted-foreground">TV Shows</div>
          </CardContent>
        </Card>

        <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <SafeIcon icon={Star} className="h-6 w-6 text-amber-500" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-500">{watchlistStats.requested}</div>
            <div className="text-xs text-muted-foreground">Requested</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SafeIcon icon={User} className="h-5 w-5" size={20} />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={user.status ? "default" : "secondary"}>
                  {user.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              {user.admin && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Admin Access</span>
                    <Badge variant="default" className="bg-amber-500">
                      <SafeIcon icon={Shield} className="h-3 w-3 mr-1" size={12} />
                      Admin
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Streaming Providers */}
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SafeIcon icon={Palette} className="h-5 w-5" size={20} />
              Streaming Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select your streaming services to see which platforms have your watchlist items.
              </p>
              <ProvidersSelect />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SafeIcon icon={Settings} className="h-5 w-5" size={20} />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <SafeIcon icon={Bell} className="h-4 w-4 mr-2" size={16} />
                Notification Preferences
                <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <SafeIcon icon={Download} className="h-4 w-4 mr-2" size={16} />
                Export Watchlist
                <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Developer/Admin Section */}
        {(user.admin || isTester) && (
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <SafeIcon icon={Crown} className="h-5 w-5" size={20} />
                Developer Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {user.id}
                  </code>
                </div>
                
                {user.admin && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/admin">
                      <SafeIcon icon={Shield} className="h-4 w-4 mr-2" size={16} />
                      Admin Dashboard
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden Image Getter Component */}
      <div className="hidden">
        <ImageGetter />
      </div>
    </div>
  );
};

export default ProfilePage;