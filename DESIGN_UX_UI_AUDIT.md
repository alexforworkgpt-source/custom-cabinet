# Аудит дизайна, дизайн-системы и UX/UI Custom Cabinet

Дата аудита: 15 августа 2026 года<br>
Исходная точка: `49d4bba` (`Enable public CodeQL analysis`)<br>
Версия проекта: `1.65.0`

## 1. Назначение отчета

Этот документ фиксирует текущее состояние интерфейса Custom Cabinet перед редизайном. Он нужен как общая карта продукта и как исходная точка для дальнейших решений:

- какие пользовательские и административные сценарии уже существуют;
- из каких визуальных правил и UI-компонентов фактически собран интерфейс;
- какие части текущей системы стоит сохранить;
- где дизайн-система распалась на параллельные реализации;
- какие UX- и accessibility-проблемы нужно устранить до или вместе с редизайном;
- как безопасно разбить редизайн на этапы, не меняя продуктовую логику одним большим релизом.

Это аудит текущей реализации, а не готовая спецификация нового дизайна. Визуальное направление будущего редизайна должно определяться отдельно после уточнения позиционирования, аудитории, ограничений branding и продуктовых метрик.

## 2. Методика и границы

Проведены:

- анализ структуры и документации проекта;
- инвентаризация маршрутов, страниц, компонентов и UI-зависимостей;
- анализ глобальных стилей, Tailwind-темы, CSS variables и runtime-темизации;
- разбор пользовательской, мобильной и административной навигации;
- выборочная проверка ключевых пользовательских страниц и сложных административных экранов;
- статический аудит forms, dialogs, sheets, cards, tables, loading states, motion и accessibility;
- запуск dev-сборки и проверка публичного экрана входа на ширинах 1740, 375 и 320 px;
- проверка DOM, размеров интерактивных элементов, языка документа, цветовой темы и горизонтального переполнения.

Ограничения:

- без входа под реальным пользователем и администратором нельзя визуально подтвердить каждый защищенный экран;
- Telegram Mini App проверялся по коду и SDK-интеграции, но не внутри реального клиента Telegram;
- runtime-проверка использовала локальные ответы окружения разработки, а не production-конфигурацию;
- скриншоты не добавлялись в репозиторий согласно правилам проекта;
- полный contrast-аудит всех операторских цветовых комбинаций не проводился.

## 3. Масштаб продукта

Custom Cabinet не является одним небольшим личным кабинетом. Это три связанных интерфейсных режима:

1. Публичный вход и публичные транзакционные страницы.
2. Пользовательский кабинет, работающий и как обычный web-интерфейс, и как Telegram Mini App.
3. Большая административная консоль с аналитикой, таблицами, редакторами, permissions и системными настройками.

Численные ориентиры текущего дерева:

- 304 отслеживаемых TSX-файла;
- 214 файлов внутри `src/components/`;
- 122 файла внутри `src/pages/` с учетом вложенных модулей;
- 131 декларация `<Route>` в `src/App.tsx`;
- 919 вхождений raw `<button>` против 37 вхождений общего `<Button>`;
- 255 raw `<input>`, 40 raw `<select>`, 13 raw `<table>`;
- 322 вхождения hex-цветов в TSX;
- 19 unit test-файлов, но нет UI/component/e2e/accessibility тестовой инфраструктуры.

Главный вывод из масштаба: редизайн должен строиться через системные primitives и шаблоны страниц. Ручной редизайн каждого экрана независимо закрепит существующую фрагментацию.

## 4. Технологическая основа UI

Основной стек (`package.json`):

- React 19;
- TypeScript;
- Vite 7;
- React Router 7;
- Tailwind CSS 3;
- Framer Motion;
- Radix UI primitives;
- TanStack Query и TanStack Table;
- Zustand;
- i18next;
- Telegram Apps SDK;
- Recharts;
- TipTap;
- Sigma/Graphology для графовых представлений;
- `class-variance-authority`, `clsx`, `tailwind-merge` для variant-based компонентов.

Это хорошая база для системного редизайна: проект уже имеет необходимые технологии для tokens, accessible primitives, data-heavy UI, responsive states и motion. Главная проблема не в стеке, а в непоследовательном использовании этой базы.

## 5. Информационная архитектура

### 5.1 Публичные сценарии

По `src/App.tsx:267-327` доступны:

- вход и регистрация;
- Telegram callback и redirect;
- OAuth callback;
- подтверждение email и сброс пароля;
- публичные юридические документы;
- объединение аккаунтов;
- быстрая покупка;
- получение подарка;
- проверка купона;
- результат покупки;
- deep-link redirect;
- auto-login.

Особенность: публичная зона содержит не только authentication, но и важные платежные и claim-сценарии. Для редизайна это отдельное семейство transactional layouts, а не просто «экран входа».

### 5.2 Основные пользовательские сценарии

Защищенная зона (`src/App.tsx:329-620`) включает:

- Dashboard;
- список и детали подписок;
- покупку, продление и подключение подписки;
- баланс, пополнение, способы оплаты и сохраненные карты;
- referral-программу, партнерскую заявку и вывод средств;
- поддержку;
- профиль и связанные аккаунты;
- конкурсы, опросы и колесо;
- подарочные подписки;
- новости и информационные страницы.

Ключевые пользовательские jobs-to-be-done:

- понять состояние подписки;
- купить или продлить доступ;
- подключить устройство;
- проверить трафик и лимиты;
- пополнить баланс и понять статус платежа;
- быстро получить помощь;
- управлять аккаунтом и уведомлениями;
- использовать referral, gift и promotional механики.

### 5.3 Административные сценарии

Административная зона (`src/App.tsx:623-1431`) содержит RBAC и десятки специализированных страниц. `src/pages/AdminPanel.tsx:116-348` группирует их в шесть доменов:

- analytics: dashboard, payments, traffic, sales;
- users: users, bulk actions, tickets, ban system;
- tariffs: tariffs, promocodes, coupons, promo groups, promo offers, payment methods, landings;
- marketing: news, campaigns, broadcasts, pinned messages, wheel, partners, withdrawals, referral network;
- system: channels, settings, apps, servers, Remnawave, email templates, info/legal pages, updates;
- security: roles, role assignment, policies, audit log.

Административная часть фактически является отдельным продуктом. Для нее нужны собственные shell, density scale, table/form patterns и navigation model. Пользовательский mobile-first shell не должен автоматически определять геометрию сложной admin-консоли.

## 6. Текущая визуальная концепция

### 6.1 Общий характер

Интерфейс сочетает несколько визуальных направлений:

- dark tech SaaS;
- bento cards;
- glass surfaces и backdrop blur;
- Linear-подобные компактные элементы;
- accent glows;
- warm champagne light theme;
- отдельные более декоративные промо- и gamification-блоки;
- плотный dashboard-язык в административной зоне.

Код прямо называет несколько систем: `BENTO DESIGN SYSTEM`, `Linear Design Tokens`, `Aceternity UI background animations`. Это показывает, что интерфейс эволюционировал через добавление разных визуальных наборов, а не через один согласованный foundation.

### 6.2 Сильные стороны визуального языка

- Нейтральная темная база хорошо подходит для сетевого/технологического сервиса.
- Accent и status palettes поддерживают operator branding.
- Карточная композиция хорошо работает на Dashboard и мобильных экранах.
- Champagne light theme заметно отличается от стандартной серо-белой темы и может стать узнаваемой частью бренда.
- Есть выразительные product moments: subscription status, trial, wheel, promotions, connection flow.
- UI не зависит только от одной фиксированной brand palette.
- Визуальные состояния loading, success, warning и error уже широко представлены.

### 6.3 Основные визуальные проблемы

- Одновременно используются bento, Linear, glass, glow, gradient и plain admin styles.
- Радиусы 8, 12, 16, 20, 24, 32 px и pill встречаются без четкой семантики.
- Cards создаются через `.card`, `.bento-card`, `Card`, `BentoCard` и локальные className-композиции.
- Buttons существуют как CSS-классы, primitive `Button` и сотни raw buttons.
- Светлая тема часто реализована через глобальное переопределение dark tokens плюс локальные `light:` overrides.
- Много мелкого текста 9-11 px, особенно в admin UI.
- Декоративная насыщенность распределена неравномерно: рядом могут находиться минималистичная форма, glow-card и сложный animated background.
- В TSX остается много прямых цветов и локальных теней, поэтому operator palette не гарантирует визуальную целостность.

## 7. Текущая дизайн-система

### 7.1 Цвета

Foundation определен в трех местах:

- Tailwind palette: `tailwind.config.js:18-117`;
- fallback CSS variables: `src/styles/globals.css:133-229`;
- runtime генерация palettes: `src/hooks/useThemeColors.ts:112-258`.

Основные группы:

- `dark-50..950`;
- `champagne-50..950`;
- `accent-50..950`;
- `success`, `warning`, `error`;
- `urgent`, `critical` для состояния подписки;
- `on-accent`, `on-success`, `on-warning`, `on-error` для текста на цветной заливке.

Сильная реализация:

- runtime palette генерируется от operator-defined colors;
- `ensureReadable()` задает минимальный contrast floor для вторичного текста (`src/hooks/useThemeColors.ts:83-100`);
- `onColorFor()` выбирает темный или белый текст на accent/status fill (`src/hooks/useThemeColors.ts:102-110`);
- частичный branding response дополняется defaults (`src/hooks/useThemeColors.ts:113-117`).

Системный риск:

- токены названы по визуальной шкале и теме, а не по назначению: `dark-400`, `champagne-700` вместо `text-secondary`, `surface-raised`, `border-subtle`;
- light mode переназначает значения `--color-dark-*` (`src/styles/globals.css:340-370`), поэтому смысл имени меняется в зависимости от темы;
- компоненты одновременно используют remapped `dark-*` и явные `light:*` классы;
- масштаб прямых literals затрудняет глобальную смену направления;
- operator может менять colors, но не получает гарантированно согласованный visual hierarchy во всех локальных стилях.

Для редизайна нужен semantic token layer поверх существующей palette generation.

Рекомендуемые группы semantic tokens:

- canvas, surface, surface-raised, surface-overlay;
- text-primary, text-secondary, text-muted, text-inverse;
- border-subtle, border-default, border-strong, focus-ring;
- action-primary, action-primary-hover, action-secondary;
- status-success, status-warning, status-danger, status-info;
- subscription-active, subscription-expiring, subscription-expired;
- chart series и data visualization tokens.

### 7.2 Светлая и темная темы

Рабочая тема управляется через `useTheme` (`src/hooks/useTheme.ts`). Поддерживаются:

- dark/light;
- выбор Telegram color scheme при первом запуске;
- system preference;
- кеш enabled themes;
- синхронизация между вкладками и компонентами;
- operator-controlled enable/disable theme.

Параллельно существует `useUserThemePreferences` (`src/hooks/useUserThemePreferences.ts`) с:

- `system` mode;
- user border radius;
- animation toggle;
- Telegram CloudStorage sync.

Этот второй механизм не подключен к продуктовым экранам. Сейчас код содержит две конкурирующие архитектуры темы, но пользователь фактически получает только первую. Перед редизайном нужно выбрать одну модель и удалить либо осознанно интегрировать вторую.

### 7.3 Типографика

Определены:

- Manrope как основной sans;
- Outfit как display;
- IBM Plex Mono как mono;
- Twemoji Country Flags как узкий fallback для flags.

Ссылки: `tailwind.config.js:118-134`, `index.html:19-32`, `src/styles/globals.css:5-15`.

Плюсы:

- Manrope читабелен и достаточно нейтрален для пользовательского кабинета;
- IBM Plex Mono уместен для IDs, versions и metrics;
- отдельный flag font решает Windows-проблему без изменения markup.

Риски:

- основные fonts загружаются с Google Fonts, что создает внешнюю зависимость для WebView и медленных сетей;
- display font не сформирован в ясную роль, поэтому часто используется только `font-sans`;
- admin UI опускается до 10, 9 и даже 8-подобных визуальных размеров (`text-2xs` = 10 px);
- нет документированной type scale по ролям;
- uppercase + wide tracking + 10 px ухудшает локализацию и чтение.

Для редизайна следует определить роли, а не только размеры: display, page title, section title, body, supporting, label, caption, data, code.

### 7.4 Spacing и layout

Есть несколько параллельных шкал:

- Tailwind default spacing;
- bento gap/padding;
- Linear spacing tokens;
- `compact/comfortable/spacious` CSS variables.

Ссылки: `tailwind.config.js:142-151`, `src/styles/globals.css:105-132`.

Проблема: большинство компонентов продолжают собирать spacing через произвольные utility combinations. Наличие scale еще не означает ее системное применение.

Основной content container: `max-w-6xl` (`src/components/layout/AppShell/AppShell.tsx:303`). Это разумно для пользовательского кабинета, но ограничивает административную часть примерно 1152 px. Внутренний `max-w-[1600px]` в AdminPanel (`src/pages/AdminPanel.tsx:630-636`) не может расширить родительский container. Для таблиц, редакторов и аналитики это структурное ограничение.

### 7.5 Радиусы

Найдены:

- bento radius в CSS: 16 px;
- bento radius в Tailwind: 24 px;
- bento large: 20 px;
- Linear: 8/12 px;
- user presets: 0/8/16/24/pill;
- `4xl`: 32 px.

Ссылки: `tailwind.config.js:135-141`, `src/styles/globals.css:105-127`, `src/types/theme.ts:72-115`.

Несоответствие `rounded-bento: 24px` и `--bento-radius: 16px` особенно важно: два элемента с названием bento могут иметь разную геометрию.

### 7.6 Shadows, blur и backgrounds

Система поддерживает:

- soft/card shadows;
- accent glow;
- glass blur;
- noise texture;
- animated borders;
- configurable BackgroundHost;
- Aceternity-style animations;
- gradients и status halos.

Плюсы:

- backdrop blur отключается на mobile ради производительности (`src/styles/globals.css:743-757`);
- noise отключается на mobile (`src/styles/globals.css:307-325`);
- BackgroundHost живет над Routes и не перезапускает animation при navigation (`src/App.tsx:261-265`).

Риск: эффектов больше, чем ясных правил их использования. В редизайне следует определить 2-3 elevation levels и четко ограничить glow/animated background только brand moments.

### 7.7 Motion

Используются:

- Framer Motion для route-local и component transitions;
- shared transitions в `src/components/motion/`;
- Tailwind/CSS animations;
- haptic feedback через platform abstraction;
- onboarding transitions;
- animated counters, cards, backgrounds и status effects.

Сильные стороны:

- глобальный `prefers-reduced-motion` fallback (`src/styles/globals.css:60-82`);
- motion часто связан с feedback и state;
- на mobile отключаются дорогие эффекты;
- haptics учитывают Telegram/platform context.

Риски:

- CSS animation, Framer variants и локальные transitions задают разные durations/easings;
- user animation preference реализована, но не подключена;
- часть motion декоративна и может создавать визуальный шум;
- shared active-navigation `layoutId` хорош, но нет общей motion scale.

## 8. UI-компоненты и степень зрелости

### 8.1 Существующие primitives

В `src/components/primitives/` уже есть:

- Button;
- Command;
- Dialog;
- DropdownMenu;
- Popover;
- Select;
- Sheet;
- Switch;
- Tooltip.

Большинство построено на Radix UI, что является хорошей основой для accessibility и keyboard behavior.

### 8.2 Параллельные реализации

Фактически присутствуют:

- `.btn-*` CSS-классы и `primitives/Button`;
- `.card`, `.bento-card`, `data-display/Card`, `ui/BentoCard`;
- `primitives/Sheet` и `ui/Sheet`;
- canonical Dialog и множество ручных fixed overlays;
- shared Spinner/PageLoader и многочисленные локальные `animate-spin`;
- shared Select и десятки native/custom selects;
- shared icons, `react-icons` и отдельные emoji/локальные SVG patterns.

Это ключевой источник непоследовательности. Новый дизайн сначала должен определить canonical primitives, затем страницы должны мигрировать на них.

### 8.3 Card

`src/components/data-display/Card/Card.tsx` поддерживает size, variant, interactive, glow, haptic и motion.

Критичный API-дефект:

- `interactive` рендерит `motion.div onClick` без button/link semantics, keyboard activation и `tabIndex` (`Card.tsx:97-110`);
- это используется в Balance, Profile и TopUpMethodSelect;
- `asChild` не переносит текущий `onClick` handling и haptic behavior (`Card.tsx:89-95`).

Редизайн должен разделить `Card` как surface и `CardAction`/link-card как интерактивный элемент с правильной семантикой.

### 8.4 Button

Primitive Button имеет variants, sizes, loading, icons, haptics и motion (`src/components/primitives/Button/Button.tsx`). Это хорошая база.

Но он почти не является обязательным: raw buttons доминируют. Поэтому размеры, loading state, accessible labels и icon spacing расходятся по страницам.

Нужные роли будущей системы:

- primary;
- secondary;
- tertiary/ghost;
- destructive;
- icon;
- link;
- toolbar;
- compact data-table action;
- Telegram MainButton adapter, если он используется как отдельный platform action.

### 8.5 Dialog и Sheet

Radix-based canonical primitives существуют, но почти не используются. Вместо них страницы создают ручные `fixed inset-0` overlays.

Последствия:

- разный z-index;
- разный focus management;
- разная Escape/backdrop логика;
- не везде есть portal;
- не везде есть `role="dialog"`, `aria-modal`, title и description;
- возможна несовместимость с Telegram back behavior;
- дублируется scroll lock.

Особенно опасно сочетание ручных overlays с `main { contain: content; }` (`src/styles/globals.css:327-331`). Комментарий говорит, что containment удален, но свойство осталось. Вложенный `position: fixed` без portal может позиционироваться/обрезаться относительно `main` и не перекрывать header или bottom navigation.

Первыми для browser-проверки и миграции должны быть Contests, Polls, AdminCouponDetail и destructive admin confirmations.

### 8.6 Forms

Плюсы:

- на Login видимые labels и autocomplete;
- есть inline validation;
- ошибки иногда используют `role="alert"`;
- предусмотрены OTP/inputMode patterns;
- loading и disabled states присутствуют.

Проблемы:

- нет общего Field primitive;
- label/error/description собираются вручную;
- ошибки часто не связаны с полем через `aria-describedby`;
- `aria-invalid` применяется непоследовательно;
- некоторые labels не имеют `htmlFor`/`id`;
- native select, Radix Select и локальные dropdowns визуально расходятся;
- form actions не имеют единой мобильной sticky-модели;
- длинные admin forms нуждаются в sections, validation summary и unsaved state pattern.

### 8.7 Tables и data-heavy UI

Административные экраны содержат TanStack Table и raw tables. Пример `src/pages/AdminTrafficUsage.tsx:850-941`:

- sorting висит на `<th onClick>`;
- нет keyboard activation и `aria-sort`;
- resize handle является mouse/touch div;
- строка открывается через `<tr onClick>`;
- нет стабильного общего caption/scope pattern.

Для редизайна admin UI нужен один DataTable foundation:

- semantic sorting buttons;
- density variants;
- sticky header;
- pagination/filter toolbar;
- row selection;
- responsive column strategy;
- empty/loading/error states;
- accessible row actions;
- mobile alternative для критичных таблиц.

## 9. Navigation и shell

### 9.1 Desktop

Desktop shell использует fixed header с:

- logo;
- centered pill navigation;
- theme, tickets, language и logout actions.

Ссылки: `src/components/layout/AppShell/AppShell.tsx:192-277`.

Плюсы:

- основная навигация всегда видима;
- active state анимируется и не зависит от hover;
- трехколоночная сетка удерживает nav по центру;
- user shell компактный и оставляет максимум места контенту.

Риски:

- в pill помещаются 8 пользовательских пунктов и admin entry;
- на ширинах около 1024-1280 px длинные переводы и logo/actions могут конфликтовать;
- нет overflow/collapse стратегии;
- admin получает только один общий entry вместо постоянной контекстной navigation;
- active state не объявлен через `aria-current="page"`.

### 9.2 Mobile header и drawer

Mobile header содержит logo, search, theme, tickets, language и menu. Drawer содержит полный список, user info, profile, admin и logout.

Проблемы:

- header визуально и функционально перегружен;
- search button ничего не делает: `onCommandPaletteOpen={() => {}}` (`AppShell.tsx:279-294`);
- search trigger не имеет `aria-label` и использует нелокализованный title (`AppHeader.tsx:227-239`);
- drawer не имеет focus trap, Escape, focus return, `aria-controls` и dialog/navigation semantics (`AppHeader.tsx:306-418`);
- open drawer не делает фон `inert`;
- active links также не используют `aria-current`.

### 9.3 Bottom navigation

Bottom navigation имеет 4-5 приоритетных пунктов (`MobileBottomNav.tsx:29-52`): Dashboard, subscriptions, balance, optional wheel/referral, support.

Это одно из наиболее осознанных UX-решений в проекте:

- Support не вытесняется gamification feature;
- число пунктов ограничено;
- keyboard state скрывает nav;
- учитывается safe-area;
- haptic feedback встроен.

Недочеты:

- `aria-current` отсутствует;
- labels используют 10 px;
- fixed floating bar съедает значительную высоту на маленьких экранах;
- profile и secondary features зависят от перегруженного drawer;
- при редизайне нужно проверить, не лучше ли platform-specific placement для Telegram.

### 9.4 Command Palette

Компонент реализован в `src/components/navigation/CommandPalette/CommandPalette.tsx`, но не подключен к AppShell. В admin panel отдельно существует локальный Cmd/Ctrl+K search.

Нужно выбрать одно решение:

- подключить глобальный command/search layer с feature flags, localized labels и полным route registry;
- либо убрать неработающий trigger и dead component до появления реального use case.

## 10. Responsive и platform UX

### 10.1 Сильные стороны

- mobile-first layout;
- Telegram viewport CSS variables;
- safe-area support;
- fullscreen adjustments;
- bottom nav скрывается при работе с keyboard;
- vertical swipes Telegram отключаются осознанно;
- Telegram back button управляется отдельным navigator layer;
- expensive blur/noise отключаются на mobile;
- есть fallback для старых WebView;
- публичный Login не имеет horizontal scroll на 320 px.

Ссылки: `src/main.tsx:49-109`, `src/styles/globals.css:1175-1186`, `src/components/layout/AppShell/AppShell.tsx:75-114`.

### 10.2 Browser-проверка Login

Проверены 1740x1123, 375x812 и 320x568.

Наблюдения:

- desktop form ограничена 448 px и визуально сфокусирована;
- на 375 px form сохраняет нормальные поля и 44 px primary action;
- на 320 px горизонтального переполнения нет;
- при низкой высоте страница корректно становится вертикально прокручиваемой;
- legal links переносятся на две строки;
- language menu помещается в viewport;
- language trigger имеет высоту около 38 px, пункты menu около 40 px, то есть ниже рекомендуемых 44 px для touch;
- Login использует текущую system/light theme и semantic runtime colors;
- локальное окружение показало ошибку Telegram widget domain, это ограничение mock/dev domain, а не подтвержденный production UX-дефект.

### 10.3 Основные responsive-риски

- desktop header на промежуточных ширинах;
- admin tables и editors внутри `max-w-6xl`;
- fixed overlays внутри contained main;
- длинные RU/FA/ZH labels;
- RTL в сложных tables/editors;
- 320 px с открытым keyboard;
- Telegram iOS/Android fullscreen и back behavior;
- bottom nav + dialog/sheet stacking;
- touch targets локальных icon actions и compact admin controls.

## 11. Accessibility

### 11.1 Что уже сделано хорошо

- глобальный reduced motion;
- focus-visible styles;
- базовые touch target helpers;
- visible labels на Login;
- `role="alert"` в части error states;
- runtime contrast protection для customizable colors;
- `lang` и `dir` синхронизируются в `src/i18n.ts:68-73`;
- safe-area и dynamic viewport height;
- Radix foundation для части primitives;
- Spinner имеет status semantics;
- Onboarding использует focus trap и Escape;
- часть overlays использует portal и dialog semantics;
- decorative elements часто скрыты через `aria-hidden`.

### 11.2 Критичные gaps

1. Zoom запрещен через `maximum-scale=1.0, user-scalable=no` (`index.html:9-12`). Это ухудшает доступность для слабовидящих пользователей.
2. Interactive Card недоступен с клавиатуры (`Card.tsx:97-110`).
3. Пять Switch в Profile не имеют accessible name (`Profile.tsx:623-755`).
4. Mobile drawer не управляет фокусом и не объявляет себя корректно.
5. Active navigation не использует `aria-current`.
6. Ручные dialogs имеют разный уровень semantics/focus behavior.
7. Icon-only actions не везде имеют accessible label.
8. Table sorting, row navigation и resizing не доступны с клавиатуры.
9. Нет skip link к main content.
10. Нет автоматических axe, keyboard или browser accessibility tests.
11. Form errors часто не связаны с конкретными controls.
12. Часть текста имеет размер 9-10 px и слабую иерархию supporting content.

### 11.3 Приоритет accessibility

Accessibility здесь нельзя оставлять на конец визуального редизайна. Если новые components будут построены поверх текущих несемантических APIs, исправление каждого экрана станет дорогим. Сначала должны появиться правильные Button, LinkCard, Field, Dialog, Sheet, Switch и DataTable contracts.

## 12. UX-состояния

Проект содержит много реальных состояний:

- initial loading;
- skeleton loading;
- mutation progress;
- success/failure;
- no subscription;
- trial available/unavailable;
- active/limited/expired subscription;
- insufficient balance;
- payment pending/success/failure;
- empty data;
- permission denial;
- maintenance, blacklist, deleted account, unavailable backend;
- onboarding;
- feature disabled;
- Telegram/web capability differences.

Это сильная продуктовая база. Редизайн должен документировать state matrix для каждого pattern, иначе новые happy-path макеты потеряют важные production-состояния.

Особенно важно сохранить blocking screens и transactional recovery paths, а не заменить их общим generic error screen.

## 13. Internationalization

В репозитории есть locale files:

- Russian;
- English;
- Persian;
- Chinese.

Локальное runtime-окружение возвращало Russian и English как enabled languages. Код поддерживает RTL и меняет `dir` централизованно.

Риски для редизайна:

- компактная desktop pill navigation;
- fixed widths в controls;
- uppercase labels;
- 10 px captions;
- таблицы и drag/drop editors;
- визуальные arrows/chevrons, которые могут требовать mirroring;
- line-clamp/truncate в admin cards;
- смешение localized strings и hardcoded English fallback/title.

Каждый новый component должен проверяться минимум на RU, EN и RTL pseudo-case, даже если production временно включает только два языка.

## 14. Performance и perceived performance

Сильные решения:

- lazy loading почти всех routes;
- Dashboard загружается eagerly как LCP-critical;
- chunk retry после deploy;
- React Query caching;
- skeletons;
- отключение blur/noise на mobile;
- BackgroundHost не remount при navigation;
- logo preload;
- stable Telegram viewport handling.

Риски:

- много animation/effect systems;
- remote Google Fonts;
- большие монолитные page components, например Login и сложные admin pages;
- потенциально дорогие tables/graphs/editors;
- `contain: content` добавлен как performance mechanism, но конфликтует с overlays;
- отсутствие visual regression и browser performance gates.

Редизайн не должен ухудшать текущую pragmatic mobile optimization. Glass и blur следует применять только там, где они дают заметную ценность.

## 15. Тестируемость UI

Текущие tests в основном покрывают utils, stores и locale consistency. `vitest.config.ts` использует Node environment. В зависимостях нет Testing Library, jsdom/happy-dom, axe, Playwright или Cypress.

Автоматически не проверяются:

- keyboard navigation;
- focus trap и focus return;
- accessible names;
- responsive layouts;
- route transitions;
- dialog stacking;
- Telegram/web differences;
- RTL;
- visual regressions;
- operator palette contrast.

До массовой миграции экранов стоит добавить небольшой UI gate, иначе редизайн будет проверяться только вручную.

## 16. Главные выводы

### Сильные стороны, которые стоит сохранить

- mobile-first и Telegram-aware foundation;
- ясный фокус Dashboard на subscription state;
- configurable branding и runtime palettes;
- dark/light support;
- contrast-aware color generation;
- feature flags;
- mature set продуктовых states;
- lazy routes и perceived performance;
- bottom navigation с приоритетом Support;
- safe-area, viewport и haptic integration;
- Radix UI уже присутствует в проекте;
- локализация и RTL foundation.

### Что мешает целостности

- один shell обслуживает слишком разные user и admin products;
- несколько параллельных card/button/dialog/sheet systems;
- visual tokens не являются semantic tokens;
- raw controls доминируют над primitives;
- admin density и navigation не оформлены как отдельная система;
- theme architecture частично дублируется;
- большое число hardcoded colors/sizes/effects;
- accessibility зависит от конкретной страницы, а не гарантируется components;
- нет UI test layer.

### Главный продуктовый риск редизайна

Самая опасная стратегия: сначала нарисовать новые отдельные экраны, затем вручную переносить их в 100+ routes. Это даст красивый Dashboard, но сохранит или усилит расхождения на forms, tables, dialogs и edge states.

Правильная стратегия: сначала определить foundations и canonical components, затем собрать 3-4 representative vertical slices и только после этого масштабировать систему.

## 17. Приоритеты проблем

### P0: проверить до визуального редизайна

- `main { contain: content; }` против non-portal fixed overlays;
- запрет browser zoom;
- интерактивные `div` Cards;
- unnamed Switch controls;
- mobile drawer focus/keyboard behavior;
- destructive actions, где остался native `confirm()` в Telegram WebView.

### P1: исправить в foundation-этапе

- canonical Dialog/Sheet;
- semantic color tokens;
- canonical Card/Button/Field/Select/Switch;
- `aria-current` navigation;
- icon-only button labels;
- accessible loading states;
- admin DataTable pattern;
- user/admin shell separation;
- type and density scales;
- Command Palette decision.

### P2: исправить при миграции vertical slices

- hardcoded local colors;
- inconsistent radii/shadows;
- duplicate spinners/skeletons;
- page-local badges and empty states;
- small captions;
- inconsistent section headers and action placement;
- mobile form action behavior;
- RTL edge cases.

### P3: polish после стабилизации

- advanced motion language;
- configurable decorative backgrounds;
- refined chart palette;
- deeper user appearance preferences;
- command palette enhancements;
- visual transitions between transactional steps.

## 18. Рекомендуемая архитектура будущей дизайн-системы

### Foundation

- semantic colors;
- typography roles;
- spacing scale;
- radius scale;
- elevation scale;
- motion durations/easings;
- breakpoints and container widths;
- z-index layers;
- touch/density rules;
- icon rules.

### Core primitives

- Button/IconButton;
- Link and LinkCard;
- Surface/Card;
- Field/Input/Textarea;
- Select/Combobox;
- Checkbox/Switch/Radio;
- Badge/Status;
- Tooltip/Popover/Dropdown;
- Dialog/AlertDialog/Sheet;
- Tabs/SegmentedControl;
- Spinner/Skeleton/Progress;
- Toast/InlineAlert/EmptyState.

### Product patterns

- SubscriptionStatusCard;
- PlanCard;
- PaymentMethodCard;
- ConnectionStep;
- Balance/TransactionSummary;
- Promo/Gift/Trial banner;
- SettingsRow;
- AdminDataTable;
- AdminFormSection;
- FilterToolbar;
- MetricCard/ChartCard;
- destructive action flow;
- blocking/recovery screen.

### Shells

- PublicTransactionalShell;
- UserCabinetShell;
- AdminConsoleShell;
- Telegram-specific adapters, а не отдельный независимый visual system.

## 19. Рекомендуемые representative slices

### Slice 1: Login / Registration

Проверяет:

- public shell;
- branding;
- form fields;
- validation;
- OAuth/Telegram/email hierarchy;
- legal consent;
- light/dark;
- mobile 320 px;
- localization.

### Slice 2: Dashboard / Subscription

Проверяет:

- user shell;
- status semantics;
- cards;
- primary actions;
- skeletons;
- trial/no subscription/expired states;
- gamification и promotional content;
- bottom navigation.

### Slice 3: Balance / Top-up

Проверяет:

- transactional flow;
- selectable cards;
- payment methods;
- progress/result states;
- destructive and recovery paths;
- web/Telegram external navigation.

### Slice 4: Admin Users или Traffic Usage

Проверяет:

- admin shell;
- high density;
- search/filter;
- DataTable;
- sorting/resizing/pagination;
- row actions;
- responsive fallback;
- permissions.

После успешной проверки этих slices можно масштабировать систему на остальные routes.

## 20. План редизайна

### Этап 0. Product alignment

- определить главные аудитории и brand attributes;
- выбрать primary conversion и retention scenarios;
- решить, насколько operator branding может менять форму, а не только цвет;
- определить обязательные Telegram constraints;
- зафиксировать supported languages, devices и browser matrix.

### Этап 1. UX foundation

- карта IA и critical journeys;
- user/admin shell decision;
- state inventory;
- accessibility baseline;
- content hierarchy и terminology;
- responsive strategy.

### Этап 2. Visual foundation

- semantic tokens;
- typography;
- spacing/radius/elevation;
- light/dark behavior;
- iconography;
- motion principles;
- data visualization colors.

### Этап 3. Canonical components

- Button, LinkCard, Field, Dialog, Sheet, Switch, Select, DataTable;
- documentation и examples;
- keyboard/accessibility tests;
- visual states.

### Этап 4. Representative slices

- Login;
- Dashboard/Subscription;
- Balance/Top-up;
- Admin Users/Traffic.

### Этап 5. Массовая миграция

- route groups, а не случайные отдельные pages;
- user flows сначала, admin domains затем;
- удаление старых primitives только после инвентаризации уникального поведения;
- visual regression и browser smoke tests на каждом batch.

### Этап 6. Polish

- motion;
- decorative backgrounds;
- chart refinements;
- advanced appearance preferences;
- performance tuning;
- cleanup dead components/styles.

## 21. Definition of Done для будущих экранов

Каждый новый или мигрированный экран должен:

- использовать semantic tokens;
- использовать canonical components;
- работать в dark и light themes;
- работать на 320, 375, 768, 1024, 1280+ px;
- не иметь horizontal overflow без явной data-table причины;
- поддерживать keyboard-only navigation;
- иметь видимый focus;
- иметь accessible names и правильные landmarks;
- не запрещать browser zoom;
- учитывать reduced motion;
- учитывать loading, empty, error, success и disabled states;
- учитывать RU/EN и RTL expansion;
- учитывать Telegram safe area, keyboard и back behavior;
- не использовать raw fixed overlay без canonical portal;
- проходить type-check, build, unit/component tests и browser smoke gate.

## 22. Вопросы перед началом визуального редизайна

1. Какое публичное позиционирование и характер бренда должен выражать Custom Cabinet?
2. Что важнее для первой версии: пользовательский кабинет или admin-консоль?
3. Должен ли operator полностью менять palette, или будущий бренд должен иметь более жесткие visual constraints?
4. Нужна ли champagne light theme как часть идентичности, или допустима новая нейтральная light theme?
5. Какие языки реально поддерживаются в production, включая Persian/RTL?
6. Какие минимальные устройства и Telegram clients обязательны?
7. Нужны ли contests, polls, wheel и gifts в основном brand language или как отдельная playful layer?
8. Нужна ли глобальная Command Palette пользователю, администратору или только admin search?
9. Какие product metrics должны улучшиться после редизайна: activation, purchase, renewal, connection success, support deflection?
10. Можно ли разделить UserCabinetShell и AdminConsoleShell на уровне layout без ограничения upstream compatibility?

## 23. Итоговая оценка

Текущий Custom Cabinet функционально зрелый и имеет сильную platform-aware основу. В проекте уже решены многие сложные задачи: Telegram SDK, safe areas, themes, operator colors, localization, feature flags, transactional states и большой admin domain.

Текущая слабость находится не в отдельных цветах или «устаревшем виде», а в отсутствии одного обязательного слоя дизайн-системы между foundations и страницами. Из-за этого качественные решения соседствуют с ручными controls, несколькими card/dialog systems и accessibility gaps.

Редизайн имеет хороший потенциал, если начать с архитектуры интерфейса. Наиболее ценное направление: сохранить зрелую продуктовую логику, Telegram-aware поведение и runtime branding, но заменить параллельные визуальные реализации одной semantic, accessible и тестируемой системой с отдельными user и admin layouts.
