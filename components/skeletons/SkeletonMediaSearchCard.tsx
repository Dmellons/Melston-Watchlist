import Image from 'next/image';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonMediaSearchCard = () => {
  return (
    <Skeleton className="flex flex-col sm:flex-row justify-between items-center w-full sm:w-[400px] p-2 hover:z-0 hover:border hover:border-primary/50 sm:hover:scale-100">
      <Skeleton className="flex flex-col justify-between items-center sm:flex-row sm:justify-center sm:gap-4 sm:min-w-48">
        <Skeleton className="hover:scale-105 hover:ease-in-out hover:duration-300 w-full">
          <Skeleton className="flex flex-col items-center gap-1">
            <Skeleton className="w-32 h-48 bg-muted/90" />
             
          </Skeleton>
        </Skeleton>
      </Skeleton>
    </Skeleton>
  );
};

export default SkeletonMediaSearchCard;