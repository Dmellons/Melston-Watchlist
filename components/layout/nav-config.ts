import type { LucideIcon } from 'lucide-react'
import {
    Bookmark,
    Library,
    Disc,
    CalendarClock,
    Sparkles,
    BarChart3,
    User,
    Shield,
} from 'lucide-react'

export type NavItem = {
    label: string
    href: string
    icon: LucideIcon
    colorClass?: string
    adminOnly?: boolean
}

export const LIBRARY_ITEMS: NavItem[] = [
    { label: 'My Watchlist', href: '/watchlist', icon: Bookmark, colorClass: 'text-rose-500' },
    { label: 'Collections', href: '/collections', icon: Library, colorClass: 'text-amber-500' },
    { label: 'Physical Media', href: '/physical', icon: Disc, colorClass: 'text-blue-500' },
]

export const DISCOVER_ITEMS: NavItem[] = [
    { label: 'New & Upcoming', href: '/new', icon: CalendarClock, colorClass: 'text-violet-500' },
    { label: 'AI Suggestions', href: '/ai', icon: Sparkles, colorClass: 'text-primary' },
    { label: 'Streaming Insights', href: '/insights', icon: BarChart3, colorClass: 'text-green-500' },
]

export const ACCOUNT_ITEMS: NavItem[] = [
    { label: 'Profile & Settings', href: '/profile', icon: User },
    { label: 'Admin Dashboard', href: '/admin', icon: Shield, adminOnly: true },
]

/**
 * Exact match, or a strict path-segment prefix (`/admin` matches `/admin/users`
 * but never `/administrate`). Home only matches exactly. Detail routes
 * (/movie/123, /game/9) intentionally match nothing.
 */
export function isActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
}

export const isGroupActive = (pathname: string, items: NavItem[]) =>
    items.some(item => isActive(pathname, item.href))
