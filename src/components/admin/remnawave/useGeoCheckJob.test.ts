import { describe, expect, it } from 'vitest';
import { resolveGeoCheckJobState } from './geoCheckJobState';

const baseInput = {
  requestError: null,
  queryError: null,
  timedOut: false,
  startPending: false,
  jobId: 'job-1',
  job: null,
};

describe('resolveGeoCheckJobState', () => {
  it('surfaces a polling request failure before the timeout state', () => {
    expect(
      resolveGeoCheckJobState({
        ...baseInput,
        queryError: 'Permission denied',
        timedOut: true,
      }),
    ).toEqual({
      phase: 'error',
      error: { kind: 'request', message: 'Permission denied' },
    });
  });

  it('keeps an unfinished successful query in the running state', () => {
    expect(resolveGeoCheckJobState(baseInput)).toEqual({ phase: 'running', error: null });
  });

  it('shows a completed report when its final poll arrives at the timeout boundary', () => {
    expect(
      resolveGeoCheckJobState({
        ...baseInput,
        timedOut: true,
        job: {
          job_id: 'job-1',
          is_completed: true,
          is_failed: false,
          result: { success: true },
        },
      }),
    ).toEqual({ phase: 'done', error: null });
  });
});
