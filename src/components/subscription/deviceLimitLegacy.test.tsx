// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeviceLimitPanel } from './DeviceLimitSheet';
import { PlatformProvider } from '@/platform/PlatformProvider';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

afterEach(cleanup);

describe('device limit actions', () => {
  it('does not expose the device addon action when the caller disallows it', () => {
    render(
      <PlatformProvider>
        <DeviceLimitPanel
          subscriptionName="Legacy"
          deviceLimit={3}
          connectedDevices={1}
          isTrial={false}
        >
          <div>devices</div>
        </DeviceLimitPanel>
      </PlatformProvider>,
    );

    expect(screen.queryByText('subscription.additionalOptions.buyDevices')).toBeNull();
  });
});
