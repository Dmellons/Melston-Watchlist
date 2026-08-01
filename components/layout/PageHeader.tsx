import { cn } from "@/lib/utils";
import SafeIcon from "@/components/SafeIcon";
import type { LucideIcon } from "lucide-react";

const ICON_STYLES = {
    primary: 'bg-primary/10 text-primary',
    rose: 'bg-rose-500/10 text-rose-500',
    blue: 'bg-blue-500/10 text-blue-500',
    amber: 'bg-amber-500/10 text-amber-500',
    green: 'bg-green-500/10 text-green-500',
    violet: 'bg-violet-500/10 text-violet-500',
} as const;

interface PageHeaderProps {
    title: string;
    icon?: LucideIcon;
    color?: keyof typeof ICON_STYLES;
    subtitle?: string;
    /** Right-aligned controls (e.g. the Physical Library scan/add buttons) */
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, icon: Icon, color = 'primary', subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", ICON_STYLES[color])}>
                        <SafeIcon icon={Icon} className="h-6 w-6" size={24} />
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}

/** One section-heading style for content rows and page sections everywhere. */
export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", className)}>{children}</h2>;
}
