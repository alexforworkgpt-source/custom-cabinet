import { describe, expect, it } from 'vitest';
import en from './en.json';
import fa from './fa.json';
import ru from './ru.json';
import zh from './zh.json';

/**
 * Синхронность en/ru локалей. i18next настроен с fallbackLng: 'ru' — ключ,
 * отсутствующий в en.json, отдаёт англоязычным пользователям РУССКИЙ текст
 * (а не инлайн-дефолт из кода). Так весь namespace resetPassword.* уехал в
 * прод по-русски. Тест ловит новые дыры при добавлении ключей в одну локаль.
 */

// Русскоязычные словари бэкенд-настроек — осознанно только в ru
// (en падает на сырые имена настроек, это админ-экран).
const RU_ONLY_NAMESPACES = [
  'admin.settings.settingNames.',
  'admin.settings.categories.',
  'admin.settings.presets.',
];

// Известные дыры. #489 смержен, realtimeTitle переведён — список пуст.
const KNOWN_MISSING_IN_EN = new Set<string>([
  // Пусто — так и держать: новые ключи переводите в en.json, а не вносите сюда.
]);

const KNOWN_PLACEHOLDER_MISMATCHES = new Set<string>([]);

// Плюральные категории i18next: ru использует _one/_few/_many, en — _one/_other.
// Сравниваем БАЗОВЫЕ ключи (без плюрального суффикса); context-варианты
// (напр. _trial) — самостоятельные ключи и обязаны существовать в обеих локалях.
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

type Tree = { [key: string]: Tree | string };

function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.set(path, value);
    } else {
      for (const [k, v] of flatten(value, path)) {
        out.set(k, v);
      }
    }
  }
  return out;
}

const enFlat = flatten(en as Tree);
const faFlat = flatten(fa as Tree);
const ruFlat = flatten(ru as Tree);
const zhFlat = flatten(zh as Tree);

const V166_KEYS = [
  'auth.deepLinkIntro',
  'auth.loginWithBot',
  'auth.backToWidget',
  'subscription.connectFooter.connect',
  'subscription.connectFooter.full',
  'subscription.connectFooter.connectedDevices',
  'subscription.connectFooter.disconnect',
  'subscription.connectFooter.addSlots',
  'subscription.connectFooter.limitExplained',
  'subscription.connectFooter.limitExplainedNoTopup',
  'subscription.connectFooter.noTopupHint',
  'support.errors.alreadyOpenTicket',
  'support.errors.createFailed',
  'support.errors.replyFailed',
  'admin.promocodes.form.gb',
  'admin.promocodes.form.includeTraffic',
  'admin.promocodes.form.trafficAmount',
  'admin.promocodes.validation.trafficRequired',
  'admin.users.filters.byExpiry',
  'admin.users.detail.subscription.deleteButton',
  'admin.users.detail.subscription.deleteHint',
  'admin.users.detail.subscription.deleteTitle',
  'admin.users.detail.subscription.deleted',
  'admin.users.detail.subscription.deleteConflict',
  'admin.users.detail.subscription.deleteNotFound',
  'admin.users.detail.subscription.forceDeleteButton',
  'admin.users.detail.subscription.forceDeleteTitle',
  'admin.users.detail.subscription.forceDeleteWarning',
  'admin.remnawave.geoCheck.changeRoute',
  'admin.remnawave.geoCheck.copyJson',
  'admin.remnawave.geoCheck.download',
  'admin.remnawave.geoCheck.error.generic',
  'admin.remnawave.geoCheck.error.timeout',
  'admin.remnawave.geoCheck.error.title',
  'admin.remnawave.geoCheck.exitFullscreen',
  'admin.remnawave.geoCheck.fullscreen',
  'admin.remnawave.geoCheck.hint.default',
  'admin.remnawave.geoCheck.hint.interface',
  'admin.remnawave.geoCheck.hint.ip',
  'admin.remnawave.geoCheck.invalidInterface',
  'admin.remnawave.geoCheck.invalidIp',
  'admin.remnawave.geoCheck.mode.default',
  'admin.remnawave.geoCheck.mode.interface',
  'admin.remnawave.geoCheck.mode.ip',
  'admin.remnawave.geoCheck.mode.legend',
  'admin.remnawave.geoCheck.placeholder.default',
  'admin.remnawave.geoCheck.reportAlt',
  'admin.remnawave.geoCheck.rerun',
  'admin.remnawave.geoCheck.running',
  'admin.remnawave.geoCheck.runningHint',
  'admin.remnawave.geoCheck.start',
  'admin.remnawave.geoCheck.tab.json',
  'admin.remnawave.geoCheck.tab.report',
  'admin.remnawave.geoCheck.title',
  'admin.remnawave.geoCheck.zoomIn',
  'admin.remnawave.geoCheck.zoomOut',
  'admin.remnawave.geoCheck.zoomReset',
] as const;

const ISSUE_03_EMAIL_AUTH_KEYS = [
  'auth.spamHint',
  'auth.resendVerification',
  'auth.resendIn',
  'auth.resendSent',
  'auth.resendError',
  'auth.resendTooOften',
  'auth.useAnotherEmail',
  'auth.emailAuthDisabled',
  'auth.disposableEmail',
  'auth.registrationHourlyLimit',
  'auth.registrationDailyLimit',
  'auth.registrationFailed',
] as const;

const V179_LOCALIZATION_PREFIXES = [
  'common.relative.',
  'subscription.legacy.',
  'admin.broadcasts.filterGroups.',
  'admin.graceAccess.',
  'admin.promoGroups.',
  'admin.reminders.',
  'admin.users.views.',
  'admin.users.filterLabels.',
  'admin.users.filterAny.',
  'admin.users.subFilters.',
  'admin.users.sort.',
  'admin.users.statuses.',
  'admin.users.detail.salesMode.',
  'admin.users.detail.sync.rows.',
] as const;

const V179_LOCALIZATION_KEYS = [
  'dashboard.reminders.dismiss',
  'profile.accounts.unlinkForgetsEmail',
  'subscription.cta.moveToTariff',
  'subscription.cta.moveToTariffHint',
  'balance.refund',
  'balance.failedRefund',
  'balance.pollReward',
  'balance.giftPayment',
  'balance.otherOperation',
  'admin.nav.reminders',
  'admin.broadcasts.singleUser',
  'admin.users.connectedNow',
  'admin.users.endOfList',
  'admin.users.filters.remove',
  'admin.users.loadError',
  'admin.users.moreTariffs',
  'admin.users.noneFound',
  'admin.users.reset',
  'admin.users.search',
  'admin.users.shown',
  'admin.users.subscriptionChips.graceUntil',
  'admin.users.toTop',
  'admin.users.viewsLabel',
  'admin.users.detail.header.writeEmail',
  'admin.users.detail.sync.byGrace',
  'admin.users.detail.sync.graceOverlay',
] as const;

const V179_PLURAL_BASES = [
  'common.relative.minutes',
  'common.relative.hours',
  'common.relative.days',
  'common.relative.weeks',
  'common.relative.months',
  'admin.users.endOfList',
  'admin.users.detail.salesMode.subscriptionCount',
] as const;

const EXPECTED_PLURAL_SUFFIXES = {
  ru: ['one', 'few', 'many'],
  en: ['one', 'other'],
  fa: ['one', 'other'],
  zh: ['other'],
} as const;

function baseKeys(flat: Map<string, string>): Set<string> {
  return new Set([...flat.keys()].map((k) => k.replace(PLURAL_SUFFIX, '')));
}

const enBases = baseKeys(enFlat);
const ruBases = baseKeys(ruFlat);

const locales = { en: enFlat, fa: faFlat, ru: ruFlat, zh: zhFlat } as const;

const v179Bases = new Set([
  ...[...ruFlat.keys()]
    .filter((key) => V179_LOCALIZATION_PREFIXES.some((prefix) => key.startsWith(prefix)))
    .map((key) => key.replace(PLURAL_SUFFIX, '')),
  ...V179_LOCALIZATION_KEYS,
]);

describe('синхронность локалей en/ru', () => {
  it('каждый en-ключ существует в ru', () => {
    const missing = [...enBases].filter((k) => !ruBases.has(k));
    expect(missing).toEqual([]);
  });

  it('каждый ru-ключ существует в en (кроме ru-only словарей настроек)', () => {
    const missing = [...ruBases].filter(
      (k) =>
        !enBases.has(k) &&
        !RU_ONLY_NAMESPACES.some((ns) => k.startsWith(ns)) &&
        !KNOWN_MISSING_IN_EN.has(k),
    );
    expect(missing).toEqual([]);
  });

  it('плейсхолдеры {{...}} совпадают в общих ключах', () => {
    const PH = /\{\{[^}]+\}\}/g;
    const mismatches: string[] = [];
    for (const [key, ruValue] of ruFlat) {
      const enValue = enFlat.get(key);
      if (enValue === undefined || KNOWN_PLACEHOLDER_MISMATCHES.has(key)) {
        continue;
      }
      const ruPh = (ruValue.match(PH) ?? []).sort().join(',');
      const enPh = (enValue.match(PH) ?? []).sort().join(',');
      if (ruPh !== enPh) {
        mismatches.push(`${key}: ru=[${ruPh}] en=[${enPh}]`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});

describe('локализация функций Upstream Cabinet v1.66.0', () => {
  it('содержит все новые ключи во всех поддерживаемых локалях', () => {
    for (const [locale, flat] of Object.entries({
      en: enFlat,
      fa: faFlat,
      ru: ruFlat,
      zh: zhFlat,
    })) {
      const missing = V166_KEYS.filter((key) => !flat.has(key));
      expect(missing, locale).toEqual([]);
    }
  });

  it('сохраняет одинаковые плейсхолдеры во всех новых переводах', () => {
    const placeholderPattern = /\{\{[^}]+\}\}/g;
    for (const key of V166_KEYS) {
      const placeholders = [enFlat, faFlat, ruFlat, zhFlat].map((flat) =>
        (flat.get(key)?.match(placeholderPattern) ?? []).sort().join(','),
      );
      expect(new Set(placeholders).size, key).toBe(1);
    }
  });
});

describe('локализация email-регистрации из Issue 03', () => {
  it('содержит пользовательские состояния во всех поддерживаемых локалях', () => {
    for (const [locale, flat] of Object.entries({
      en: enFlat,
      fa: faFlat,
      ru: ruFlat,
      zh: zhFlat,
    })) {
      const missing = ISSUE_03_EMAIL_AUTH_KEYS.filter((key) => !flat.has(key));
      expect(missing, locale).toEqual([]);
    }
  });

  it('сохраняет одинаковые плейсхолдеры во всех новых переводах', () => {
    const placeholderPattern = /\{\{[^}]+\}\}/g;
    for (const key of ISSUE_03_EMAIL_AUTH_KEYS) {
      const placeholders = [enFlat, faFlat, ruFlat, zhFlat].map((flat) =>
        (flat.get(key)?.match(placeholderPattern) ?? []).sort().join(','),
      );
      expect(new Set(placeholders).size, key).toBe(1);
    }
  });
});

describe('локализация адаптации Upstream Cabinet v1.79.0', () => {
  it('содержит непустые ключи Slice 1–9 во всех поддерживаемых локалях', () => {
    for (const [locale, flat] of Object.entries(locales)) {
      const bases = baseKeys(flat);
      const missing = [...v179Bases].filter((key) => !bases.has(key));
      const empty = [...flat]
        .filter(([key, value]) => v179Bases.has(key.replace(PLURAL_SUFFIX, '')) && !value.trim())
        .map(([key]) => key);

      expect(missing, `${locale}: missing`).toEqual([]);
      expect(empty, `${locale}: empty`).toEqual([]);
    }
  });

  it('сохраняет одинаковые плейсхолдеры в ключах Slice 1–9', () => {
    const placeholderPattern = /\{\{[^}]+\}\}/g;

    for (const base of v179Bases) {
      const signatures = Object.entries(locales).map(([locale, flat]) => {
        const values = [...flat]
          .filter(([key]) => key.replace(PLURAL_SUFFIX, '') === base)
          .map(([, value]) => (value.match(placeholderPattern) ?? []).sort().join(','));
        expect(new Set(values).size, `${locale}: ${base}`).toBe(1);
        return values[0];
      });

      expect(new Set(signatures).size, base).toBe(1);
    }
  });

  it('содержит нужные i18next-формы множественного числа', () => {
    for (const base of V179_PLURAL_BASES) {
      for (const [locale, suffixes] of Object.entries(EXPECTED_PLURAL_SUFFIXES)) {
        const flat = locales[locale as keyof typeof locales];
        const missing = suffixes.filter((suffix) => !flat.has(`${base}_${suffix}`));
        expect(missing, `${locale}: ${base}`).toEqual([]);
      }
    }
  });
});
