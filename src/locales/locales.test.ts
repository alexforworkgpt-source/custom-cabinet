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

function baseKeys(flat: Map<string, string>): Set<string> {
  return new Set([...flat.keys()].map((k) => k.replace(PLURAL_SUFFIX, '')));
}

const enBases = baseKeys(enFlat);
const ruBases = baseKeys(ruFlat);

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
