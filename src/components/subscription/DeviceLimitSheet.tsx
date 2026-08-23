import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, WarningIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';

interface DeviceLimitPanelProps {
  children: ReactNode;
  subscriptionName: string;
  deviceLimit: number;
  connectedDevices: number | undefined;
  isTrial: boolean;
  onAddSlots: () => void;
}

export function DeviceLimitPanel({
  children,
  subscriptionName,
  deviceLimit,
  connectedDevices,
  isTrial,
  onAddSlots,
}: DeviceLimitPanelProps) {
  const { t } = useTranslation();
  const full = connectedDevices !== undefined && deviceLimit > 0 && connectedDevices >= deviceLimit;
  const canAddSlots = !isTrial && deviceLimit !== 0;

  return (
    <div className="space-y-4">
      {full && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning-400/20 bg-warning-400/10 p-3.5">
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning-400" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warning-300">
              {t('dashboard.deviceLimitReached')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dark-300">
              {subscriptionName}: {connectedDevices} / {deviceLimit}
            </p>
          </div>
        </div>
      )}

      {children}

      {canAddSlots && (
        <Button fullWidth leftIcon={<PlusIcon className="h-4 w-4" />} onClick={onAddSlots}>
          {t('subscription.additionalOptions.buyDevices')}
        </Button>
      )}
    </div>
  );
}
