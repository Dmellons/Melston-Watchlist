'use client'

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WatchlistDocument } from "@/types/appwrite";
import { Models, database } from "@/lib/appwrite";
import { Query } from "appwrite";
import { 
    Users, 
    Shield, 
    Search, 
    Plus, 
    Settings, 
    Mail, 
    Calendar,
    Activity,
    MoreHorizontal,
    UserCheck,
    UserX,
    Crown
} from "lucide-react";
import Link from "next/link";
import SafeIcon from "@/components/SafeIcon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MockUser {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    role: 'admin' | 'user' | 'moderator';
    joinDate: string;
    lastActive: string;
    watchlistCount: number;
    plexRequests: number;
}

// Mock user data - replace with real API calls
const mockUsers: MockUser[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        role: 'admin',
        joinDate: '2024-01-15',
        lastActive: '2024-06-28',
        watchlistCount: 45,
        plexRequests: 12
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'active',
        role: 'user',
        joinDate: '2024-02-20',
        lastActive: '2024-06-27',
        watchlistCount: 23,
        plexRequests: 5
    },
    {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        status: 'inactive',
        role: 'moderator',
        joinDate: '2024-03-10',
        lastActive: '2024-06-20',
        watchlistCount: 67,
        plexRequests: 18
    },
    {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        status: 'active',
        role: 'user',
        joinDate: '2024-04-05',
        lastActive: '2024-06-28',
        watchlistCount: 31,
        plexRequests: 8
    },
    {
        id: '5',
        name: 'David Brown',
        email: 'david@example.com',
        status: 'active',
        role: 'user',
        joinDate: '2024-05-12',
        lastActive: '2024-06-26',
        watchlistCount: 19,
        plexRequests: 3
    }
];

function UserCard({ user }: { user: MockUser }) {
    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'admin': return Crown;
            case 'moderator': return Shield;
            default: return Users;
        }
    };

    const getRoleColor = (role: string) => {
        switch(role) {
            case 'admin': return 'bg-amber-500 text-white';
            case 'moderator': return 'bg-blue-500 text-white';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const RoleIcon = getRoleIcon(user.role);
    const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <SafeIcon icon={Mail} className="h-3 w-3" size={12} />
                                <span>{user.email}</span>
                            </div>
                        </div>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <SafeIcon icon={MoreHorizontal} className="h-4 w-4" size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <SafeIcon icon={Settings} className="h-4 w-4 mr-2" size={16} />
                                Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <SafeIcon icon={Activity} className="h-4 w-4 mr-2" size={16} />
                                View Activity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                <SafeIcon icon={UserX} className="h-4 w-4 mr-2" size={16} />
                                Deactivate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <Badge className={getRoleColor(user.role)}>
                            <SafeIcon icon={RoleIcon} className="h-3 w-3 mr-1" size={12} />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            <SafeIcon 
                                icon={user.status === 'active' ? UserCheck : UserX} 
                                className="h-3 w-3 mr-1" 
                                size={12} 
                            />
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Watchlist Items</span>
                        <span className="font-medium">{user.watchlistCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plex Requests</span>
                        <span className="font-medium">{user.plexRequests}</span>
                    </div>

                    <div className="pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <SafeIcon icon={Calendar} className="h-3 w-3" size={12} />
                            <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <SafeIcon icon={Activity} className="h-3 w-3" size={12} />
                            <span>Last active {new Date(user.lastActive).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatsCard({ 
    title, 
    value, 
    description, 
    icon, 
    trend 
}: { 
    title: string, 
    value: number, 
    description: string, 
    icon: any, 
    trend?: string 
}) {
    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                        <SafeIcon icon={icon} className="h-6 w-6 text-primary" size={24} />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <span className="text-sm text-green-500 font-medium">{trend}</span>
                        <span className="text-sm text-muted-foreground ml-1">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminUsersPage() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<MockUser[]>(mockUsers);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.admin) {
            return;
        }
        
        // Filter users based on search query
        const filtered = mockUsers.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchQuery, user]);

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

    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const adminUsers = mockUsers.filter(u => u.role === 'admin').length;
    const totalWatchlistItems = mockUsers.reduce((sum, u) => sum + u.watchlistCount, 0);

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
                        <h1 className="text-3xl font-bold">User Management</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage user accounts, roles, and permissions across your platform.
                    </p>
                </div>
                
                <Button className="flex items-center gap-2">
                    <SafeIcon icon={Plus} className="h-4 w-4" size={16} />
                    Add User
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Users"
                    value={totalUsers}
                    description="All registered users"
                    icon={Users}
                    trend="+12%"
                />
                <StatsCard
                    title="Active Users"
                    value={activeUsers}
                    description="Currently active"
                    icon={UserCheck}
                    trend="+8%"
                />
                <StatsCard
                    title="Administrators"
                    value={adminUsers}
                    description="Admin & moderator roles"
                    icon={Crown}
                />
                <StatsCard
                    title="Total Content"
                    value={totalWatchlistItems}
                    description="Watchlist items created"
                    icon={Activity}
                    trend="+23%"
                />
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <SafeIcon 
                                icon={Search} 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                                size={16} 
                            />
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                Filter by Role
                            </Button>
                            <Button variant="outline">
                                Filter by Status
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((mockUser) => (
                    <UserCard key={mockUser.id} user={mockUser} />
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <SafeIcon icon={Users} className="h-12 w-12 mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery ? `No users match "${searchQuery}"` : "No users available"}
                    </p>
                </div>
            )}
        </div>
    );
}