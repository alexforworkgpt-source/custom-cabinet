import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import {
  adminRemindersApi,
  type AuthCondition,
  type ReminderButtonKind,
  type ReminderChannels,
  type ReminderPayload,
  type ReminderText,
  type SubscriptionSegment,
} from '@/api/adminReminders';
import { PermissionGate } from '@/components/auth/PermissionGate';
import {
  CABINET_REMINDER_TARGETS,
  firstReminderValidationMessage,
  parseReminderInteger,
  REMINDER_INPUT_CLASS,
  REMINDER_LANGS,
  type ReminderFormError,
} from '@/components/admin/reminders/form';

export default function AdminReminderEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const editId = id ? Number(id) : null;

  const [name, setName] = useState('');
  const [channels, setChannels] = useState<ReminderChannels>('both');
  const [category, setCategory] = useState<'service' | 'marketing'>('service');
  const [auth, setAuth] = useState<AuthCondition | ''>('');
  const [segment, setSegment] = useState<SubscriptionSegment | ''>('');
  const [segmentDays, setSegmentDays] = useState('3');
  const [tariffId, setTariffId] = useState('');
  const [registeredDays, setRegisteredDays] = useState('');
  const [inactiveDays, setInactiveDays] = useState('');
  const [repeatEvery, setRepeatEvery] = useState('7');
  const [maxSends, setMaxSends] = useState('1');
  const [lang, setLang] = useState<(typeof REMINDER_LANGS)[number]>('ru');
  const [texts, setTexts] = useState<Record<string, ReminderText>>({
    ru: { title: '', body: '', button: '' },
  });
  const [buttonKind, setButtonKind] = useState<ReminderButtonKind>('none');
  const [buttonTarget, setButtonTarget] = useState('');
  const [error, setError] = useState<ReminderFormError | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ['admin-reminder', editId],
    queryFn: () => adminRemindersApi.get(editId as number),
    enabled: editId !== null,
  });

  const seededReminderId = useRef<number | null>(null);
  useEffect(() => {
    const reminder = existing.data;
    if (!reminder || seededReminderId.current === reminder.id) return;
    seededReminderId.current = reminder.id;
    setName(reminder.name);
    setChannels(reminder.channels);
    setCategory(reminder.category);
    setAuth(reminder.conditions.auth ?? '');
    setSegment(reminder.conditions.subscription?.segment ?? '');
    setSegmentDays(String(reminder.conditions.subscription?.days ?? 3));
    setTariffId(String(reminder.conditions.subscription?.tariff_id ?? ''));
    setRegisteredDays(
      reminder.conditions.registered_days_min != null
        ? String(reminder.conditions.registered_days_min)
        : '',
    );
    setInactiveDays(
      reminder.conditions.inactive_days_min != null
        ? String(reminder.conditions.inactive_days_min)
        : '',
    );
    setRepeatEvery(String(reminder.repeat_every_days));
    setMaxSends(String(reminder.max_sends));
    setTexts(reminder.texts);
    setButtonKind(reminder.button_kind);
    setButtonTarget(reminder.button_target ?? '');
  }, [existing.data]);

  const conditions = useMemo(() => {
    const result: ReminderPayload['conditions'] = {};
    if (auth) result.auth = auth;
    if (segment) {
      result.subscription = { segment };
      if (segment === 'expiring') result.subscription.days = parseReminderInteger(segmentDays) ?? 3;
      if (segment === 'tariff') result.subscription.tariff_id = parseReminderInteger(tariffId);
    }
    const registered = parseReminderInteger(registeredDays);
    if (registered !== null) result.registered_days_min = registered;
    const inactive = parseReminderInteger(inactiveDays);
    if (inactive !== null) result.inactive_days_min = inactive;
    return result;
  }, [auth, inactiveDays, registeredDays, segment, segmentDays, tariffId]);

  const tariffNumber = parseReminderInteger(tariffId);
  const tariffMissing = segment === 'tariff' && (tariffNumber === null || tariffNumber <= 0);

  const [debounced, setDebounced] = useState({ conditions, channels, category });
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced({ conditions, channels, category }), 400);
    return () => window.clearTimeout(timer);
  }, [category, channels, conditions]);

  const audience = useQuery({
    queryKey: ['admin-reminder-audience', debounced],
    queryFn: () => adminRemindersApi.audience(debounced),
    retry: false,
    enabled: !tariffMissing,
  });

  const payload = (): ReminderPayload => {
    const cleaned: Record<string, ReminderText> = {};
    for (const [code, text] of Object.entries(texts)) {
      if (!text.title.trim() && !text.body.trim()) continue;
      cleaned[code] = {
        title: text.title.trim(),
        body: text.body.trim(),
        ...(buttonKind !== 'none' && text.button?.trim() ? { button: text.button.trim() } : {}),
      };
    }
    return {
      name: name.trim(),
      channels,
      category,
      conditions,
      repeat_every_days: parseReminderInteger(repeatEvery) ?? 7,
      max_sends: parseReminderInteger(maxSends) ?? 1,
      texts: cleaned,
      button_kind: buttonKind,
      button_target: buttonKind === 'none' ? null : buttonTarget.trim(),
    };
  };

  const save = useMutation({
    mutationFn: (next: ReminderPayload) =>
      editId !== null ? adminRemindersApi.update(editId, next) : adminRemindersApi.create(next),
    onSuccess: () => navigate('/admin/reminders'),
    onError: (failure: unknown) => {
      const status = isAxiosError(failure) ? failure.response?.status : undefined;
      const detailMessage =
        status === 422 && isAxiosError(failure)
          ? firstReminderValidationMessage(failure.response?.data)
          : null;
      setError(
        detailMessage ? { text: detailMessage } : { key: 'admin.reminders.form.saveFailed' },
      );
    },
  });

  const test = useMutation({
    mutationFn: () => adminRemindersApi.test(editId as number),
    onMutate: () => setTestError(null),
    onError: (failure: unknown) => {
      const status = isAxiosError(failure) ? failure.response?.status : undefined;
      if (status === 400) setTestError('admin.reminders.form.testNoTelegram');
      else if (status === 422) setTestError('admin.reminders.form.testInvalidTexts');
      else setTestError('admin.reminders.form.testFailed');
    },
  });

  const submit = () => {
    if (tariffMissing) {
      setError({ key: 'admin.reminders.form.tariffRequired' });
      return;
    }
    if (buttonKind !== 'none' && !(texts.ru?.button ?? '').trim()) {
      setError({ key: 'admin.reminders.form.buttonTextRequired' });
      return;
    }
    for (const code of REMINDER_LANGS) {
      if (code === 'ru') continue;
      const entry = texts[code];
      const hasTitle = Boolean(entry?.title?.trim());
      const hasBody = Boolean(entry?.body?.trim());
      if (hasTitle !== hasBody) {
        setError({ key: 'admin.reminders.form.partialLanguage', params: { lang: code } });
        return;
      }
    }
    if (buttonKind === 'url' && !buttonTarget.trim().startsWith('https://')) {
      setError({ key: 'admin.reminders.form.httpsRequired' });
      return;
    }
    const next = payload();
    if (!next.texts.ru?.title || !next.texts.ru?.body) {
      setError({ key: 'admin.reminders.form.ruRequired' });
      return;
    }
    setError(null);
    save.mutate(next);
  };

  const current = texts[lang] ?? { title: '', body: '', button: '' };
  const textDirection = lang === 'fa' ? 'rtl' : 'ltr';
  const setText = (field: keyof ReminderText, value: string) =>
    setTexts((previous) => ({ ...previous, [lang]: { ...current, [field]: value } }));
  const preview = {
    ...texts.ru,
    ...Object.fromEntries(Object.entries(current).filter(([, value]) => value)),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-dark-50">
        {t(editId !== null ? 'admin.reminders.editTitle' : 'admin.reminders.createTitle')}
      </h1>

      <section className="space-y-3">
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.name')}
          <input
            aria-label={t('admin.reminders.form.name')}
            className={REMINDER_INPUT_CLASS}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
          />
        </label>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.channels')}
          <select
            aria-label={t('admin.reminders.form.channels')}
            className={REMINDER_INPUT_CLASS}
            value={channels}
            onChange={(event) => setChannels(event.target.value as ReminderChannels)}
          >
            <option value="both">{t('admin.reminders.channels.both')}</option>
            <option value="bot">{t('admin.reminders.channels.bot')}</option>
            <option value="cabinet">{t('admin.reminders.channels.cabinet')}</option>
          </select>
        </label>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.category')}
          <select
            aria-label={t('admin.reminders.form.category')}
            className={REMINDER_INPUT_CLASS}
            value={category}
            onChange={(event) => setCategory(event.target.value as 'service' | 'marketing')}
          >
            <option value="service">{t('admin.reminders.category.service')}</option>
            <option value="marketing">{t('admin.reminders.category.marketing')}</option>
          </select>
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-dark-100">{t('admin.reminders.form.conditions')}</h2>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.auth')}
          <select
            aria-label={t('admin.reminders.form.auth')}
            className={REMINDER_INPUT_CLASS}
            value={auth}
            onChange={(event) => setAuth(event.target.value as AuthCondition | '')}
          >
            <option value="">{t('admin.reminders.any')}</option>
            <option value="single_method">{t('admin.reminders.auth.single_method')}</option>
            <option value="telegram_only">{t('admin.reminders.auth.telegram_only')}</option>
            <option value="email_only">{t('admin.reminders.auth.email_only')}</option>
          </select>
        </label>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.segment')}
          <select
            aria-label={t('admin.reminders.form.segment')}
            className={REMINDER_INPUT_CLASS}
            value={segment}
            onChange={(event) => setSegment(event.target.value as SubscriptionSegment | '')}
          >
            <option value="">{t('admin.reminders.any')}</option>
            {(
              ['active', 'trial', 'expiring', 'expired', 'none', 'low_balance', 'tariff'] as const
            ).map((value) => (
              <option key={value} value={value}>
                {t(`admin.reminders.segment.${value}`)}
              </option>
            ))}
          </select>
        </label>
        {segment === 'expiring' && (
          <label className="block text-sm text-dark-300">
            {t('admin.reminders.form.segmentDays')}
            <input
              aria-label={t('admin.reminders.form.segmentDays')}
              type="number"
              min={1}
              max={365}
              className={REMINDER_INPUT_CLASS}
              value={segmentDays}
              onChange={(event) => setSegmentDays(event.target.value)}
            />
          </label>
        )}
        {segment === 'tariff' && (
          <label className="block text-sm text-dark-300">
            {t('admin.reminders.form.tariffId')}
            <input
              aria-label={t('admin.reminders.form.tariffId')}
              type="number"
              min={1}
              className={REMINDER_INPUT_CLASS}
              value={tariffId}
              onChange={(event) => setTariffId(event.target.value)}
            />
          </label>
        )}
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.registeredDays')}
          <input
            aria-label={t('admin.reminders.form.registeredDays')}
            type="number"
            min={0}
            max={3650}
            className={REMINDER_INPUT_CLASS}
            value={registeredDays}
            onChange={(event) => setRegisteredDays(event.target.value)}
          />
        </label>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.inactiveDays')}
          <input
            aria-label={t('admin.reminders.form.inactiveDays')}
            type="number"
            min={0}
            max={3650}
            className={REMINDER_INPUT_CLASS}
            value={inactiveDays}
            onChange={(event) => setInactiveDays(event.target.value)}
          />
        </label>
        <p className="text-sm text-dark-300">
          {t('admin.reminders.form.audience')}:{' '}
          {audience.data?.bot != null && <span>🤖 {audience.data.bot} </span>}
          {audience.data?.cabinet != null && <span>🖥 {audience.data.cabinet}</span>}
        </p>
      </section>

      {channels !== 'cabinet' && (
        <section className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-dark-300">
            {t('admin.reminders.form.repeatEvery')}
            <input
              aria-label={t('admin.reminders.form.repeatEvery')}
              type="number"
              min={1}
              max={365}
              className={REMINDER_INPUT_CLASS}
              value={repeatEvery}
              onChange={(event) => setRepeatEvery(event.target.value)}
            />
          </label>
          <label className="block text-sm text-dark-300">
            {t('admin.reminders.form.maxSends')}
            <input
              aria-label={t('admin.reminders.form.maxSends')}
              type="number"
              min={1}
              max={20}
              className={REMINDER_INPUT_CLASS}
              value={maxSends}
              onChange={(event) => setMaxSends(event.target.value)}
            />
          </label>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {REMINDER_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`rounded-lg px-3 py-1 text-sm ${lang === code ? 'bg-accent-500 text-on-accent' : 'bg-dark-800 text-dark-300'}`}
            >
              {code.toUpperCase()}
              {code === 'ru' ? ' *' : ''}
            </button>
          ))}
        </div>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.title')}
          <input
            aria-label={t('admin.reminders.form.title')}
            className={REMINDER_INPUT_CLASS}
            dir={textDirection}
            maxLength={80}
            value={current.title}
            onChange={(event) => setText('title', event.target.value)}
          />
        </label>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.body')}
          <textarea
            aria-label={t('admin.reminders.form.body')}
            className={REMINDER_INPUT_CLASS}
            dir={textDirection}
            rows={4}
            maxLength={1000}
            value={current.body}
            onChange={(event) => setText('body', event.target.value)}
          />
        </label>
        <label className="block text-sm text-dark-300">
          {t('admin.reminders.form.buttonKind')}
          <select
            aria-label={t('admin.reminders.form.buttonKind')}
            className={REMINDER_INPUT_CLASS}
            value={buttonKind}
            onChange={(event) => setButtonKind(event.target.value as ReminderButtonKind)}
          >
            <option value="none">{t('admin.reminders.button.none')}</option>
            <option value="cabinet">{t('admin.reminders.button.cabinet')}</option>
            <option value="url">{t('admin.reminders.button.url')}</option>
          </select>
        </label>
        {buttonKind !== 'none' && (
          <>
            <label className="block text-sm text-dark-300">
              {t('admin.reminders.form.buttonTarget')}
              <input
                aria-label={t('admin.reminders.form.buttonTarget')}
                className={REMINDER_INPUT_CLASS}
                maxLength={500}
                list={buttonKind === 'cabinet' ? 'reminder-cabinet-presets' : undefined}
                placeholder={buttonKind === 'cabinet' ? '/profile/accounts' : 'https://'}
                value={buttonTarget}
                onChange={(event) => setButtonTarget(event.target.value)}
              />
              <datalist id="reminder-cabinet-presets">
                {CABINET_REMINDER_TARGETS.map((preset) => (
                  <option key={preset} value={preset} />
                ))}
              </datalist>
            </label>
            <label className="block text-sm text-dark-300">
              {t('admin.reminders.form.buttonText')}
              <input
                aria-label={t('admin.reminders.form.buttonText')}
                className={REMINDER_INPUT_CLASS}
                dir={textDirection}
                maxLength={40}
                value={current.button ?? ''}
                onChange={(event) => setText('button', event.target.value)}
              />
            </label>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4">
        <div className="text-xs text-dark-400">{t('admin.reminders.form.preview')}</div>
        <div className="mt-1 font-semibold text-dark-50">{preview.title}</div>
        <div className="whitespace-pre-line text-sm text-dark-300">{preview.body}</div>
      </section>

      {error && (
        <p className="text-sm text-error-400">
          {'text' in error ? error.text : t(error.key, error.params)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={save.isPending}
          className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-on-accent"
        >
          {t('admin.reminders.form.save')}
        </button>
        {editId !== null && (
          <PermissionGate permission="user_reminders:edit">
            <button
              type="button"
              onClick={() => test.mutate()}
              disabled={test.isPending}
              className="rounded-xl bg-dark-700 px-4 py-2 text-sm text-dark-100"
            >
              {t('admin.reminders.form.sendTest')}
            </button>
            <span className="text-xs text-dark-400">{t('admin.reminders.form.testHint')}</span>
          </PermissionGate>
        )}
        {test.isSuccess && (
          <span className="text-sm text-success-400">{t('admin.reminders.form.testSent')}</span>
        )}
        {test.isError && testError && (
          <span className="text-sm text-error-400">{t(testError)}</span>
        )}
      </div>
    </div>
  );
}
