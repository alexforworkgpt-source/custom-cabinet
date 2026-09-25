import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { transactionTypeBadge, transactionTypeLabelKey } from './transactionType';

const BOT_TYPES = [
  'deposit',
  'withdrawal',
  'subscription_payment',
  'refund',
  'failed_refund',
  'referral_reward',
  'poll_reward',
  'gift_payment',
];

const LOCALES = ['ru', 'en', 'zh', 'fa'].map((lang) => ({
  lang,
  dict: JSON.parse(readFileSync(join(__dirname, '..', 'locales', `${lang}.json`), 'utf8')),
}));

const lookup = (dict: Record<string, unknown>, key: string) =>
  key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], dict);

describe('transaction type', () => {
  it.each(BOT_TYPES)('%s has a translated label in every supported locale', (type) => {
    const key = transactionTypeLabelKey(type);
    for (const { lang, dict } of LOCALES) {
      expect(typeof lookup(dict, key), `${lang}: ${key}`).toBe('string');
    }
  });

  it('is case-insensitive', () => {
    expect(transactionTypeLabelKey('DEPOSIT')).toBe(transactionTypeLabelKey('deposit'));
    expect(transactionTypeBadge('Referral_Reward')).toBe(transactionTypeBadge('referral_reward'));
  });

  it('uses a neutral translated label for an unknown future type', () => {
    expect(transactionTypeLabelKey('something_new')).toBe('balance.otherOperation');
    expect(transactionTypeBadge('something_new')).toBe('badge-neutral');
  });
});
