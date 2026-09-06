import { useTranslation } from 'react-i18next';
import { Card } from '@/components/data-display/Card';
import type { ReferralTerms } from '@/types';
import { tierProgressText } from './tierProgressText';

export function ProgrammeTerms({ terms }: { terms: ReferralTerms }) {
  const { t } = useTranslation();
  const isTiers = terms.levels_mode === 'tiers';
  const levels = terms.levels ?? [];
  // Строки-описания остаются запасным путём: они приходят из того же источника
  // и покрывают старый сервер, который ещё не отдаёт разбор по частям.
  const fallbackLines = terms.level_descriptions ?? [];
  const progress = tierProgressText(terms, t);

  return (
    <Card size="lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-dark-100">{t('referral.terms.title')}</h2>
        {/* Правило режима — одной фразой над лестницей. Без неё список
              уровней в режиме «за приглашённых» читается как складывающиеся
              награды, а в цепочке — наоборот, как выбор одной из них. */}
        <p className="mt-1 text-sm text-dark-400">
          {isTiers ? t('referral.terms.modeTiers') : t('referral.terms.modeChain')}
        </p>
      </div>

      {levels.length > 0 ? (
        <ol className="space-y-2">
          {levels.map((lvl) => (
            <li
              key={lvl.level}
              className={`rounded-xl border p-3 transition-colors ${
                lvl.is_current
                  ? 'border-accent-500/40 bg-accent-500/10'
                  : 'border-dark-700/40 bg-dark-800/30'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
                    lvl.is_current ? 'bg-accent-500 text-dark-900' : 'bg-dark-700 text-dark-200'
                  }`}
                >
                  {lvl.level}
                </span>
                <span className="text-sm font-medium text-dark-100">
                  {t('referral.terms.levelLabel', { level: lvl.level })}
                </span>
                {lvl.is_current && (
                  <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-xs text-accent-300">
                    {t('referral.terms.currentBadge')}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {lvl.pays_referrer ? (
                  lvl.rewards.map((reward) => (
                    <span
                      key={reward}
                      className="rounded-lg bg-success-500/15 px-2 py-1 text-sm text-success-300"
                    >
                      {reward}
                    </span>
                  ))
                ) : (
                  <span className="rounded-lg bg-dark-700/60 px-2 py-1 text-sm text-dark-400">
                    {t('referral.terms.paysNothing')}
                  </span>
                )}
                {lvl.pays_referrer && lvl.trigger_label && (
                  <span className="text-xs text-dark-400">{lvl.trigger_label}</span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-dark-400">
                {/* Условие показывается только там, где оно есть смысл: в
                      цепочке уровень открывается порогом, а в режиме за
                      приглашённых порог и определяет, какой уровень ваш. */}
                <span>
                  {lvl.required_referrals > 0
                    ? lvl.required_referrals_active_only
                      ? t('referral.terms.fromActive', { count: lvl.required_referrals })
                      : t('referral.terms.fromAny', { count: lvl.required_referrals })
                    : t('referral.terms.startingLevel')}
                </span>
                {lvl.referee_reward && (
                  <span>{t('referral.terms.refereeGets', { reward: lvl.referee_reward })}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : fallbackLines.length > 0 ? (
        <ul className="space-y-2">
          {fallbackLines.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm text-dark-200">
              <span aria-hidden="true" className="mt-1 text-accent-400">
                •
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-dark-400">{t('referral.terms.noLevels')}</p>
      )}

      {terms.personal_percent != null && (
        <p className="mt-4 rounded-xl border border-warning-500/25 bg-warning-500/10 p-3 text-sm text-warning-300">
          {t('referral.terms.personalRate', { percent: terms.personal_percent })}
        </p>
      )}

      {progress && <p className="mt-4 text-sm text-dark-300">{progress}</p>}
    </Card>
  );
}
