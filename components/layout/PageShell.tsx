import { cn } from "@/lib/utils";

interface PageShellProps {
    children: React.ReactNode;
    /** 'default' fills the root max-w-7xl column; 'narrow' centers a max-w-4xl column */
    width?: 'default' | 'narrow';
    className?: string;
}

/**
 * Standard page wrapper: the root layout owns overall width (max-w-7xl) and
 * the frame; this owns gutters and vertical rhythm so every page matches.
 */
export default function PageShell({ children, width = 'default', className }: PageShellProps) {
    return (
        <div
            className={cn(
                "w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16 space-y-8",
                width === 'narrow' && "max-w-4xl mx-auto",
                className,
            )}
        >
            {children}
        </div>
    );
}
