import { useTranslation } from 'react-i18next';
import { Card } from '@/components/data-display/Card';
import type { ReferralDaysTargetOption, ReferralTerms } from '@/types';
import { BanknotesIcon, CalendarIcon } from '@/components/icons';

export function RewardSettings({
  terms,
  onChange,
  pending = false,
}: {
  terms: ReferralTerms;
  onChange: (payload: {
    reward_preference?: string | null;
    days_target_subscription_id?: number | null;
    set_reward_preference?: boolean;
    set_days_target?: boolean;
  }) => void;
  pending?: boolean;
}) {
  const { t } = useTranslation();
  const kindChoice = terms.allow_reward_kind_choice === true;
  const targetChoice = terms.allow_days_target_choice === true;
  if (!kindChoice && !targetChoice) return null;

  const options = terms.days_target_options ?? [];
  // Выбор двоичный: деньги ИЛИ дни. Не выбиравший получает деньги — так же, как
  // их выдаст расчёт, поэтому и отмечены они, а не «ничего не выбрано».
  const kinds = [
    {
      value: 'money',
      label: t('referral.rewardSettings.kindMoney'),
      // Сумма важнее общей фразы: без неё выбор делается вслепую — непонятно,
      // от чего отказываешься. Общая фраза остаётся, когда суммы нет.
      hint: terms.reward_choice_money || t('referral.rewardSettings.kindMoneyHint'),
      amount: Boolean(terms.reward_choice_money),
      icon: <BanknotesIcon className="h-5 w-5" />,
    },
    {
      value: 'days',
      label: t('referral.rewardSettings.kindDays'),
      hint: terms.reward_choice_days || t('referral.rewardSettings.kindDaysHint'),
      amount: Boolean(terms.reward_choice_days),
      icon: <CalendarIcon className="h-5 w-5" />,
    },
  ];
  const currentKind = terms.reward_preference === 'days' ? 'days' : 'money';

  const optionLabel = (option: ReferralDaysTargetOption) => {
    const name = option.tariff_name || t('referral.rewardSettings.subscription');
    if (!option.end_date) return name;
    const until = t('referral.rewardSettings.until', {
      date: new Date(option.end_date).toLocaleDateString(),
    });
    return `${name} — ${until}`;
  };

  const choice = (key: string, selected: boolean, label: string, onSelect: () => void) => (
    <button
      key={key}
      type="button"
      disabled={pending}
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors disabled:opacity-60 ${
        selected
          ? 'border-accent-500/40 bg-accent-500/10 text-dark-100'
          : 'border-dark-700/40 bg-dark-800/30 text-dark-200 hover:border-dark-600'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-accent-400' : 'border-dark-600'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-accent-400" />}
      </span>
      <span>{label}</span>
    </button>
  );

  return (
    <Card size="lg">
      <h2 className="text-lg font-semibold text-dark-100">{t('referral.rewardSettings.title')}</h2>
      <p className="mt-1 text-sm text-dark-400">{t('referral.rewardSettings.intro')}</p>

      {kindChoice && (
        <section className="mt-4">
          <h3 className="text-sm font-medium text-dark-200">
            {t('referral.rewardSettings.kindHeader')}
          </h3>
          <p className="mt-1 text-xs text-dark-500">{t('referral.rewardSettings.kindHint')}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {kinds.map((kind) => {
              const selected = currentKind === kind.value;
              return (
                <button
                  key={kind.value}
                  type="button"
                  disabled={pending}
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({ reward_preference: kind.value, set_reward_preference: true })
                  }
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${
                    selected
                      ? 'border-accent-500/50 bg-accent-500/10'
                      : 'border-dark-700/40 bg-dark-800/30 hover:border-dark-600'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selected ? 'bg-accent-500/20 text-accent-300' : 'bg-dark-700/60 text-dark-400'
                    }`}
                  >
                    {kind.icon}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-medium ${selected ? 'text-dark-100' : 'text-dark-200'}`}
                    >
                      {kind.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        kind.amount
                          ? selected
                            ? 'font-medium text-accent-300'
                            : 'font-medium text-dark-300'
                          : 'text-dark-500'
                      }`}
                    >
                      {kind.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Куда класть дни спрашиваем, только когда человек выбрал дни: выбравшему
          деньги эта настройка ни на что не влияет, и раздел обещал бы влияние,
          которого нет. Если выбор вида админ не разрешил, спрашиваем всегда —
          дни тогда приходят по правилу, и цель у них есть. */}
      {targetChoice && (!kindChoice || currentKind === 'days') && (
        <section className="mt-5">
          <h3 className="text-sm font-medium text-dark-200">
            {t('referral.rewardSettings.targetHeader')}
          </h3>
          <p className="mt-1 text-xs text-dark-500">{t('referral.rewardSettings.targetHint')}</p>
          {options.length === 0 ? (
            <p className="mt-2 text-sm text-dark-400">{t('referral.rewardSettings.targetNone')}</p>
          ) : (
            <div className="mt-2 space-y-2">
              {/* Автоподбор — тоже вариант, и он обязан быть виден как выбранный:
                  иначе непонятно, что происходит сейчас. */}
              {choice(
                'auto',
                (terms.days_target_subscription_id ?? null) === null,
                t('referral.rewardSettings.targetAuto'),
                () => onChange({ days_target_subscription_id: null, set_days_target: true }),
              )}
              {options.map((option) =>
                choice(
                  String(option.id),
                  terms.days_target_subscription_id === option.id,
                  optionLabel(option),
                  () => onChange({ days_target_subscription_id: option.id, set_days_target: true }),
                ),
              )}
            </div>
          )}
        </section>
      )}
    </Card>
  );
}
