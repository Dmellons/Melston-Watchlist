'use client'

import { useUser } from "@/hooks/User";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SafeIcon from "@/components/SafeIcon";
import {
    BarChart3, Shield, Film, Tv, Star, Database, Users, RefreshCw, Gamepad2, ArrowLeft,
} from "lucide-react";

function MetricCard({ title, value, icon, description }: {
    title: string; value: string | number; icon: any; description?: string;
}) {
    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                    <SafeIcon icon={icon} className="h-6 w-6 text-primary" size={24} />
                </div>
            </CardContent>
        </Card>
    );
}

function BarList({ rows }: { rows: { label: string; count: number }[] }) {
    const max = Math.max(1, ...rows.map((r) => r.count));
    return (
        <div className="space-y-3">
            {rows.map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                    <span className="text-sm w-28 capitalize text-muted-foreground">{r.label.replace(/_/g, ' ')}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(r.count / max) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{r.count}</span>
                </div>
            ))}
        </div>
    );
}

export default function AdminAnalyticsPage() {
    const { user } = useUser();
    const qc = useQueryClient();

    const analyticsQ = useQuery({
        queryKey: ['admin', 'analytics'],
        queryFn: async () => { const r = await fetch('/api/admin/analytics'); return r.json(); },
        enabled: !!user?.admin,
    });
    const usersQ = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => { const r = await fetch('/api/admin/users'); return r.json(); },
        enabled: !!user?.admin,
    });

    if (!user) {
        return <div className="flex min-h-screen items-center justify-center"><p className="text-lg">Please sign in to access the admin panel.</p></div>;
    }
    if (!user.admin) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <SafeIcon icon={Shield} className="h-16 w-16 mx-auto mb-4 text-destructive" size={64} />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">You don&apos;t have permission to view analytics.</p>
                </div>
            </div>
        );
    }

    const a = analyticsQ.data?.success ? analyticsQ.data.data : null;
    const users = usersQ.data?.success ? usersQ.data.data : [];
    const topUsers = [...users].sort((x, y) => y.watchlistCount - x.watchlistCount).slice(0, 5);

    return (
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <SafeIcon icon={BarChart3} className="h-6 w-6 text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">System Analytics</h1>
                        <p className="text-muted-foreground">Real usage data across the platform.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin"><SafeIcon icon={ArrowLeft} className="h-4 w-4 mr-1" size={16} /> Dashboard</Link>
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => qc.invalidateQueries({ queryKey: ['admin'] })}
                        disabled={analyticsQ.isFetching}
                    >
                        <SafeIcon icon={RefreshCw} className={`h-4 w-4 mr-1 ${analyticsQ.isFetching ? 'animate-spin' : ''}`} size={16} />
                        Refresh
                    </Button>
                </div>
            </div>

            {analyticsQ.isLoading && <p className="text-muted-foreground">Loading analytics…</p>}
            {analyticsQ.data && !analyticsQ.data.success && (
                <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-destructive">{analyticsQ.data.error}</CardContent></Card>
            )}

            {a && (
                <>
                    {/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Total Items" value={a.totalItems} icon={Database} />
                        <MetricCard title="Movies" value={a.movies} icon={Film} />
                        <MetricCard title="TV Shows" value={a.tvShows} icon={Tv} />
                        <MetricCard title="Plex Requests" value={a.plexRequests} icon={Star} />
                        <MetricCard
                            title="Total Users"
                            value={usersQ.data?.success ? usersQ.data.total : '—'}
                            icon={Users}
                            description={usersQ.data && !usersQ.data.success ? 'Needs users.read scope' : undefined}
                        />
                        <MetricCard title="Rated Items" value={a.ratingAnalytics.totalRated} icon={Star} />
                        <MetricCard title="Avg Rating" value={`${a.ratingAnalytics.averageRating}/10`} icon={Star} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Watch status */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><SafeIcon icon={BarChart3} className="h-5 w-5" size={20} /> Watch Status</CardTitle></CardHeader>
                            <CardContent>
                                <BarList rows={Object.entries(a.watchStatusBreakdown).map(([label, count]) => ({ label, count: count as number }))} />
                            </CardContent>
                        </Card>

                        {/* Rating distribution */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><SafeIcon icon={Star} className="h-5 w-5" size={20} /> Rating Distribution</CardTitle></CardHeader>
                            <CardContent>
                                <BarList rows={Object.entries(a.ratingAnalytics.ratingDistribution).map(([label, count]) => ({ label, count: count as number }))} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Top rated */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><SafeIcon icon={Star} className="h-5 w-5" size={20} /> Top Rated</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {a.topRated.length === 0 && <p className="text-sm text-muted-foreground">No rated items yet.</p>}
                                {a.topRated.map((item: any) => (
                                    <div key={item.$id} className="flex items-center justify-between text-sm">
                                        <span className="truncate">{item.title}</span>
                                        <Badge variant="secondary"><SafeIcon icon={Star} className="h-3 w-3 mr-1 fill-current" size={12} />{item.rating}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Top users */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><SafeIcon icon={Users} className="h-5 w-5" size={20} /> Most Active Users</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {!usersQ.data?.success && <p className="text-sm text-muted-foreground">User data needs the users.read scope on the API key.</p>}
                                {topUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between text-sm">
                                        <span className="truncate">{u.email}</span>
                                        <span className="text-muted-foreground">{u.watchlistCount} items · {u.plexRequests} req</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
