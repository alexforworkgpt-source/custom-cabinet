# Аудит анимаций Custom Cabinet — 2026-10-27

## Точка сравнения и метод

Исследована локальная рабочая копия Custom Cabinet с HEAD `0d04a822`, включая
незакоммиченные изменения владельца и завершённые правки26 октября. HEAD не
является снимком исследованного дерева. Предыдущий proof рекламного контейнера —
`docs/page-entrance-20261026.md`; он не заменяет настоящий аудит.

`App.tsx`:138 маршрутов,115 уникальных компонентов страниц. Карта route → page,
SHA256 страниц, основные return и motion-элементы сохранены в локальных
`.scratch/animation-audit-20261027/route-inventory.{json,md}`. Это статическая карта,
не115 browser PASS. `ProtectedRoute`/`PermissionRoute` → Layout → AppShell → main
не добавляют общего входа содержимому. LazyPage отвечает за ожидание/error boundary.
Public/transactional routes могут работать без Layout.

Покадровый browser probe измеряет opacity/transform внешнего видимого элемента
и предков. Движение иконки, слайда, текста или дочерней карточки не считается
движением внешнего контейнера. Отдельно учитываются CSS `bentoFadeIn`, Tailwind
`animate-fade-in`, Framer Motion variants, переходы состояния и hover.

## Подтверждённые результаты до исправлений

Chromium153, локальный Vite5173, fixtures существующего `cabinetTestHarness`,
375×812 и1280×800, EN, без настоящего API/платежей. Основной observation run:
34 сценария завершены; PASS означает успешное измерение, а не отсутствие дефектов.
После уточнения probe исключены `visibility:hidden` копии skeleton и отделена
фаза ухода на Profile:14 дополнительных измерений PASS. Ранние ошибки самого
probe (скрытая mobile nav, недостающие withdrawal fixtures, промежуточный H1)
не являются дефектами приложения; логи сохранены.

| Область | Факт до исправления |
| --- | --- |
| Dashboard: активная скидка / доступные предложения | Внешние готовые Card появляются без fade/подъёма при первом входе, поздних ответах и возврате |
| Dashboard: ReminderCards | Готовый контейнер и карточки статичны при тех же переходах |
| Dashboard: выбор нескольких подписок | Label целиком статичен; PageEntrance без variants на потомке недостаточен |
| Dashboard: NewsSection | Статичен внешний фон section; header/article имеют собственный24px/0.6s вход |
| Dashboard: поздний TrialOfferCard | После завершённого входа покупки trial появляется сразу; покупка правильно остаётся на месте |
| Purchase/renewal: PurchaseContextBanners | Готовые group/trial-upgrade баннеры статичны; соседний каталог/условия входят. Невидимая копия в skeleton не является готовым баннером |
| Contests/Polls | Статичны готовый список и заголовок; спиннер и игровое окно не доказывают вход списка |
| Referral | Статичны H1 и stats; старые bento-блоки ниже уже имеют CSS-вход |
| Info / InfoPageView | Статичны заголовок/навигация и самостоятельная статья; built-in документы/FAQ в Info имеют bentoFadeIn |
| Reduced motion | PendingGiftCard, новости, Profile, Notifications, ConnectedAccounts, SavedCards, Instructions продолжают JS-подъём при reduce; в Dashboard общий PageEntrance и рекламный контейнер уже корректны |

Нулевые motion/fade samples в150 кадрах для пропущенных контейнеров сопоставлены
с положительными контролями: рекламный контейнер8px, news header24px и wheel16px.
На возврате проверена настоящая SPA-навигация и browser back, без пересоздания
приложения. Reconnect у готового Dashboard не повторяет вход его контейнеров.

### Снятые подозрения

- Fortune Wheel banner **уже анимируется целиком** через `bento-card-hover` →
  `.bento-card` → `bentoFadeIn`16px/0.5s. Reduced motion выключает этот CSS-вход.
- PendingGiftCard **имеет вход каждой полной карточки** сверху на10px. Его
  проблема относится к reduced motion, не к отсутствию входа.
- DashboardPromoCarousel имеет подтверждённый полный вход, отдельный внутренний
  fade слайдов и защиту от повторного входа при смене слайда.
- Статический Card реализован через motion.div, но без initial/variants сам
  входа не создаёт. Старый `.bento-card`, напротив, уже содержит CSS-анимацию.

## Карта остальных маршрутов и границы

Ниже указаны владельцы по исходникам исходного снимка до исправлений, не полная
browser-приёмка каждого return. Выполненные изменения перечислены в финале отчёта.

| Страницы / семейства | Владелец и состояния |
| --- | --- |
| Dashboard, Subscriptions, SubscriptionPage/Subscription, SubscriptionPurchase, RenewSubscription | PageEntrance/staggerItem; skeleton/error/empty проверены по композиции. Условные исключения перечислены выше |
| Profile, ProfileNotifications, ConnectedAccounts, SavedCards | staggerContainer/items; последние две страницы меняют key loading→ready, поэтому header входит повторно при завершении первичной загрузки. Это существующее восстановление ready-дерева, не refetch/remount loop |
| Support | Основной режим stagger; внешний support/disabled режим отдельный статический return |
| Instructions, InstructionArticle | stagger страниц/секций; article not-found статичен, accordion имеет отдельный reduced-motion guard |
| Wheel | Ready-root CSS fade; loading/error/disabled отдельные статичные экраны; spin/history — отдельные взаимодействия |
| GiftSubscription | Header, tab bar и tabpanel имеют собственный вход; loading/error/disabled — отдельные returns |
| GiftResult, PurchaseSuccess, TopUpResult | Состояния результата/ожидания анимируют содержимое scale/fade внутри статичной оболочки; это смена статуса, не пропущенный Dashboard-баннер |
| QuickPurchase | Header, форма и summary имеют собственные20px/0.5s входы; loading/error статичны |
| GiftClaim | Готовое предложение и success scale/fade; not-found/already-claimed/failed/pending статичны |
| CouponStatus | Статичные loading/not-found/ready/success; animated checkmark относится к значку успеха |
| MergeAccounts | Собственные stagger loading/error/expired/ready |
| ConnectionQR, ReferralPartnerApply, ReferralWithdrawalRequest | CSS animate-fade-in внешнего ready-root |
| Login, VerifyEmail, ResetPassword, PublicLegal | Статичные формы/документы/статусы; spinners не являются entrance. Не вводится новое требование декоративного входа для этих public screens |
| TelegramCallback, TelegramRedirect, DeepLinkRedirect, OAuthCallback, LinkTelegramCallback, AutoLogin | Технические redirects/consent/error/loading; собственные spinners/pulse, общий entrance не требуется |
| Legacy subscription routes, catch-all | Navigate, визуальный вход принадлежит целевой странице |

### Административная консоль

По исходникам собственный CSS root fade имеют:
AdminApplicationReview, AdminAuditLog, AdminBanSystem, AdminBroadcastDetail,
AdminBulkActions, AdminCampaignEdit/Stats/Campaigns, AdminCouponCreate/Detail/Coupons,
AdminDashboard, AdminGraceAccess, AdminLandingEditor/Stats/Landings,
AdminPartnerCampaignAssign/Commission/Detail/Revoke/Settings/Partners,
AdminPayments, AdminPolicies/PolicyEdit, AdminPromoGroups, AdminPromoOfferSend,
AdminPromoOfferTemplateEdit/PromoOffers, AdminPromocodeStats/Promocodes,
AdminReferralLevels, AdminRemnawave/SquadDetail, AdminRoleAssign/Edit/Roles,
AdminSalesStats, AdminServerEdit/Servers, AdminSystemErrors, AdminTariffs,
AdminTicketSettings, AdminTrafficUsage, AdminUpdates, AdminUserDetail/Users,
AdminWithdrawalDetail/Reject/Withdrawals. У ряда страниц loading/error возвращаются
до ready-root и остаются статичными.

AdminPanel использует отдельный CSS admin вход плиток. В AdminTickets,
AdminWheel, AdminPaymentMethods/MethodEdit, AdminEmailTemplates, AdminNewsCreate,
AdminInfoPageEditor локальные эффекты не доказывают вход всей страницы.
AdminSettings, AdminApps, AdminTariffCreate, AdminBroadcasts/Create,
AdminPromocodeCreate, AdminPromoGroupCreate, AdminCampaignCreate,
ReferralNetwork, AdminPinnedMessages/Create, AdminReminders/ReminderEdit,
AdminChannelSubscriptions, AdminNews, AdminInfoPages, AdminLegalPages не имеют
явного общего page entrance. Вложенные bento/components могут иметь свои эффекты.
Это карта существующего поведения, не требование анимировать все таблицы/редакторы.
Отдельный browser-аудит всех административных состояний не выполнялся.

## Решение по продолжению

После аудита владелец разрешил сразу исправить подтверждённые проблемы через TDD,
без ожидания дополнительных ответов. Шов проверки — существующий browser seam:
полный видимый контейнер/его предки, реальные route transitions, fixtures API,
late response и системный reduced motion. Изменения поведения API не требуются.

План исправления: вход отсутствующих готовых пользовательских блоков на прежних
токенах; сохранение CSS-владельцев wheel/bento и внутренних news effects;
общая политика reduced motion для JS-transform/layout; отдельные regression
проверки позднего trial и purchase context. Результаты исправлений/gates добавляются
ниже только после фактического выполнения.

Evidence: `.scratch/animation-audit-20261027/`: `browser-audit.log`,
`visible-owner-audit.log`, probes/configs, JSON samples в results.
Production, Release Bundle, физический Telegram/Android/iOS не проверялись.

## Исправления и TDD — завершено

1. **Dashboard:** variants существующего `staggerItem` добавлены на реальные
   Card активной/истёкшей скидки, каждого предложения и каждого напоминания,
   на semantic label выбора подписки и на внешний semantic section новостей.
   Пустые returns не создают новых обёрток/отступов. Старый вход wheel сохранён.
2. **Trial:** готовая TrialOfferCard получает собственный вход. Покупка имеет
   независимый PageEntranceItem. RED-тест отдельно выявил двойной16px подъём при
   быстрой загрузке: после разделения владельцев trial входит один раз на8px,
   при позднем ответе purchase link не двигается и не скрывается.
3. **Покупка/продление:** полный PurchaseContextBanners получает общий вход;
   невидимая копия в skeleton остаётся только резервом геометрии.
4. **Другие пользовательские страницы:** Contests/Polls используют PageEntrance
   для постоянного header и готовых list/empty Card; skeleton не получает входа
   готового списка. InfoNavigation анимирует header/navigation, InfoPageView —
   заголовок и готовый HTML/FAQ, Referral — заголовок и stats. Старые bento-блоки
   в Info/Referral сохраняют своего CSS-владельца, без второго page-wide подъёма.
5. **Reduced motion:** `main.tsx` задаёт `MotionConfig reducedMotion="user"`
   для JS-transform/layout, сохраняя допустимый fade. Profile, Notifications,
   ConnectedAccounts, SavedCards, Instructions переиспользуют PageEntrance с
   initial=false при reduce. Независимые news header/cards/load-more и pending
   gifts тоже явно пропускают initial. Одной общей CSS-защиты было недостаточно;
   одного MotionConfig тоже недостаточно для гарантии отсутствия первого
   смещённого видимого кадра, поэтому подтверждённые входы имеют явный guard.

Новые проверки: `dashboard-section-entrance.spec.ts`,
`animation-conditional-entrance.spec.ts`, `animation-page-entrance.spec.ts`,
`animation-reduced-motion.spec.ts`. Helpers: `entranceProbe.ts`,
`dashboardEntranceFixture.ts`, `informationEntranceFixture.ts`.
Каждая группа исправлялась после фактического RED на полном видимом контейнере.
Логи `red-*.log`/`green-*.log` сохранены. Исходные проверки и таймауты не ослаблены.
Probe исключает невидимые skeleton-копии и не считает движение прозрачных пикселей
видимым движением; исходные RED содержали движение при ненулевой opacity.

### Дополнительная находка финального gate

Первый широкий compiled run:403PASS/3FAIL/11configuredSKIP. Все3FAIL — прежняя
проверка геометрии classic skeleton: разница Y24px при допуске4px. Изолированный
probe воспроизвёл4/4; computed margin между skeleton context и classic body
в раннем кадре был0 вместо24px, при готовом layout —24px. Это frontend-геометрия,
не API/Backend. Инструментирование выполнялось только в ignored `.scratch/`.

В `SubscriptionFlowSkeleton` для non-renewal режима применены существующие
`flex flex-col gap-6` вместо sibling margins `space-y-6`. Готовый интерфейс не
менялся. Существующий тест с теми же assertions/timeout дал30PASS:
classic light/dark ×5ширин ×3повтора. Точная первоначальная причина появления
раннего0px margin отдельно не локализована до browser/React внутренностей;
не утверждается, что это была регрессия именно новой анимации.

### Финальная проверка последнего снимка

- `npm test -- --maxWorkers=1`: **1167PASS,182файла**.
- `npm run build`: **PASS**, включая оба TypeScript-проекта.
- Biome: **27 затронутых TS/TSX PASS**, без оставшихся исправлений.
- Chromium153, настоящий `dist/`, **521PASS/11configuredSKIP/0FAIL/0flaky**,
  retries0,532сценария на320/375/768/1024/1280. Все115новых проверок выполнены,
  без skips. Остальные406 выполненных проверок покрывают promo lifecycle/carousel,
  readiness, Dashboard refresh, management/sales skeleton, profile back,
  information/RTL и выход из gift/top-up.11skips — прежние проверки Info,
  применимые только к мобильной либо только к широкой версии, не новые анимации.
- Новые scenarios явно проверяют отсутствие JS page errors и неожиданных
  fixture API-запросов. У существующих suites остаются сообщения preview proxy
  об analytics `/cabinet/activity/events` к неработающему localhost API;
  это не подключение к настоящему Upstream Bot и не новая browser-ошибка приложения.
- Два готовых Dashboard screenshot375/1280 просмотрены. Это статическая
  проверка итоговой геометрии; само движение доказано покадровыми assertions.

Последний manifest: `.scratch/animation-audit-20261027/final-artifact.sha256`,
286files, SHA256
`1a93230a0d389e2d647dd1b87593d97f7a3e19ee1c0b08ae68a12155195e0a02`.
После gate manifest повторно совпал; исходники/тесты зафиксированы в
`final-source.sha256` (923files, manifest SHA256
`b272443ccbe75b363f7c4fd128d9ab2457a83ceb600b03328c963ff2987ba92d`).
Сверка с исходной route-инвентаризацией: изменены только10 ожидаемых страниц,
остальные105 компонентов страниц совпадают побайтово. Проверка документации PASS;
`git diff --check` PASS. Финальная HTTP-проверка: мокап5173=200,
диагностический preview4173 уже не слушает порт.
Промежуточный manifest `b5ed8803…` относится к сборке до исправления skeleton,
не является итоговым proof. Последние логи: `final-{unit,build,biome,browser}.log`,
JSON reporter сохранён как `final-browser-results.json`; preview4173 управляется Playwright.

Аудит и локальные исправления завершены в указанном scope. Полная статическая
карта не превращается в browser PASS всех115страниц/всех admin/public states.
Работа выполнена поверх owner tree; существующие owner changes сохранены.
Коммитов/публикации/Release/production-операций не было. Мокап5173 оставлен.
