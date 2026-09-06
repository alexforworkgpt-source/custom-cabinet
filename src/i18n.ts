import i18n, { type ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getTelegramLanguageCode } from './hooks/useTelegramSDK';

const localeLoaders: Record<string, () => Promise<{ default: ResourceLanguage }>> = {
  ru: () => import('./locales/ru.json'),
  en: () => import('./locales/en.json'),
  zh: () => import('./locales/zh.json'),
  fa: () => import('./locales/fa.json'),
};

const SUPPORTED_LANGS = Object.keys(localeLoaders);
const FALLBACK_LNG = 'ru';
const LANGUAGE_STORAGE_KEY = 'cabinet_language';

const loadedLanguages = new Set<string>();
const pendingLanguages = new Map<string, Promise<void>>();

async function loadLanguage(lng: string): Promise<void> {
  if (loadedLanguages.has(lng)) return;

  const loader = localeLoaders[lng];
  if (!loader) return;

  const pending = pendingLanguages.get(lng);
  if (pending) return pending;
  const loading = loader()
    .then((mod) => {
      i18n.addResourceBundle(lng, 'translation', mod.default, true, true);
      loadedLanguages.add(lng);
    })
    .finally(() => pendingLanguages.delete(lng));
  pendingLanguages.set(lng, loading);
  return loading;
}

const i18nInitialization = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: FALLBACK_LNG,
    supportedLngs: SUPPORTED_LANGS,
    partialBundledLanguages: true,

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cabinet_language',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    showSupportNotice: false,
  });

// Сколько ждать словари, прежде чем рисовать без них. Белый экран хуже
// непереведённого текста: если чанк локали не приехал (сеть отвалилась, прокси
// отдал 502), приложение обязано появиться.
const READY_TIMEOUT_MS = 5000;

function waitForDictionary(loading: Promise<unknown>): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, READY_TIMEOUT_MS);
    void loading
      .catch(() => undefined)
      .then(() => {
        clearTimeout(timer);
        resolve();
      });
  });
}

async function loadStartupLanguages(): Promise<void> {
  // LanguageDetector finishes as part of async init. Reading i18n.language
  // before this promise resolves can incorrectly select only the fallback and
  // let the detected dictionary load after React has already rendered.
  await i18nInitialization;
  const detectedLng = i18n.language?.split('-')[0] || FALLBACK_LNG;
  const langsToLoad = [FALLBACK_LNG, ...(detectedLng !== FALLBACK_LNG ? [detectedLng] : [])];
  syncHtmlLang(detectedLng);
  await Promise.all(langsToLoad.map(loadLanguage));
}

/**
 * Резолвится, когда словари активного языка зарегистрированы в i18next.
 *
 * Локали лежат в отдельных ленивых чанках (~75 КБ gzip), а `useSuspense`
 * выключен — значит react-i18next не приостановит отрисовку и `t('auth.login')`
 * вернёт сам ключ. С прогретым кэшем чанк приходил раньше первой отрисовки и
 * этого не было видно; на холодном интерфейс успевал нарисоваться с сырыми
 * ключами. Точка входа ждёт этот промис перед `createRoot().render()`.
 *
 * Никогда не реджектится и не висит дольше READY_TIMEOUT_MS.
 */
export const i18nReady = waitForDictionary(loadStartupLanguages());

// Keep <html lang> + dir in sync with i18n so screen readers pronounce
// content correctly, browsers don't offer to translate it, and RTL
// languages (fa) flip layout direction. index.html ships with lang="ru"
// for the first paint; runtime updates take over from there.
const RTL_LANGS = new Set(['fa', 'ar', 'he', 'ur']);
function syncHtmlLang(lng: string): void {
  const code = lng.split('-')[0];
  if (typeof document === 'undefined') return;
  if (document.documentElement.lang !== code) {
    document.documentElement.lang = code;
  }
  const dir = RTL_LANGS.has(code) ? 'rtl' : 'ltr';
  if (document.documentElement.dir !== dir) {
    document.documentElement.dir = dir;
  }
}

// Lazy-load on language change
i18n.on('languageChanged', (lng: string) => {
  const code = lng.split('-')[0];
  void loadLanguage(code).catch(() => undefined);
  syncHtmlLang(code);
});

/**
 * On first run inside Telegram (no explicit stored choice), adopt the user's
 * Telegram client language. Must be called after the Telegram SDK is initialised
 * (e.g. from main.tsx), since launch params are unavailable before init().
 */
export async function applyTelegramLanguage(): Promise<void> {
  try {
    if (localStorage.getItem(LANGUAGE_STORAGE_KEY)) return; // explicit choice wins
  } catch {
    return;
  }
  await waitForDictionary(i18nInitialization);
  const code = getTelegramLanguageCode();
  if (code && SUPPORTED_LANGS.includes(code) && i18n.language?.split('-')[0] !== code) {
    void i18n.changeLanguage(code).catch(() => undefined);
    // Возвращаем именно загрузку словаря, а не changeLanguage: обработчик
    // languageChanged тянет чанк отдельно, и без этого ожидания точка входа
    // нарисовала бы новый язык до его словаря — те же сырые ключи.
    await waitForDictionary(loadLanguage(code));
  }
}

export default i18n;
