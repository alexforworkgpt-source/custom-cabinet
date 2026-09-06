import { useState } from 'react';
import { NumberField } from '@/components/admin/referral-levels/fields';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { partnerApi } from '../api/partners';
import { AdminBackButton } from '../components/admin';
import { SettingsIcon } from '@/components/icons';
import { PageSkeleton, Skeleton } from '@/components/ui/skeleton';
import {
  ReferralLevelCard,
  type LevelPatch,
} from '@/components/admin/referral-levels/ReferralLevelCard';

/**
 * Reward levels of the referral chain.
 *
 * Each level decides which bonuses are active (money, subscription days, or both),
 * what triggers them, how much goes to the referrer and how much to the invited
 * user, and which tariff the days land in.
 *
 * The rules live in their own table rather than in Settings: a key present in .env
 * lands in ENV_OVERRIDE_KEYS and stops being editable from any UI, which is exactly
 * how the rest of the referral section usually ends up locked.
 */

export default function AdminReferralLevels() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['referral-levels'],
    queryFn: partnerApi.getReferralLevels,
  });

  // Без onError страница молчала на любой отказ сервера — включая 409 на
  // залоченной в .env схеме и 400 на выходе за границу уровней. Админ видел, что
  // «ничего не произошло», и не знал почему.
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () => {
    setSaveError(null);
    queryClient.invalidateQueries({ queryKey: ['referral-levels'] });
    queryClient.invalidateQueries({ queryKey: ['referral-terms'] });
  };

  const reportError = (error: unknown) => {
    const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
    setSaveError(detail || t('admin.referralLevels.saveError'));
  };

  const saveMutation = useMutation({
    mutationFn: ({ level, patch }: { level: number; patch: LevelPatch }) =>
      partnerApi.upsertReferralLevel(level, patch),
    onSuccess: invalidate,
    onError: reportError,
  });

  const deleteMutation = useMutation({
    mutationFn: (level: number) => partnerApi.deleteReferralLevel(level),
    onSuccess: invalidate,
    onError: reportError,
  });

  const [importNotes, setImportNotes] = useState<string[]>([]);

  const importMutation = useMutation({
    mutationFn: partnerApi.importLegacyReferralSettings,
    onSuccess: (result) => {
      // Что перенос не смог выразить уровнем. Показывается явно: молча потерять
      // ступени комиссии хуже, чем сообщить о них.
      setImportNotes(result.import_notes ?? []);
      invalidate();
    },
    onError: reportError,
  });

  const depthMutation = useMutation({
    mutationFn: partnerApi.updateReferralDepth,
    onSuccess: invalidate,
    onError: reportError,
  });

  const schemeMutation = useMutation({
    mutationFn: (scheme: 'legacy' | 'levels') => partnerApi.updateReferralScheme(scheme),
    onSuccess: invalidate,
    onError: reportError,
  });

  const modeMutation = useMutation({
    mutationFn: partnerApi.updateReferralLevelsMode,
    onSuccess: invalidate,
    onError: reportError,
  });

  if (isLoading) {
    return (
      <PageSkeleton variant="admin" leading={2} titleWidth="w-56" className="space-y-6">
        <Skeleton variant="card" className="h-96" />
      </PageSkeleton>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center gap-3">
          <AdminBackButton to="/admin/partners/settings" />
          <h1 className="text-xl font-semibold text-dark-100">{t('admin.referralLevels.title')}</h1>
        </div>
        <div className="rounded-xl border border-error-500/30 bg-error-500/10 p-6 text-center">
          <p className="text-error-400">{t('admin.referralLevels.loadError')}</p>
        </div>
      </div>
    );
  }

  const isLevels = data.scheme === 'levels';
  // Под рангами номер уровня означает ступень партнёра, а не глубину цепочки:
  // применяется ровно один уровень и платят только прямому пригласившему.
  const isTiers = isLevels && data.levels_mode === 'tiers';
  // Наименьший свободный номер, а не «последний плюс один»: иначе удалённый
  // средний уровень нельзя создать заново ни отсюда, ни из бота.
  const taken = new Set(data.levels.map((lvl) => lvl.level));
  let nextLevel = 1;
  while (taken.has(nextLevel)) nextLevel += 1;
  const hasActiveLevel = data.levels.some((lvl) => lvl.is_active);

  // Ранги читаются как лестница, поэтому показываются в порядке подъёма по ней,
  // а не по номеру: номера админ расставляет руками и не обязан по порядку.
  const orderedLevels = isTiers
    ? [...data.levels].sort(
        (a, b) => a.required_referrals - b.required_referrals || a.level - b.level,
      )
    : data.levels;

  const activeTiers = data.levels.filter((lvl) => lvl.is_active);
  // Без ступени с нулевым порогом партнёр не получает ничего, пока не наберёт
  // минимальный порог. Настройка законная, но чаще это недосмотр, и выглядит он
  // как «переключил режим — выплаты прекратились».
  const missingBaseTier =
    isTiers && activeTiers.length > 0 && activeTiers.every((lvl) => lvl.required_referrals > 0);
  // Одинаковый порог у двух рангов разрешается детерминированно (побеждает
  // больший номер), но админ об этом не догадается — лестница выглядит неоднозначной.
  const duplicateThreshold = isTiers
    ? (activeTiers
        .map((lvl) => lvl.required_referrals)
        .find((value, index, all) => all.indexOf(value) !== index) ?? null)
    : null;
  // Ранг без наград пригласившему не просто ничего не добавляет, как в цепочке,
  // а ЗАМЕНЯЕТ собой платящий: набрав его порог, партнёр теряет доход.
  const paysNothing = isTiers
    ? activeTiers
        .filter(
          (lvl) =>
            !(
              (lvl.reward_mode !== 'days' && (lvl.referrer_percent || lvl.referrer_fixed_kopeks)) ||
              (lvl.reward_mode !== 'money' && lvl.referrer_days)
            ),
        )
        .map((lvl) => lvl.level)
    : [];
  // Повод принадлежит ступени целиком: награда за другой повод партнёру,
  // стоящему не на той ступени, не достанется вовсе.
  const mixedTriggers = isTiers && new Set(activeTiers.map((lvl) => lvl.trigger)).size > 1;

  const save = (level: number, patch: LevelPatch) => saveMutation.mutate({ level, patch });

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <AdminBackButton to="/admin/partners/settings" />
        <div className="rounded-lg bg-accent-500/20 p-2 text-accent-400">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-dark-100">{t('admin.referralLevels.title')}</h1>
          <p className="text-sm text-dark-400">
            {isTiers ? t('admin.referralLevels.tiersSubtitle') : t('admin.referralLevels.subtitle')}
          </p>
        </div>
      </div>

      {/* Scheme switch */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-medium text-dark-100">
              {isLevels
                ? t('admin.referralLevels.schemeLevels')
                : t('admin.referralLevels.schemeLegacy')}
            </div>
            <div className="text-sm text-dark-500">
              {/* Глубину называем только в цепочке. В рангах эта же карточка ниже
                  говорит «глубина не применяется», и строка «до N уровней» рядом
                  с ней противоречит и ей, и тому, как режим на самом деле платит. */}
              {!isLevels
                ? t('admin.referralLevels.schemeLegacyHint')
                : isTiers
                  ? t('admin.referralLevels.tiersSubtitle')
                  : t('admin.referralLevels.depth', { count: data.max_level_depth })}
            </div>
          </div>
          <button
            type="button"
            disabled={data.scheme_locked_by_env || schemeMutation.isPending}
            onClick={() => schemeMutation.mutate(isLevels ? 'legacy' : 'levels')}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLevels
              ? t('admin.referralLevels.switchToLegacy')
              : t('admin.referralLevels.switchToLevels')}
          </button>
        </div>

        {isLevels && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dark-700 pt-4">
            <div>
              <div className="font-medium text-dark-100">
                {isTiers
                  ? t('admin.referralLevels.modeTiers')
                  : t('admin.referralLevels.modeChain')}
              </div>
              <div className="text-sm text-dark-500">
                {isTiers
                  ? t('admin.referralLevels.modeTiersHint')
                  : t('admin.referralLevels.modeChainHint')}
              </div>
            </div>
            <button
              type="button"
              disabled={data.levels_mode_locked_by_env || modeMutation.isPending}
              onClick={() => modeMutation.mutate(isTiers ? 'chain' : 'tiers')}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTiers
                ? t('admin.referralLevels.switchToChain')
                : t('admin.referralLevels.switchToTiers')}
            </button>
          </div>
        )}

        {isLevels && data.levels_mode_locked_by_env && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.modeEnvLocked')}
          </p>
        )}

        {/* Глубина имеет смысл только в цепочке. Поле не исчезает, а прямо
            говорит, что не применяется: пропавшая настройка читается как
            потерянная, и её идут искать в общем списке конфигурации. */}
        <div className="mt-3">
          {isTiers ? (
            <p className="text-sm text-dark-500">{t('admin.referralLevels.depthNotUsed')}</p>
          ) : (
            <>
              <NumberField
                label={t('admin.referralLevels.chainDepth')}
                value={data.max_level_depth}
                max={data.max_supported_level}
                disabled={data.max_level_depth_locked_by_env}
                onCommit={(parsed) => depthMutation.mutate(parsed ?? 1)}
                onInvalid={() =>
                  setSaveError(
                    t('admin.referralLevels.depthRange', { max: data.max_supported_level }),
                  )
                }
              />
              <p className="text-xs text-dark-500">
                {t('admin.referralLevels.chainDepthHint', { max: data.max_supported_level })}
              </p>
              {/* Ключ из .env: правка отбивается 409, а несохранённое значение
                  продолжало висеть в форме и выглядело принятым. */}
              {data.max_level_depth_locked_by_env && (
                <p className="mt-2 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
                  {t('admin.referralLevels.depthEnvLocked')}
                </p>
              )}
            </>
          )}
        </div>

        {data.scheme_locked_by_env && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.envLocked')}
          </p>
        )}

        {isLevels && !hasActiveLevel && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.noActiveLevels')}
          </p>
        )}

        {missingBaseTier && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.noBaseTier')}
          </p>
        )}

        {duplicateThreshold !== null && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.duplicateThresholds', { count: duplicateThreshold })}
          </p>
        )}

        {/* Мультитариф выключен: у подписок нет тарифа, и дни с выбранным
            тарифом не начислятся вовсе. Список тарифов при этом полон, поэтому
            без оговорки настройка выглядит рабочей. Бот предупреждает об этом
            на карточке уровня — кабинет обязан говорить то же самое. */}
        {isLevels &&
          !data.multi_tariff_enabled &&
          data.levels.some(
            (lvl) =>
              lvl.reward_mode !== 'money' && (lvl.referrer_tariff_id || lvl.referee_tariff_id),
          ) && (
            <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
              {t('admin.referralLevels.multiTariffOff')}
            </p>
          )}

        {paysNothing.length > 0 && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.tierPaysNothing', { levels: paysNothing.join(', ') })}
          </p>
        )}

        {mixedTriggers && (
          <p className="mt-3 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
            {t('admin.referralLevels.tierMixedTriggers')}
          </p>
        )}
      </div>

      {data.levels.length === 0 && (
        // Показывается только на пустой таблице: правило создаётся выключенным,
        // и повторный перенос сервер отклоняет.
        <button
          type="button"
          onClick={() => importMutation.mutate()}
          disabled={importMutation.isPending}
          className="btn-secondary mb-4 w-full"
        >
          {t('admin.referralLevels.importLegacy')}
        </button>
      )}

      {importNotes.length > 0 && (
        <ul className="mb-4 space-y-1 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
          {importNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      {saveError && (
        <p className="mb-4 rounded-xl border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-400">
          {saveError}
        </p>
      )}

      {!isLevels && data.levels.length > 0 && (
        <p className="mb-4 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-400">
          {t('admin.referralLevels.schemeOffWarning')}
        </p>
      )}

      {/* Levels */}
      <div className="space-y-4">
        {orderedLevels.map((level) => (
          <ReferralLevelCard
            key={level.level}
            level={level}
            isTiers={isTiers}
            maxLevelDepth={data.max_level_depth}
            availableTariffs={data.available_tariffs}
            save={save}
            onDelete={(level) => deleteMutation.mutate(level)}
            setSaveError={setSaveError}
          />
        ))}
      </div>

      {nextLevel <= data.max_supported_level && (
        <button
          type="button"
          onClick={() =>
            // A new level starts disabled: creating it live would begin paying from a
            // half-filled rule on the very next top-up.
            save(nextLevel, { is_active: false, reward_mode: 'money', trigger: 'every_topup' })
          }
          className="btn-primary mt-6"
          disabled={saveMutation.isPending}
        >
          {isTiers
            ? t('admin.referralLevels.addTier', { count: nextLevel })
            : t('admin.referralLevels.addLevel', { count: nextLevel })}
        </button>
      )}
    </div>
  );
}
