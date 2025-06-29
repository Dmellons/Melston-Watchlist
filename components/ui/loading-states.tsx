// components/ui/loading-states.tsx
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import SafeIcon from '@/components/SafeIcon';
import { Loader2, Film, Tv, Search } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <SafeIcon
        icon={Loader2}
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )}
        size={size === 'sm' ? 16 : size === 'md' ? 32 : size === 'lg' ? 48 : 64}
      />
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

export function WatchlistCardSkeleton() {
  return (
    <div className="flex flex-col group animate-pulse">
      <div className="w-64 h-96 bg-muted/30 rounded-xl border border-border/30 overflow-hidden">
        {/* Header badges area */}
        <div className="absolute top-3 left-3 z-10">
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Image area */}
        <div className="h-80 bg-muted/50 rounded-t-xl relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <SafeIcon
              icon={Film}
              className="h-16 w-16 text-muted-foreground/30"
              size={64}
            />
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
      
      {/* Providers skeleton */}
      <div className="mt-3 px-2">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="relative">
            <Skeleton className="w-full h-60 sm:h-72 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SafeIcon
                icon={Film}
                className="h-12 w-12 text-muted-foreground/20"
                size={48}
              />
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProvidersBlockSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/30 animate-pulse">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-5 w-8 rounded-full" />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon = Search, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <SafeIcon
          icon={Icon}
          className="h-8 w-8 text-muted-foreground"
          size={32}
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function WatchlistGridSkeleton() {
  return (
    <div className="flex flex-col w-full gap-4 sm:px-4">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="hidden sm:flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        
        {/* Controls skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/30 p-4 rounded-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
            <Skeleton className="h-10 w-full max-w-xs" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 place-items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <WatchlistCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Error states
interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error while loading this content.",
  retry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <SafeIcon
          icon={AlertTriangle}
          className="h-8 w-8 text-destructive"
          size={32}
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}