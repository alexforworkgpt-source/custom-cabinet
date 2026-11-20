import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import { hasBot53Contract } from '@/config/upstreamBotContract';
import { useSubscriptionMirror } from '@/hooks/useSubscriptionMirror';
import { useAuthStore } from '@/store/auth';
import { MirrorSelector } from './MirrorSelector';

export function SubscriptionMirrorSelector({ subscriptionId }: { subscriptionId: number }) {
  const userId = useAuthStore((state) => state.user?.id);
  const { data } = useQuery({
    queryKey: ['connection-link', subscriptionId, userId],
    queryFn: () => subscriptionApi.getConnectionLink(subscriptionId),
    enabled: Boolean(userId) && hasBot53Contract(),
    retry: false,
  });
  const current = data?.subscription_id === subscriptionId ? data : undefined;
  const selection = useSubscriptionMirror(current, current?.subscription_url ?? null);
  return <MirrorSelector selection={selection} />;
}
