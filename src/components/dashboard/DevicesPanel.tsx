import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '@/api/subscription';
import { DEVICE_ALIAS_MAX_LENGTH } from '@/constants/devices';
import { useDestructiveConfirm, useHaptic } from '@/platform';
import { Button } from '@/components/primitives/Button';
import { CheckIcon, DevicesIcon, PencilIcon, TrashIcon, XIcon } from '@/components/icons';
import { useTheme } from '@/hooks/useTheme';
import { getGlassColors } from '@/utils/glassTheme';

interface DevicesPanelProps {
  subscriptionId: number;
}

export default function DevicesPanel({ subscriptionId }: DevicesPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useDestructiveConfirm();
  const haptic = useHaptic();
  const { isDark } = useTheme();
  const glass = getGlassColors(isDark);
  const [editingHwid, setEditingHwid] = useState<string | null>(null);
  const [name, setName] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['devices', subscriptionId],
    queryFn: () => subscriptionApi.getDevices(subscriptionId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
  const rename = useMutation({
    mutationFn: ({ hwid, value }: { hwid: string; value: string | null }) =>
      subscriptionApi.renameDevice(hwid, value, subscriptionId),
    onSuccess: (_, variables) => {
      invalidate();
      if (editingHwid === variables.hwid) setEditingHwid(null);
      haptic.notification('success');
    },
    onError: () => haptic.notification('error'),
  });
  const remove = useMutation({
    mutationFn: (hwid: string) => subscriptionApi.deleteDevice(hwid, subscriptionId),
    onSuccess: invalidate,
    onError: () => haptic.notification('error'),
  });
  const removeAll = useMutation({
    mutationFn: () => subscriptionApi.deleteAllDevices(subscriptionId),
    onSuccess: invalidate,
    onError: () => haptic.notification('error'),
  });

  if (isLoading) {
    return (
      <div className="space-y-2" role="status" aria-label={t('common.loading')}>
        <div className="skeleton mb-3 h-4 w-24 rounded" />
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex min-h-[72px] items-center gap-3 rounded-2xl p-3">
            <div className="skeleton h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-4 w-40 max-w-full rounded" />
              <div className="skeleton h-3 w-28 max-w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 py-8 text-center" role="alert">
        <p className="text-sm text-error-400">{t('common.error')}</p>
        <Button variant="secondary" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (!data?.devices.length) {
    return (
      <div
        className="flex flex-col items-center rounded-2xl px-5 py-10 text-center"
        style={{ background: glass.innerBg, border: `1px solid ${glass.innerBorder}` }}
      >
        <span
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-dark-400"
          style={{ background: glass.trackBg }}
          aria-hidden="true"
        >
          <DevicesIcon className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-dark-300">{t('subscription.noDevices')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(rename.isError || remove.isError || removeAll.isError) && (
        <p
          className="rounded-xl border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-400"
          role="alert"
        >
          {t('common.error')}
        </p>
      )}
      <div className="flex items-center justify-between gap-3 px-0.5">
        <p className="font-mono text-[11px] text-dark-500">
          {data.device_limit === 0 ? `${data.total} / ∞` : `${data.total} / ${data.device_limit}`}{' '}
          {t('subscription.devices', { count: data.device_limit || data.total })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          loading={removeAll.isPending}
          className="min-h-11 px-2 text-xs text-error-400 hover:bg-error-500/10 hover:text-error-300"
          onClick={async () => {
            const accepted = await confirm(
              t('subscription.confirmDeleteAllDevices'),
              t('subscription.deleteAllDevices'),
              t('subscription.deleteAllDevices'),
            );
            if (accepted) removeAll.mutate();
          }}
        >
          {t('subscription.deleteAllDevices')}
        </Button>
      </div>

      <ul className="space-y-2.5">
        {data.devices.map((device) => {
          const editing = editingHwid === device.hwid;
          const displayName = device.local_name?.trim() || device.device_model || device.platform;
          const isRemoving = remove.isPending && remove.variables === device.hwid;
          const isRenaming = rename.isPending && rename.variables?.hwid === device.hwid;
          return (
            <li
              key={device.hwid}
              className="min-h-[72px] rounded-2xl p-3 transition-colors sm:p-3.5"
              style={{ background: glass.innerBg, border: `1px solid ${glass.innerBorder}` }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-dark-400"
                  style={{ background: glass.trackBg }}
                  aria-hidden="true"
                >
                  <DevicesIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <input
                      autoFocus
                      className="input min-h-11 w-full py-2 text-sm font-semibold"
                      value={name}
                      maxLength={DEVICE_ALIAS_MAX_LENGTH}
                      placeholder={device.device_model || device.platform}
                      aria-label={t('subscription.renameDevice')}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          const value = name.trim();
                          rename.mutate({ hwid: device.hwid, value: value || null });
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault();
                          setEditingHwid(null);
                          setName('');
                        }
                      }}
                    />
                  ) : (
                    <p className="truncate text-sm font-semibold text-dark-50 sm:text-base">
                      {displayName}
                    </p>
                  )}
                  <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-dark-400">
                    <span className="truncate">{device.platform}</span>
                    <span className="shrink-0 font-mono text-dark-500">
                      {device.hwid.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="ms-auto flex shrink-0 items-center gap-0.5">
                  {editing ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        loading={isRenaming}
                        className="h-11 w-11 p-0 text-dark-300"
                        aria-label={t('subscription.renameDeviceSave')}
                        title={t('subscription.renameDeviceSave')}
                        onClick={() => {
                          const value = name.trim();
                          rename.mutate({ hwid: device.hwid, value: value || null });
                        }}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isRenaming}
                        className="h-11 w-11 p-0 text-dark-500"
                        aria-label={t('subscription.renameDeviceCancel')}
                        title={t('subscription.renameDeviceCancel')}
                        onClick={() => {
                          setEditingHwid(null);
                          setName('');
                        }}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={rename.isPending || remove.isPending}
                        className="h-11 w-11 p-0 text-dark-500 hover:text-dark-200"
                        aria-label={t('subscription.renameDevice')}
                        title={t('subscription.renameDevice')}
                        onClick={() => {
                          setEditingHwid(device.hwid);
                          setName(device.local_name || '');
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={rename.isPending || (remove.isPending && !isRemoving)}
                        loading={isRemoving}
                        className="h-11 w-11 p-0 text-dark-500 hover:bg-error-500/10 hover:text-error-400"
                        aria-label={t('subscription.deleteDevice')}
                        title={t('subscription.deleteDevice')}
                        onClick={async () => {
                          const accepted = await confirm(
                            t('subscription.confirmDeleteDevice'),
                            t('subscription.deleteDevice'),
                            t('subscription.deleteDevice'),
                          );
                          if (accepted) remove.mutate(device.hwid);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
