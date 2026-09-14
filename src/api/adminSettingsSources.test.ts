import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { adminApi, type TicketSettings } from './admin';
import { partnerApi, type PartnerSettings } from './partners';

describe('Upstream Bot v4.7.1 setting-source contracts', () => {
  beforeEach(() => {
    clientMocks.get.mockReset();
    clientMocks.patch.mockReset();
  });

  it('preserves the partner env-locked field list from the API', async () => {
    const response: PartnerSettings = {
      withdrawal_enabled: true,
      withdrawal_min_amount_kopeks: 100000,
      withdrawal_cooldown_days: 30,
      withdrawal_requisites_text: '',
      partner_section_visible: true,
      referral_program_enabled: true,
      env_locked: ['partner_section_visible'],
    };
    clientMocks.get.mockResolvedValue({ data: response });

    await expect(partnerApi.getPartnerSettings()).resolves.toEqual(response);
    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/admin/partners/settings');
  });

  it('preserves the ticket env-locked field list from the API', async () => {
    const response: TicketSettings = {
      sla_enabled: true,
      sla_minutes: 30,
      sla_check_interval_seconds: 60,
      sla_reminder_cooldown_minutes: 15,
      support_system_mode: 'both',
      cabinet_user_notifications_enabled: true,
      cabinet_admin_notifications_enabled: true,
      env_locked: ['sla_minutes'],
    };
    clientMocks.get.mockResolvedValue({ data: response });

    await expect(adminApi.getTicketSettings()).resolves.toEqual(response);
    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/admin/tickets/settings');
  });
});
