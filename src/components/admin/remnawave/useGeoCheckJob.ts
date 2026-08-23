import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminRemnawaveApi, type GeoCheckRequest, type GeoCheckResult } from '@/api/adminRemnawave';
import { getApiErrorMessage } from '@/utils/api-error';
import {
  type GeoCheckError,
  type GeoCheckPhase,
  resolveGeoCheckJobState,
} from './geoCheckJobState';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 180_000;

export interface GeoCheckJob {
  phase: GeoCheckPhase;
  result: GeoCheckResult | null;
  error: GeoCheckError | null;
  start: (body: GeoCheckRequest) => void;
  retry: () => void;
  reset: () => void;
}

export function useGeoCheckJob(nodeUuid: string): GeoCheckJob {
  const [jobId, setJobId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const lastRequest = useRef<GeoCheckRequest>({});
  const startedAt = useRef(0);

  const startMutation = useMutation({
    mutationFn: (body: GeoCheckRequest) => adminRemnawaveApi.startNodeGeoCheck(nodeUuid, body),
    onSuccess: (data) => {
      startedAt.current = Date.now();
      setTimedOut(false);
      setJobId(data.job_id);
    },
    onError: (error) => setRequestError(getApiErrorMessage(error, '')),
  });

  const jobQuery = useQuery({
    queryKey: ['admin-remnawave-geocheck', jobId],
    queryFn: () => adminRemnawaveApi.getGeoCheckJob(jobId as string),
    enabled: Boolean(jobId),
    gcTime: 0,
    retry: false,
    refetchInterval: (query) => {
      if (query.state.status === 'error') return false;
      if (timedOut) return false;
      const data = query.state.data;
      if (!data) return POLL_INTERVAL_MS;
      return data.is_completed || data.is_failed ? false : POLL_INTERVAL_MS;
    },
  });

  const jobSettled = Boolean(jobQuery.data?.is_completed || jobQuery.data?.is_failed);

  useEffect(() => {
    if (!jobId || jobSettled) return;

    const remaining = Math.max(0, POLL_TIMEOUT_MS - (Date.now() - startedAt.current));
    const timeout = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(timeout);
  }, [jobId, jobSettled]);

  const start = useCallback(
    (body: GeoCheckRequest) => {
      lastRequest.current = body;
      setRequestError(null);
      setTimedOut(false);
      setJobId(null);
      startMutation.mutate(body);
    },
    [startMutation],
  );

  const retry = useCallback(() => start(lastRequest.current), [start]);

  const reset = useCallback(() => {
    setJobId(null);
    setRequestError(null);
    setTimedOut(false);
    startMutation.reset();
  }, [startMutation]);

  const job = jobQuery.data;
  const queryError = jobQuery.isError ? getApiErrorMessage(jobQuery.error, '') : null;
  const { phase, error } = resolveGeoCheckJobState({
    requestError,
    queryError,
    timedOut,
    startPending: startMutation.isPending,
    jobId,
    job: job ?? null,
  });

  return {
    phase,
    result: job?.result ?? null,
    error,
    start,
    retry,
    reset,
  };
}
