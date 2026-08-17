import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { balanceApi } from '../api/balance';
import { Card } from '@/components/data-display/Card';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import PaymentMethodIcon from '@/components/PaymentMethodIcon';

export default function TopUpMethodSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: balanceApi.getPaymentMethods,
  });

  const handleMethodClick = (methodId: string) => {
    const params = new URLSearchParams();
    const amount = searchParams.get('amount');
    const returnTo = searchParams.get('returnTo');
    if (amount) params.set('amount', amount);
    if (returnTo) params.set('returnTo', returnTo);
    const qs = params.toString();
    navigate(`/balance/top-up/${methodId}${qs ? `?${qs}` : ''}`);
  };

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-xl font-bold text-dark-50 sm:text-2xl">
          {t('balance.selectPaymentMethod')}
        </h1>
      </motion.div>

      <motion.div variants={staggerItem}>
        {isLoading ? (
          <Card size="sm">
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            </div>
          </Card>
        ) : !paymentMethods || paymentMethods.length === 0 ? (
          <Card size="sm">
            <div className="py-6 text-center text-sm text-dark-400">
              {t('balance.noPaymentMethods')}
            </div>
          </Card>
        ) : (
          <div
            data-payment-method-list
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {paymentMethods.map((method) => {
              const methodKey = method.id.toLowerCase().replace(/-/g, '_');
              const translatedName = t(`balance.paymentMethods.${methodKey}.name`, {
                defaultValue: '',
              });
              const translatedDesc = t(`balance.paymentMethods.${methodKey}.description`, {
                defaultValue: '',
              });
              const description = method.description || translatedDesc;

              return (
                <Card key={method.id} asChild size="sm" interactive={method.is_available}>
                  <button
                    type="button"
                    disabled={!method.is_available}
                    data-payment-method-card
                    className="flex min-h-16 w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleMethodClick(method.id)}
                  >
                    <PaymentMethodIcon method={methodKey} className="h-7 w-7 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-dark-100">
                        {method.name || translatedName}
                      </span>
                      {description && (
                        <span className="mt-0.5 block truncate text-xs text-dark-500">
                          {description}
                        </span>
                      )}
                    </span>
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
