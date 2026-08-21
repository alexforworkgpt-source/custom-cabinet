import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  notificationsApi,
  type NotificationSettings,
  type NotificationSettingsUpdate,
} from '@/api/notifications';
import { Card } from '@/components/data-display/Card';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';

export default function ProfileNotifications() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    data: settings,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: notificationsApi.getSettings,
  });
  const updateMutation = useMutation({
    mutationFn: notificationsApi.updateSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-settings'] }),
  });

  const updateToggle = (key: keyof NotificationSettings, value: boolean) => {
    const update: NotificationSettingsUpdate = { [key]: value };
    updateMutation.mutate(update);
  };

  const updateValue = (key: keyof NotificationSettings, value: number) => {
    const update: NotificationSettingsUpdate = { [key]: value };
    updateMutation.mutate(update);
  };

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">
          {t('profile.notifications.title')}
        </h1>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card size="md">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-between gap-3 py-2">
              <p role="alert" className="text-sm text-error-400">
                {t('common.error')}
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={() => refetch()}>
                {t('common.retry')}
              </Button>
            </div>
          ) : settings ? (
            <div
              role="group"
              aria-label={t('profile.notifications.title')}
              className="divide-y divide-dark-700"
            >
              <div className="space-y-1 py-2">
                <div className="flex min-h-12 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-100">
                      {t('profile.notifications.subscriptionExpiry')}
                    </p>
                    <p className="text-xs text-dark-400">
                      {t('profile.notifications.subscriptionExpiryDesc')}
                    </p>
                  </div>
                  <Switch
                    aria-label={t('profile.notifications.subscriptionExpiry')}
                    disabled={updateMutation.isPending}
                    checked={settings.subscription_expiry_enabled}
                    onCheckedChange={(checked) =>
                      updateToggle('subscription_expiry_enabled', checked)
                    }
                  />
                </div>
                {settings.subscription_expiry_enabled && (
                  <div className="flex min-h-10 items-center gap-3 ps-4">
                    <span className="text-sm text-dark-400">
                      {t('profile.notifications.daysBeforeExpiry')}
                    </span>
                    <select
                      aria-label={t('profile.notifications.daysBeforeExpiry')}
                      value={settings.subscription_expiry_days}
                      onChange={(event) =>
                        updateValue('subscription_expiry_days', Number(event.target.value))
                      }
                      className="input w-20 py-1"
                    >
                      {[1, 2, 3, 5, 7, 14].map((days) => (
                        <option key={days} value={days}>
                          {days}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1 py-2">
                <div className="flex min-h-12 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-100">
                      {t('profile.notifications.trafficWarning')}
                    </p>
                    <p className="text-xs text-dark-400">
                      {t('profile.notifications.trafficWarningDesc')}
                    </p>
                  </div>
                  <Switch
                    aria-label={t('profile.notifications.trafficWarning')}
                    disabled={updateMutation.isPending}
                    checked={settings.traffic_warning_enabled}
                    onCheckedChange={(checked) => updateToggle('traffic_warning_enabled', checked)}
                  />
                </div>
                {settings.traffic_warning_enabled && (
                  <div className="flex min-h-10 items-center gap-3 ps-4">
                    <span className="text-sm text-dark-400">
                      {t('profile.notifications.atPercent')}
                    </span>
                    <select
                      aria-label={t('profile.notifications.atPercent')}
                      value={settings.traffic_warning_percent}
                      onChange={(event) =>
                        updateValue('traffic_warning_percent', Number(event.target.value))
                      }
                      className="input w-20 py-1"
                    >
                      {[50, 70, 80, 90, 95].map((percent) => (
                        <option key={percent} value={percent}>
                          {percent}%
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1 py-2">
                <div className="flex min-h-12 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-100">
                      {t('profile.notifications.balanceLow')}
                    </p>
                    <p className="text-xs text-dark-400">
                      {t('profile.notifications.balanceLowDesc')}
                    </p>
                  </div>
                  <Switch
                    aria-label={t('profile.notifications.balanceLow')}
                    disabled={updateMutation.isPending}
                    checked={settings.balance_low_enabled}
                    onCheckedChange={(checked) => updateToggle('balance_low_enabled', checked)}
                  />
                </div>
                {settings.balance_low_enabled && (
                  <div className="flex min-h-10 items-center gap-3 ps-4">
                    <span className="text-sm text-dark-400">
                      {t('profile.notifications.threshold')}
                    </span>
                    <input
                      aria-label={t('profile.notifications.threshold')}
                      type="number"
                      value={settings.balance_low_threshold}
                      onChange={(event) =>
                        updateValue('balance_low_threshold', Number(event.target.value))
                      }
                      min={0}
                      className="input w-24 py-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex min-h-14 items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dark-100">
                    {t('profile.notifications.news')}
                  </p>
                  <p className="text-xs text-dark-400">{t('profile.notifications.newsDesc')}</p>
                </div>
                <Switch
                  aria-label={t('profile.notifications.news')}
                  disabled={updateMutation.isPending}
                  checked={settings.news_enabled}
                  onCheckedChange={(checked) => updateToggle('news_enabled', checked)}
                />
              </div>

              <div className="flex min-h-14 items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dark-100">
                    {t('profile.notifications.promoOffers')}
                  </p>
                  <p className="text-xs text-dark-400">
                    {t('profile.notifications.promoOffersDesc')}
                  </p>
                </div>
                <Switch
                  aria-label={t('profile.notifications.promoOffers')}
                  disabled={updateMutation.isPending}
                  checked={settings.promo_offers_enabled}
                  onCheckedChange={(checked) => updateToggle('promo_offers_enabled', checked)}
                />
              </div>
            </div>
          ) : (
            <p className="text-dark-400">{t('profile.notifications.unavailable')}</p>
          )}
          {updateMutation.isError && updateMutation.variables && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-dark-700 pt-3">
              <p role="alert" className="text-sm text-error-400">
                {t('common.error')}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => updateMutation.mutate(updateMutation.variables)}
              >
                {t('common.retry')}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
