import { beforeEach, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('./client', () => ({ default: { get } }));

import { infoApi } from './info';

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { content: 'Document', updated_at: null } });
});

it('requests recurring terms in the interface language', async () => {
  await infoApi.getRecurrentPayments('en');
  expect(get).toHaveBeenCalledWith('/cabinet/info/recurrent-payments', {
    params: { language: 'en' },
  });
});

it.each([
  [infoApi.getFaqPages, '/cabinet/info/faq'],
  [infoApi.getRules, '/cabinet/info/rules'],
  [infoApi.getPrivacyPolicy, '/cabinet/info/privacy-policy'],
  [infoApi.getPublicOffer, '/cabinet/info/public-offer'],
])('passes language to document endpoint %#', async (fetch, endpoint) => {
  await fetch('fa');
  expect(get).toHaveBeenCalledWith(endpoint, { params: { language: 'fa' } });
});

it('passes language when opening a specific FAQ page', async () => {
  await infoApi.getFaqPage(7, 'zh');
  expect(get).toHaveBeenCalledWith('/cabinet/info/faq/7', { params: { language: 'zh' } });
});
