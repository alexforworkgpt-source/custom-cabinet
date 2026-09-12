import apiClient from './client';

export interface EmailQueueItem {
  id: number;
  to_email: string;
  subject: string;
  status: 'pending' | 'sent' | 'dead';
  attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface EmailQueueState {
  pending: number;
  sent: number;
  dead: number;
  smtp_configured: boolean;
  items: EmailQueueItem[];
}

export interface ClearEmailQueueResult {
  removed: number;
  pending_only: boolean;
}

export const adminEmailQueueApi = {
  getQueue: async (): Promise<EmailQueueState> => {
    const response = await apiClient.get<EmailQueueState>('/cabinet/admin/email-queue');
    return response.data;
  },

  clearQueue: async (pendingOnly = false): Promise<ClearEmailQueueResult> => {
    const response = await apiClient.delete<ClearEmailQueueResult>('/cabinet/admin/email-queue', {
      params: { pending_only: pendingOnly },
    });
    return response.data;
  },
};
