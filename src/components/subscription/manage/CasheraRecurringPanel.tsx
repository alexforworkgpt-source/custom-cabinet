import { useTranslation } from 'react-i18next';
import { Card } from '../../data-display/Card';
import { Button } from '../../primitives/Button';
import { useCasheraRecurring } from '../../../hooks/useCasheraRecurring';
import { usePlatform } from '../../../platform';
import { useDestructiveConfirm } from '../../../platform/hooks/useNativeDialog';
import {
  casheraIntervalLabelKey,
  casheraUiState,
  isCasheraFeatureDisabledError,
} from '../../../utils/casheraRecurring';
import { getApiErrorMessage } from '../../../utils/api-error';
import { openPaymentUrl } from '../../../utils/openPaymentUrl';
import { formatDateOrRaw } from '../../../utils/format';
import { uiLocale } from '../../../utils/uiLocale';

interface Props {
  enabled: boolean;
  subscriptionId?: number;
}

export function CasheraRecurringPanel({ enabled, subscriptionId }: Props) {
  const { t } = useTranslation();
  const { platform, openLink } = usePlatform();
  const confirm = useDestructiveConfirm();
  const { query, busy, enable, cancel } = useCasheraRecurring(subscriptionId, enabled);
  const info = query.data;
  const state = casheraUiState(info, !enabled || isCasheraFeatureDisabledError(query.error));
  if (state === 'hidden') return null;

  const cancelRecurring = async () => {
    if (
      await confirm(
        t('subscription.casheraRecurring.confirmCancel'),
        t('subscription.casheraRecurring.cancel'),
      )
    )
      cancel();
  };
  return (
    <Card className="mt-3 space-y-3">
      <h3 className="text-sm font-semibold text-dark-50">
        {t('subscription.casheraRecurring.title')}
      </h3>
      {query.isPending ? (
        <p role="status">{t('common.loading')}</p>
      ) : query.isError ? (
        <div role="alert" className="space-y-2">
          <p className="text-error-400">
            {getApiErrorMessage(query.error, t('subscription.casheraRecurring.enableError'))}
          </p>
          <Button variant="secondary" onClick={() => void query.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <>
          {state === 'off' && (
            <p className="text-sm text-dark-400">
              {t('subscription.casheraRecurring.autopayHint')}
            </p>
          )}
          {state === 'pending' && (
            <p className="text-sm text-dark-400">
              {t('subscription.casheraRecurring.statusPending')}
            </p>
          )}
          {state === 'past_due' && (
            <p role="status" className="text-sm text-warning-400">
              {t('subscription.casheraRecurring.statusPastDue')}
            </p>
          )}
          {state === 'active' && info && (
            <div className="space-y-1 text-sm text-dark-400">
              <p>
                {t('subscription.casheraRecurring.amountPerInterval', {
                  amount:
                    typeof info.amount_kopeks === 'number' && Number.isFinite(info.amount_kopeks)
                      ? (info.amount_kopeks / 100).toLocaleString(uiLocale(), {
                          maximumFractionDigits: 2,
                        })
                      : '—',
                  interval: t(casheraIntervalLabelKey(info.interval)),
                })}
              </p>
              {info.next_charge_at && (
                <p>
                  {t('subscription.casheraRecurring.nextCharge', {
                    date: formatDateOrRaw(info.next_charge_at, uiLocale(), {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }),
                  })}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {state === 'off' && (
              <Button size="lg" loading={busy} onClick={enable}>
                {t('subscription.casheraRecurring.connect')}
              </Button>
            )}
            {state === 'pending' && info?.redirect_url && (
              <Button
                size="lg"
                disabled={busy}
                onClick={() => {
                  if (info.redirect_url) openPaymentUrl(info.redirect_url, platform, openLink);
                }}
              >
                {t('subscription.casheraRecurring.confirm')}
              </Button>
            )}
            {state !== 'off' && (
              <Button
                size="lg"
                variant="destructive"
                loading={busy}
                onClick={() => void cancelRecurring()}
              >
                {t('subscription.casheraRecurring.cancel')}
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
