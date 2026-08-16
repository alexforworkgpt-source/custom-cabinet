import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '@/api/subscription';
import { DEVICE_ALIAS_MAX_LENGTH } from '@/constants/devices';
import { useDestructiveConfirm, useHaptic } from '@/platform';
import { Button } from '@/components/primitives/Button';

interface DevicesPanelProps {
  subscriptionId: number;
}

export default function DevicesPanel({ subscriptionId }: DevicesPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useDestructiveConfirm();
  const haptic = useHaptic();
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
      <div className="mx-auto my-10 h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
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
    return <p className="py-8 text-center text-sm text-dark-400">{t('subscription.noDevices')}</p>;
  }

  return (
    <div className="space-y-3">
      {(rename.isError || remove.isError || removeAll.isError) && (
        <p
          className="rounded-xl border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-400"
          role="alert"
        >
          {t('common.error')}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-dark-400">
          {data.device_limit === 0 ? `${data.total} / ∞` : `${data.total} / ${data.device_limit}`}
        </p>
        <Button
          variant="destructive"
          size="sm"
          loading={removeAll.isPending}
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

      <ul className="space-y-2">
        {data.devices.map((device) => {
          const editing = editingHwid === device.hwid;
          const displayName = device.local_name?.trim() || device.device_model || device.platform;
          return (
            <li
              key={device.hwid}
              className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-3"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <input
                      autoFocus
                      className="input w-full"
                      value={name}
                      maxLength={DEVICE_ALIAS_MAX_LENGTH}
                      aria-label={t('subscription.renameDevice')}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          const value = name.trim();
                          rename.mutate({ hwid: device.hwid, value: value || null });
                        }
                        if (event.key === 'Escape') setEditingHwid(null);
                      }}
                    />
                  ) : (
                    <p className="truncate font-medium text-dark-100">{displayName}</p>
                  )}
                  <p className="truncate text-xs text-dark-400">
                    {device.platform} · {device.hwid.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="ms-auto flex w-full flex-wrap justify-end gap-1 sm:w-auto">
                  {editing ? (
                    <>
                      <Button
                        size="sm"
                        loading={rename.isPending}
                        onClick={() => {
                          const value = name.trim();
                          rename.mutate({ hwid: device.hwid, value: value || null });
                        }}
                      >
                        {t('subscription.renameDeviceSave')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingHwid(null)}>
                        {t('common.cancel')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={rename.isPending}
                        onClick={() => {
                          setEditingHwid(device.hwid);
                          setName(device.local_name || '');
                        }}
                      >
                        {t('subscription.renameDevice')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={rename.isPending}
                        loading={remove.isPending}
                        onClick={async () => {
                          const accepted = await confirm(
                            t('subscription.confirmDeleteDevice'),
                            t('subscription.deleteDevice'),
                            t('subscription.deleteDevice'),
                          );
                          if (accepted) remove.mutate(device.hwid);
                        }}
                      >
                        {t('subscription.deleteDevice')}
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
