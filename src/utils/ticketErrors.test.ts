import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { getSafeTicketErrorLogContext, isOpenTicketConflict } from './ticketErrors';

function axiosErrorWithStatus(status: number, detail?: unknown): AxiosError {
  const headers = new AxiosHeaders();
  const config = { headers };
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    config,
    {},
    {
      status,
      statusText: '',
      headers,
      config,
      data: detail === undefined ? {} : { detail },
    },
  );
}

describe('isOpenTicketConflict', () => {
  it('detects a 409 response from ticket creation', () => {
    expect(isOpenTicketConflict(axiosErrorWithStatus(409, 'You already have an open ticket'))).toBe(
      true,
    );
  });

  it('does not depend on the backend detail text', () => {
    expect(isOpenTicketConflict(axiosErrorWithStatus(409))).toBe(true);
    expect(isOpenTicketConflict(axiosErrorWithStatus(409, { code: 'open_ticket_exists' }))).toBe(
      true,
    );
  });

  it('does not treat other backend failures as an open-ticket conflict', () => {
    expect(isOpenTicketConflict(axiosErrorWithStatus(403, 'Support tickets are disabled'))).toBe(
      false,
    );
    expect(isOpenTicketConflict(axiosErrorWithStatus(400))).toBe(false);
    expect(isOpenTicketConflict(axiosErrorWithStatus(500))).toBe(false);
  });

  it('is null-safe for non-Axios errors', () => {
    expect(isOpenTicketConflict(new Error('boom'))).toBe(false);
    expect(isOpenTicketConflict(undefined)).toBe(false);
    expect(isOpenTicketConflict(null)).toBe(false);
  });
});

describe('getSafeTicketErrorLogContext', () => {
  it('returns only safe Axios metadata', () => {
    const error = axiosErrorWithStatus(422, {
      title: 'private title',
      message: 'private message',
      media_file_id: 'private-media-id',
    });
    error.message = 'private message';
    if (!error.config) throw new Error('Expected Axios request config');
    error.config.data = {
      title: 'private title',
      message: 'private message',
      media_file_id: 'private-media-id',
    };

    expect(getSafeTicketErrorLogContext(error)).toEqual({
      status: 422,
      code: 'ERR_BAD_REQUEST',
      name: 'AxiosError',
    });
  });
});
