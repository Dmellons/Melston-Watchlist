'use client'

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, database } from "@/lib/appwrite";
import { Query } from "appwrite";
import { 
    BarChart3, 
    Shield, 
    TrendingUp, 
    TrendingDown,
    Users, 
    Film, 
    Tv, 
    Star,
    Calendar,
    Activity,
    Database,
    Clock,
    Download,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import SafeIcon from "@/components/SafeIcon";

// Mock analytics data - replace with real analytics API
const mockAnalytics = {
    overview: {
        totalUsers: 156,
        totalContent: 2845,
        activeUsers: 89,
        plexRequests: 124,
        weeklyGrowth: {
            users: 12.5,
            content: 8.3,
            requests: -2.1
        }
    },
    contentStats: {
        movies: 1654,
        tvShows: 1191,
        topGenres: [
            { name: 'Action', count: 456, percentage: 16 },
            { name: 'Drama', count: 389, percentage: 14 },
            { name: 'Comedy', count: 345, percentage: 12 },
            { name: 'Thriller', count: 298, percentage: 10 },
            { name: 'Sci-Fi', count: 234, percentage: 8 }
        ]
    },
    userActivity: {
        dailyActive: [
            { date: '2024-06-22', users: 45 },
            { date: '2024-06-23', users: 52 },
            { date: '2024-06-24', users: 48 },
            { date: '2024-06-25', users: 67 },
            { date: '2024-06-26', users: 59 },
            { date: '2024-06-27', users: 73 },
            { date: '2024-06-28', users: 89 }
        ],
        topUsers: [
            { name: 'John Doe', email: 'john@example.com', items: 156, requests: 45 },
            { name: 'Jane Smith', email: 'jane@example.com', items: 134, requests: 32 },
            { name: 'Mike Johnson', email: 'mike@example.com', items: 98, requests: 28 },
            { name: 'Sarah Wilson', email: 'sarah@example.com', items: 87, requests: 19 },
            { name: 'David Brown', email: 'david@example.com', items: 76, requests: 15 }
        ]
    },
    timeframes: {
        week: { users: 12, content: 89, requests: 23 },
        month: { users: 45, content: 234, requests: 67 },
        quarter: { users: 134, content: 789, requests: 156 }
    }
};

function MetricCard({ 
    title, 
    value, 
    change, 
    icon, 
    trend = 'up',
    description 
}: { 
    title: string, 
    value: string | number, 
    change?: string, 
    icon: any, 
    trend?: 'up' | 'down' | 'neutral',
    description?: string 
}) {
    const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                        <SafeIcon icon={icon} className="h-6 w-6 text-primary" size={24} />
                    </div>
                </div>
                {change && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                        <SafeIcon icon={trendIcon} className={`h-4 w-4 ${trendColor}`} size={16} />
                        <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
                        <span className="text-sm text-muted-foreground">from last week</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function GenreChart({ genres }: { genres: typeof mockAnalytics.contentStats.topGenres }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SafeIcon icon={BarChart3} className="h-5 w-5" size={20} />
                    Top Genres
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {genres.map((genre, index) => (
                        <div key={genre.name} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm font-medium w-2 text-muted-foreground">
                                    {index + 1}
                                </span>
                                <span className="text-sm font-medium">{genre.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${genre.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground w-8">{genre.percentage}%</span>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{genre.count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityChart({ data }: { data: typeof mockAnalytics.userActivity.dailyActive }) {
    const maxUsers = Math.max(...data.map(d => d.users));
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SafeIcon icon={Activity} className="h-5 w-5" size={20} />
                    Daily Active Users (Last 7 Days)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-2 h-32">
                    {data.map((day, index) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                                className="bg-primary rounded-t transition-all duration-300 hover:bg-primary/80 w-full min-h-[4px]"
                                style={{ height: `${(day.users / maxUsers) * 100}%` }}
                                title={`${day.users} users on ${new Date(day.date).toLocaleDateString()}`}
                            />
                            <span className="text-xs text-muted-foreground">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-xs font-medium">{day.users}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function TopUsersTable({ users }: { users: typeof mockAnalytics.userActivity.topUsers }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SafeIcon icon={Users} className="h-5 w-5" size={20} />
                    Most Active Users
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user, index) => (
                        <div key={user.email} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">{user.items} items</p>
                                <p className="text-sm text-muted-foreground">{user.requests} requests</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminAnalyticsPage() {
    const { user } = useUser();
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const refreshData = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setLastUpdated(new Date());
        }, 1000);
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

    const currentData = mockAnalytics.timeframes[timeframe];

    return (
        <div className="container mx-auto px-4 py-6 sm:py-12 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                            <SafeIcon icon={Shield} className="h-5 w-5" size={20} />
                        </Link>
                        <span className="text-muted-foreground">→</span>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Comprehensive insights into your platform's usage and performance.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <SafeIcon 
                            icon={RefreshCw} 
                            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                            size={16} 
                        />
                        Refresh
                    </Button>
                    <Button className="flex items-center gap-2">
                        <SafeIcon icon={Download} className="h-4 w-4" size={16} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-medium">Time Range:</span>
                <div className="flex gap-2">
                    {(['week', 'month', 'quarter'] as const).map((period) => (
                        <Button
                            key={period}
                            variant={timeframe === period ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTimeframe(period)}
                            className="capitalize"
                        >
                            {period}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="New Users"
                    value={currentData.users}
                    change={`+${mockAnalytics.overview.weeklyGrowth.users}%`}
                    icon={Users}
                    trend="up"
                    description={`This ${timeframe}`}
                />
                <MetricCard
                    title="Content Added"
                    value={currentData.content}
                    change={`+${mockAnalytics.overview.weeklyGrowth.content}%`}
                    icon={Database}
                    trend="up"
                    description={`This ${timeframe}`}
                />
                <MetricCard
                    title="Plex Requests"
                    value={currentData.requests}
                    change={`${mockAnalytics.overview.weeklyGrowth.requests}%`}
                    icon={Star}
                    trend="down"
                    description={`This ${timeframe}`}
                />
                <MetricCard
                    title="Active Users"
                    value={mockAnalytics.overview.activeUsers}
                    change="+5.2%"
                    icon={Activity}
                    trend="up"
                    description="Currently online"
                />
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full lg:w-auto lg:grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <SafeIcon icon={BarChart3} className="h-4 w-4" size={16} />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-2">
                        <SafeIcon icon={Film} className="h-4 w-4" size={16} />
                        Content
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <SafeIcon icon={Users} className="h-4 w-4" size={16} />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                        <SafeIcon icon={TrendingUp} className="h-4 w-4" size={16} />
                        Performance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ActivityChart data={mockAnalytics.userActivity.dailyActive} />
                        <GenreChart genres={mockAnalytics.contentStats.topGenres} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <TopUsersTable users={mockAnalytics.userActivity.topUsers} />
                        
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <SafeIcon icon={Database} className="h-5 w-5" size={20} />
                                    Content Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="relative w-32 h-32 mx-auto mb-4">
                                            <div className="absolute inset-0 rounded-full border-8 border-blue-200"></div>
                                            <div 
                                                className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent transform rotate-45"
                                                style={{
                                                    transform: `rotate(${(mockAnalytics.contentStats.movies / (mockAnalytics.contentStats.movies + mockAnalytics.contentStats.tvShows)) * 360}deg)`
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <SafeIcon icon={Film} className="h-8 w-8 text-blue-500" size={32} />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg">{mockAnalytics.contentStats.movies}</h3>
                                        <p className="text-sm text-muted-foreground">Movies</p>
                                        <Badge variant="secondary" className="mt-2">
                                            {Math.round((mockAnalytics.contentStats.movies / (mockAnalytics.contentStats.movies + mockAnalytics.contentStats.tvShows)) * 100)}%
                                        </Badge>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="relative w-32 h-32 mx-auto mb-4">
                                            <div className="absolute inset-0 rounded-full border-8 border-green-200"></div>
                                            <div 
                                                className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent transform"
                                                style={{
                                                    transform: `rotate(${(mockAnalytics.contentStats.tvShows / (mockAnalytics.contentStats.movies + mockAnalytics.contentStats.tvShows)) * 360}deg)`
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <SafeIcon icon={Tv} className="h-8 w-8 text-green-500" size={32} />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg">{mockAnalytics.contentStats.tvShows}</h3>
                                        <p className="text-sm text-muted-foreground">TV Shows</p>
                                        <Badge variant="secondary" className="mt-2">
                                            {Math.round((mockAnalytics.contentStats.tvShows / (mockAnalytics.contentStats.movies + mockAnalytics.contentStats.tvShows)) * 100)}%
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GenreChart genres={mockAnalytics.contentStats.topGenres} />
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Growth</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Movies Added (This Week)</span>
                                        <span className="font-semibold">+45</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">TV Shows Added (This Week)</span>
                                        <span className="font-semibold">+32</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Most Popular Genre</span>
                                        <Badge>Action</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Average Items per User</span>
                                        <span className="font-semibold">18.2</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ActivityChart data={mockAnalytics.userActivity.dailyActive} />
                        <TopUsersTable users={mockAnalytics.userActivity.topUsers} />
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <SafeIcon icon={Clock} className="h-5 w-5" size={20} />
                                    Response Times
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Search API</span>
                                        <span className="font-semibold text-green-500">145ms</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Watchlist Load</span>
                                        <span className="font-semibold text-green-500">89ms</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Image Load</span>
                                        <span className="font-semibold text-yellow-500">234ms</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Database Queries</span>
                                        <span className="font-semibold text-green-500">67ms</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Server Uptime</span>
                                        <Badge className="bg-green-500">99.9%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Database Status</span>
                                        <Badge className="bg-green-500">Online</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">API Status</span>
                                        <Badge className="bg-green-500">Healthy</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Error Rate</span>
                                        <span className="font-semibold text-green-500">0.01%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Resource Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>CPU Usage</span>
                                            <span>34%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{width: '34%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Memory Usage</span>
                                            <span>67%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Storage Usage</span>
                                            <span>23%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{width: '23%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}