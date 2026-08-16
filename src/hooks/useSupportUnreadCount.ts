import { useQuery } from '@tanstack/react-query';
import { ticketNotificationsApi } from '@/api/ticketNotifications';

export function useSupportUnreadCount(enabled = true): number {
  const { data } = useQuery({
    queryKey: ['ticket-notifications-count'],
    queryFn: ticketNotificationsApi.getUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled,
  });

  return data?.unread_count ?? 0;
}
