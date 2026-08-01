'use client'

import { useMemo, useState } from "react";
import { useUser } from "@/hooks/User";
import { useQuery } from "@tanstack/react-query";
import type { AdminUserRow } from "@/lib/server/adminUsers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import SafeIcon from "@/components/SafeIcon";
import {
    Users, Shield, Search, Mail, Calendar, Activity, UserCheck, UserX, Crown, ArrowLeft, Loader2,
} from "lucide-react";

function roleBadge(role: AdminUserRow['role']) {
    switch (role) {
        case 'admin': return { icon: Crown, cls: 'bg-amber-500 text-white' };
        case 'tester': return { icon: Shield, cls: 'bg-blue-500 text-white' };
        default: return { icon: Users, cls: 'bg-muted text-muted-foreground' };
    }
}

function UserCard({ row }: { row: AdminUserRow }) {
    const initials = row.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const r = roleBadge(row.role);
    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{row.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <SafeIcon icon={Mail} className="h-3 w-3" size={12} />
                            <span className="truncate">{row.email}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <Badge className={r.cls}>
                            <SafeIcon icon={r.icon} className="h-3 w-3 mr-1" size={12} />
                            {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={row.status ? 'default' : 'secondary'}>
                            <SafeIcon icon={row.status ? UserCheck : UserX} className="h-3 w-3 mr-1" size={12} />
                            {row.status ? 'Active' : 'Blocked'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Watchlist Items</span>
                        <span className="font-medium">{row.watchlistCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plex Requests</span>
                        <span className="font-medium">{row.plexRequests}</span>
                    </div>
                    <div className="pt-3 border-t border-border/50 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
                            <span>Joined {new Date(row.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <SafeIcon icon={Activity} className="h-3 w-3" size={12} />
                            <span>Last active {row.lastActive ? new Date(row.lastActive).toLocaleDateString() : '—'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatsCard({ title, value, description, icon }: { title: string; value: number | string; description: string; icon: any }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                    <SafeIcon icon={icon} className="h-6 w-6 text-primary" size={24} />
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminUsersPage() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");

    const usersQ = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => {
            const r = await fetch('/api/admin/users');
            return r.json();
        },
        enabled: !!user?.admin,
    });
    const rows: AdminUserRow[] = usersQ.data?.success ? usersQ.data.data : [];

    const filtered = useMemo(
        () => rows.filter((u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())),
        [rows, searchQuery],
    );

    if (!user) {
        return <div className="flex min-h-screen items-center justify-center"><p className="text-lg">Please sign in to access the admin panel.</p></div>;
    }
    if (!user.admin) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <SafeIcon icon={Shield} className="h-16 w-16 mx-auto mb-4 text-destructive" size={64} />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    const total = usersQ.data?.success ? usersQ.data.total : 0;
    const active = rows.filter((u) => u.status).length;
    const admins = rows.filter((u) => u.role === 'admin').length;

    return (
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><SafeIcon icon={Users} className="h-6 w-6 text-primary" size={24} /></div>
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">Real accounts from your Appwrite project.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin"><SafeIcon icon={ArrowLeft} className="h-4 w-4 mr-1" size={16} /> Dashboard</Link>
                </Button>
            </div>

            {usersQ.data && !usersQ.data.success && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 text-destructive text-sm">
                        Couldn&apos;t load users: {usersQ.data.error}. The API key likely needs the <code>users.read</code> scope.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard title="Total Users" value={total} description="Registered accounts" icon={Users} />
                <StatsCard title="Active" value={active} description="Not blocked" icon={UserCheck} />
                <StatsCard title="Admins" value={admins} description="With admin label" icon={Crown} />
            </div>

            <div className="relative max-w-md">
                <SafeIcon icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" size={16} />
                <Input className="pl-9" placeholder="Search by name or email…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {usersQ.isLoading && (
                <div className="flex justify-center py-12 text-muted-foreground"><SafeIcon icon={Loader2} className="h-6 w-6 animate-spin" size={24} /></div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((row) => <UserCard key={row.id} row={row} />)}
            </div>

            {!usersQ.isLoading && usersQ.data?.success && filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No users match your search.</p>
            )}
        </div>
    );
}
