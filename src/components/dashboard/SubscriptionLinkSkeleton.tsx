import { Skeleton } from '@/components/ui/skeleton';

export function SubscriptionLinkSkeleton({ loadingLabel }: { loadingLabel?: string }) {
  return (
    <div
      className="flex min-h-11 gap-2"
      role={loadingLabel ? 'status' : undefined}
      aria-label={loadingLabel}
      aria-hidden={loadingLabel ? undefined : true}
    >
      <Skeleton className="h-11 min-w-0 flex-1 rounded-[14px]" />
      <Skeleton className="h-11 w-11 shrink-0 rounded-[14px]" />
      {/* The QR button fits a 20px icon, 24px of padding and two 1px borders. */}
      <Skeleton className="h-11 w-[calc(2.75rem+2px)] shrink-0 rounded-[14px]" />
    </div>
  );
}
