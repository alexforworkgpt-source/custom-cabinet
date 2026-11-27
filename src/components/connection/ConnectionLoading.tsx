import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import { isInTelegramWebApp } from '@/hooks/useTelegramSDK';
import { cn } from '@/lib/utils';

export function ConnectionLoading({ search }: { search: string }) {
  const step = new URLSearchParams(search).get('step');
  const showBack = !isInTelegramWebApp() || ['application', 'add', 'success'].includes(step ?? '');

  return (
    <SkeletonGroup className={cn('pb-2', step === 'application' ? 'space-y-2' : 'space-y-4')}>
      <div className="flex items-center gap-3">
        {showBack && <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />}
        <Skeleton className="h-7 flex-1" />
        {step === 'add' && <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Skeleton count={4} className="h-1 rounded-full" />
      </div>
      <Skeleton variant="card" className="h-[120px]" />
    </SkeletonGroup>
  );
}
