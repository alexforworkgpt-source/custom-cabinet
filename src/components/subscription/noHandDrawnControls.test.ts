import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('subscription controls use the shared icon set', () => {
  it.each(['SubscriptionListCard.tsx', '../../pages/Subscription.tsx'])('%s', (relativePath) => {
    const source = readFileSync(join(__dirname, relativePath), 'utf8');
    expect(source).not.toContain('<svg');
  });
});
