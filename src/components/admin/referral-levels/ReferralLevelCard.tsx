import { useTranslation } from 'react-i18next';
import type { ReferralRewardLevel } from '@/types';
import { NumberField, TariffSelect, withAssigned } from './fields';

export type LevelPatch = Partial<
  Omit<ReferralRewardLevel, 'level' | 'referrer_tariff_name' | 'referee_tariff_name'>
>;
const REWARD_MODES: ReferralRewardLevel['reward_mode'][] = ['money', 'days', 'both'];
const TRIGGERS: ReferralRewardLevel['trigger'][] = ['registration', 'first_topup', 'every_topup'];
const cycle = <T,>(values: T[], current: T): T =>
  values[(Math.max(0, values.indexOf(current)) + 1) % values.length];

export function ReferralLevelCard({
  level,
  isTiers,
  maxLevelDepth,
  availableTariffs,
  save,
  onDelete,
  setSaveError,
}: {
  level: ReferralRewardLevel;
  isTiers: boolean;
  maxLevelDepth: number;
  availableTariffs: { id: number; name: string }[];
  save: (level: number, patch: LevelPatch) => void;
  onDelete: (level: number) => void;
  setSaveError: (message: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-dark-100">
            {isTiers
              ? t('admin.referralLevels.tierTitle', { count: level.level })
              : t('admin.referralLevels.levelTitle', { count: level.level })}
          </h3>
          {/* Глубина ограничивает только цепочку: под рангами работают все
                    заведённые уровни, и метка «не платит» была бы ложной. */}
          {!isTiers && level.level > maxLevelDepth && (
            <p className="text-xs text-warning-400">
              {t('admin.referralLevels.beyondDepth', { count: maxLevelDepth })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save(level.level, { is_active: !level.is_active })}
            className={level.is_active ? 'btn-secondary' : 'btn-primary'}
          >
            {level.is_active ? t('admin.referralLevels.disable') : t('admin.referralLevels.enable')}
          </button>
          <button
            type="button"
            onClick={() => onDelete(level.level)}
            className="btn-secondary text-error-400"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => save(level.level, { reward_mode: cycle(REWARD_MODES, level.reward_mode) })}
          className="rounded-xl border border-dark-700/30 bg-dark-800/30 p-3 text-left"
        >
          <div className="text-xs text-dark-500">{t('admin.referralLevels.activeBonuses')}</div>
          <div className="font-medium text-dark-100">
            {t(`admin.referralLevels.modes.${level.reward_mode}`)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => save(level.level, { trigger: cycle(TRIGGERS, level.trigger) })}
          className="rounded-xl border border-dark-700/30 bg-dark-800/30 p-3 text-left"
        >
          <div className="text-xs text-dark-500">{t('admin.referralLevels.trigger')}</div>
          <div className="font-medium text-dark-100">
            {t(`admin.referralLevels.triggers.${level.trigger}`)}
          </div>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-medium text-dark-300">
            {t('admin.referralLevels.toReferrer')}
          </div>
          <NumberField
            label={t('admin.referralLevels.percent')}
            value={level.referrer_percent ?? ''}
            disabled={level.reward_mode === 'days'}
            max={100}
            onCommit={(parsed) => save(level.level, { referrer_percent: parsed })}
            onInvalid={(name) =>
              setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
            }
          />
          <NumberField
            label={t('admin.referralLevels.fixedAmount')}
            value={level.referrer_fixed_kopeks ? level.referrer_fixed_kopeks / 100 : ''}
            disabled={level.reward_mode === 'days'}
            scale={100}
            onCommit={(parsed) => save(level.level, { referrer_fixed_kopeks: parsed })}
            onInvalid={(name) =>
              setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
            }
          />
          <NumberField
            label={t('admin.referralLevels.days')}
            value={level.referrer_days || ''}
            disabled={level.reward_mode === 'money'}
            max={3650}
            onCommit={(parsed) => save(level.level, { referrer_days: parsed ?? 0 })}
            onInvalid={(name) =>
              setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
            }
          />
          {level.reward_mode !== 'money' &&
            level.referrer_days > 0 &&
            !level.referrer_tariff_id && (
              <p className="mt-1 text-xs text-dark-500">{t('admin.referralLevels.noTariffHint')}</p>
            )}
          <TariffSelect
            label={t('admin.referralLevels.tariff')}
            value={level.referrer_tariff_id}
            options={withAssigned(
              availableTariffs,
              level.referrer_tariff_id,
              level.referrer_tariff_name,
            )}
            disabled={level.reward_mode === 'money'}
            noneLabel={t('admin.referralLevels.mainSubscription')}
            onChange={(tariffId) => save(level.level, { referrer_tariff_id: tariffId })}
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-dark-300">
            {t('admin.referralLevels.toReferee')}
          </div>
          <NumberField
            label={t('admin.referralLevels.fixedAmount')}
            value={level.referee_fixed_kopeks ? level.referee_fixed_kopeks / 100 : ''}
            disabled={level.reward_mode === 'days'}
            scale={100}
            onCommit={(parsed) => save(level.level, { referee_fixed_kopeks: parsed })}
            onInvalid={(name) =>
              setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
            }
          />
          <NumberField
            label={t('admin.referralLevels.days')}
            value={level.referee_days || ''}
            disabled={level.reward_mode === 'money'}
            max={3650}
            onCommit={(parsed) => save(level.level, { referee_days: parsed ?? 0 })}
            onInvalid={(name) =>
              setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
            }
          />
          <TariffSelect
            label={t('admin.referralLevels.tariff')}
            value={level.referee_tariff_id}
            options={withAssigned(
              availableTariffs,
              level.referee_tariff_id,
              level.referee_tariff_name,
            )}
            disabled={level.reward_mode === 'money'}
            noneLabel={t('admin.referralLevels.mainSubscription')}
            onChange={(tariffId) => save(level.level, { referee_tariff_id: tariffId })}
          />
          {level.trigger === 'registration' &&
            level.reward_mode !== 'money' &&
            level.referee_days > 0 &&
            !level.referee_tariff_id && (
              <p className="mt-2 rounded-lg border border-warning-500/30 bg-warning-500/10 p-2 text-xs text-warning-400">
                {t('admin.referralLevels.registrationNeedsTariff')}
              </p>
            )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <NumberField
            label={
              isTiers
                ? t('admin.referralLevels.tierThreshold')
                : t('admin.referralLevels.requiredReferrals')
            }
            value={level.required_referrals || ''}
            onCommit={(parsed) => save(level.level, { required_referrals: parsed ?? 0 })}
            onInvalid={(name) =>
              setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
            }
          />
          <button
            type="button"
            onClick={() =>
              save(level.level, {
                required_referrals_active_only: !level.required_referrals_active_only,
              })
            }
            className="text-xs text-accent-400 underline"
          >
            {level.required_referrals_active_only
              ? t('admin.referralLevels.countingActive')
              : t('admin.referralLevels.countingAll')}
          </button>
        </div>

        <NumberField
          label={t('admin.referralLevels.maxPayments')}
          value={level.max_payments || ''}
          disabled={false}
          onCommit={(parsed) => save(level.level, { max_payments: parsed ?? 0 })}
          onInvalid={(name) =>
            setSaveError(t('admin.referralLevels.invalidValue', { field: name }))
          }
        />
      </div>
    </div>
  );
}
