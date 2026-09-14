import apiClient from './client';

export interface ActivityEvent {
  kind: 'screen' | 'click';
  path: string;
  label?: string;
}

export const activityApi = {
  sendEvents: (events: ActivityEvent[]): Promise<void> =>
    apiClient.post('/cabinet/activity/events', { events }).then(
      () => undefined,
      () => undefined,
    ),
};
