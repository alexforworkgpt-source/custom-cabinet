import assert from 'node:assert/strict';
import { test } from 'node:test';
import { record } from './fixture.mjs';

test('release record binds Cabinet source, upstream provenance, Bot proof and known limits', async () => {
  const { validateRecord } = await import('./policy.mjs');
  const selected = record();
  validateRecord(selected, selected.cabinet, selected.upstream);
  for (const change of [
    (value) => {
      value.cabinet.sha = 'f'.repeat(40);
    },
    (value) => {
      value.upstream.sha = 'f'.repeat(40);
    },
    (value) => {
      value.bot.compatibility_evidence = '';
    },
    (value) => {
      value.owner_approved = false;
    },
    (value) => {
      value.limitations = [];
    },
    (value) => {
      value.frontend_policy.simple_mode = 'enabled';
    },
    (value) => {
      value.frontend_policy.bscheker = 'enabled';
    },
    (value) => {
      value.bot.unreviewed_extra = 'Unexpected public payload';
    },
    (value) => {
      value.cabinet.unreviewed_extra = 'Unexpected public payload';
    },
    (value) => {
      value.limitations[0].unreviewed_extra = 'Unexpected public payload';
    },
  ]) {
    const invalid = record();
    change(invalid);
    assert.throws(() => validateRecord(invalid, selected.cabinet, selected.upstream));
  }
});
