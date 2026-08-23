export interface AdminSubscriptionDeletionInput {
  id: number;
  tariff_name: string | null;
  is_active: boolean;
  is_trial: boolean;
}

export interface AdminSubscriptionDeletionDecision {
  confirmation: 'ordinary' | 'destructive';
  force: boolean;
  subscriptionName: string;
}

interface AdminSubscriptionDeletionErrorMessages {
  conflict: string;
  fallback: string;
  notFound: string;
}

export function getAdminSubscriptionDeletionDecision(
  subscription: AdminSubscriptionDeletionInput,
): AdminSubscriptionDeletionDecision {
  const requiresForce = subscription.is_active && !subscription.is_trial;

  return {
    confirmation: requiresForce ? 'destructive' : 'ordinary',
    force: requiresForce,
    subscriptionName: subscription.tariff_name?.trim() || `#${subscription.id}`,
  };
}

export function getAdminSubscriptionDeletionErrorMessage(
  error: unknown,
  messages: AdminSubscriptionDeletionErrorMessages,
): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const fallback =
    status === 409 ? messages.conflict : status === 404 ? messages.notFound : messages.fallback;

  return getApiErrorMessage(error, fallback);
}
import { getApiErrorMessage } from './api-error';
