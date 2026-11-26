import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

export function TicketListSkeleton() {
  return (
    <SkeletonGroup className="min-h-[200px] space-y-2">
      {[1, 2].map((row) => (
        <div key={row} className="rounded-bento border border-dark-700/50 bg-dark-800/30 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function TicketMessagesSkeleton() {
  return (
    <SkeletonGroup className="space-y-4">
      <div className="mr-4 rounded-xl border border-dark-700/30 bg-dark-800/50 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="ml-4 rounded-xl border border-accent-500/20 bg-accent-500/10 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-2/3" />
      </div>
    </SkeletonGroup>
  );
}
