'use client'

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/User";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, database } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Star, Users, Database, TrendingUp, Film, Tv, Shield, Activity, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SafeIcon from "@/components/SafeIcon";

function StatCard({ 
    icon, 
    label, 
    value, 
    description,
    trend,
    className = "" 
}: { 
    icon: string, 
    label: string, 
    value: string | number, 
    description?: string,
    trend?: string,
    className?: string 
}) {
    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'users': return Users;
            case 'database': return Database;
            case 'star': return Star;
            case 'activity': return Activity;
            default: return Database;
        }
    };

    const IconComponent = getIcon(icon);

    return (
        <Card className={`transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                        <SafeIcon icon={IconComponent} className="h-6 w-6 text-primary" size={24} />
                    </div>
                </div>
                {trend && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                        <SafeIcon icon={TrendingUp} className="h-4 w-4 text-green-500" size={16} />
                        <span className="text-sm text-green-500 font-medium">{trend}</span>
                        <span className="text-sm text-muted-foreground">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickActionCard({ 
    title, 
    description, 
    href, 
    icon, 
    badge 
}: { 
    title: string, 
    description: string, 
    href: string, 
    icon: string,
    badge?: string 
}) {
    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'users': return Users;
            case 'barchart': return BarChart3;
            default: return Database;
        }
    };

    const IconComponent = getIcon(icon);

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <SafeIcon icon={IconComponent} className="h-5 w-5 text-primary" size={20} />
                    </div>
                    {badge && (
                        <Badge variant="secondary" className="text-xs">
                            {badge}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <CardTitle className="text-lg mb-2">{title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={href}>
                        Open
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function RecentRequestItem({ document, userEmail }: { document: WatchlistDocument, userEmail: string }) {
    const mediaTypeIcon = document.content_type === 'movie' ? Film : Tv;
    
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-background/50 transition-all duration-200 hover:bg-background/80 hover:border-primary/30">
            <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-primary/10">
                    <SafeIcon icon={mediaTypeIcon} className="h-4 w-4 text-primary" size={16} />
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Link 
                        href={`/${document.tmdb_type}/${document.tmdb_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors truncate"
                    >
                        {document.title}
                    </Link>
                    {document.plex_request && (
                        <SafeIcon icon={Star} className="h-4 w-4 text-amber-500 fill-current flex-shrink-0" size={16} />
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{userEmail}</span>
                    <span>•</span>
                    <span className="capitalize">{document.content_type}</span>
                    <span>•</span>
                    <span>{new Date(document.$createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            
            <Badge variant={document.plex_request ? "default" : "secondary"} className="flex-shrink-0">
                {document.plex_request ? "Requested" : "Added"}
            </Badge>
        </div>
    );
}

// Mock data for development (replace with real API call)
const mockUsers = {
    total: 42,
    users: [
        { $id: '1', email: 'user1@example.com', name: 'User 1' },
        { $id: '2', email: 'user2@example.com', name: 'User 2' },
    ]
};

export default function AdminPage() {
    const { user } = useUser();
    const [watchlistData, setWatchlistData] = useState<Models.DocumentList<WatchlistDocument> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.admin) {
                    setError("Unauthorized access");
                    return;
                }

                const data: Models.DocumentList<WatchlistDocument> = await database.listDocuments(
                    'watchlist',
                    process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
                    [Query.limit(1000)]
                );

                setWatchlistData(data);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Helper function to get requesting user email (simplified for client-side)
    const getUserEmail = (document: WatchlistDocument): string => {
        // Extract user ID from permissions (simplified approach)
        const userPermission = document.$permissions.find(p => p.includes('update("user:'));
        if (userPermission) {
            const userId = userPermission.match(/user:([^"]+)/)?.[1];
            // In a real implementation, you'd map this to actual user emails
            return `user-${userId?.slice(-4)}@example.com`;
        }
        return 'Unknown User';
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg">Please sign in to access the admin panel.</p>
                </div>
            </div>
        );
    }

    if (!user.admin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <SafeIcon icon={Shield} className="h-16 w-16 mx-auto mb-4 text-destructive" size={64} />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !watchlistData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-muted-foreground">{error || 'Failed to load data'}</p>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const totalItems = watchlistData.total;
    const totalUsers = mockUsers.total; // Using mock data
    const plexRequests = watchlistData.documents.filter((item) => item.plex_request === true);
    const recentItems = watchlistData.documents
        .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
        .slice(0, 10);
    
    const movieCount = watchlistData.documents.filter(item => item.content_type === 'movie').length;
    const tvCount = watchlistData.documents.filter(item => item.content_type === 'tv').length;

    return (
        <div className="container mx-auto px-4 py-6 sm:py-12 max-w-7xl">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <SafeIcon icon={Shield} className="h-6 w-6 text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {user.name}. Here's what's happening with your watchlist platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon="users"
                    label="Total Users"
                    value={totalUsers}
                    description="Registered accounts"
                    trend="+12%"
                />
                
                <StatCard
                    icon="database"
                    label="Total Items"
                    value={totalItems}
                    description="Watchlist entries"
                    trend="+8%"
                />
                
                <StatCard
                    icon="star"
                    label="Plex Requests"
                    value={plexRequests.length}
                    description="Pending requests"
                    className={plexRequests.length > 0 ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" : ""}
                />
                
                <StatCard
                    icon="activity"
                    label="Active Today"
                    value={Math.floor(totalUsers * 0.3)}
                    description="Users online"
                    trend="+5%"
                />
            </div>

            {/* Content Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <SafeIcon icon={BarChart3} className="h-5 w-5" size={20} />
                            Content Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SafeIcon icon={Film} className="h-4 w-4 text-blue-500" size={16} />
                                    <span className="text-sm">Movies</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{movieCount}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalItems > 0 ? ((movieCount / totalItems) * 100).toFixed(0) : 0}%
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SafeIcon icon={Tv} className="h-4 w-4 text-green-500" size={16} />
                                    <span className="text-sm">TV Shows</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{tvCount}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalItems > 0 ? ((tvCount / totalItems) * 100).toFixed(0) : 0}%
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <QuickActionCard
                    title="User Management"
                    description="Manage user accounts, permissions, and roles"
                    href="/admin/users"
                    icon="users"
                    badge="Coming Soon"
                />

                <QuickActionCard
                    title="System Analytics"
                    description="View detailed analytics and usage statistics"
                    href="/admin/analytics"
                    icon="barchart"
                    badge="Coming Soon"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Requests Table - Takes 2/3 width */}
                <div className="xl:col-span-2">
                    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SafeIcon icon={Star} className="h-5 w-5" size={20} />
                                Plex Requests ({plexRequests.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {plexRequests.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {plexRequests.map((document) => (
                                        <RecentRequestItem
                                            key={document.$id}
                                            document={document}
                                            userEmail={getUserEmail(document)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <SafeIcon icon={Star} className="h-8 w-8 mx-auto mb-2" size={32} />
                                    <p>No plex requests</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Sidebar */}
                <div className="space-y-6">
                    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SafeIcon icon={Calendar} className="h-5 w-5" size={20} />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                            {recentItems.length > 0 ? (
                                recentItems.map((document) => (
                                    <RecentRequestItem
                                        key={document.$id}
                                        document={document}
                                        userEmail={getUserEmail(document)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <SafeIcon icon={Database} className="h-8 w-8 mx-auto mb-2" size={32} />
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {plexRequests.length > 0 && (
                        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <SafeIcon icon={Star} className="h-5 w-5" size={20} />
                                    Priority Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {plexRequests.slice(0, 5).map((document) => (
                                    <div key={document.$id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                                        <SafeIcon 
                                            icon={document.content_type === 'movie' ? Film : Tv} 
                                            className="h-4 w-4 text-amber-600 dark:text-amber-400" 
                                            size={16} 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/${document.tmdb_type}/${document.tmdb_id}`}
                                                className="font-medium text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate block"
                                            >
                                                {document.title}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {getUserEmail(document)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                {plexRequests.length > 5 && (
                                    <div className="text-center pt-2">
                                        <span className="text-sm text-muted-foreground">
                                            +{plexRequests.length - 5} more requests
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}