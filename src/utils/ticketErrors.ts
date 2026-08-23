import axios from 'axios';

export interface SafeTicketErrorLogContext {
  status?: number;
  code?: string;
  name?: string;
}

export function getSafeTicketErrorLogContext(error: unknown): SafeTicketErrorLogContext {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? { name: error.name } : {};
  }

  const context: SafeTicketErrorLogContext = {};
  if (typeof error.response?.status === 'number') context.status = error.response.status;
  if (typeof error.code === 'string') context.code = error.code;
  if (typeof error.name === 'string') context.name = error.name;
  return context;
}

/**
 * Ticket creation uses 409 when the user already has an open ticket. Match the
 * stable status instead of the backend's English detail text.
 */
export function isOpenTicketConflict(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}
