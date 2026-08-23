import type { GeoCheckJobResponse } from '../../../api/adminRemnawave';

export type GeoCheckPhase = 'idle' | 'running' | 'done' | 'error';

export interface GeoCheckError {
  kind: 'request' | 'timeout' | 'failed';
  message: string | null;
}

interface GeoCheckJobStateInput {
  requestError: string | null;
  queryError: string | null;
  timedOut: boolean;
  startPending: boolean;
  jobId: string | null;
  job: GeoCheckJobResponse | null;
}

export function resolveGeoCheckJobState({
  requestError,
  queryError,
  timedOut,
  startPending,
  jobId,
  job,
}: GeoCheckJobStateInput): { phase: GeoCheckPhase; error: GeoCheckError | null } {
  const settled = Boolean(job?.is_completed || job?.is_failed);
  const failed = Boolean(job?.is_failed || (settled && job?.result && !job.result.success));

  if (requestError !== null || queryError !== null) {
    const message = requestError ?? queryError;
    return { phase: 'error', error: { kind: 'request', message: message || null } };
  }
  if (settled) {
    return {
      phase: failed ? 'error' : 'done',
      error: failed ? { kind: 'failed', message: job?.result?.message ?? null } : null,
    };
  }
  if (timedOut) return { phase: 'error', error: { kind: 'timeout', message: null } };
  if (startPending || jobId) return { phase: 'running', error: null };
  return { phase: 'idle', error: null };
}
