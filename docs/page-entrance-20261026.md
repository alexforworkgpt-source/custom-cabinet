# Появление главной и страниц подписок — 2026-10-26

## Изменение

`components/motion/PageEntrance` переиспользует `staggerContainer` / `staggerItem`
из профиля: opacity0→1, y8→0, интервал50ms. `PageEntranceItem` отмечает крупные
готовые разделы, а не каждый элемент формы. Новых CSS-классов, палитр,
зависимостей и глобального перехвата навигации нет.

Подключены Dashboard, SubscriptionPage/Subscription, Subscriptions,
SubscriptionPurchase и RenewSubscription. Заголовок доступен при загрузке;
скелетоны сохраняются отдельно от готовых разделов. Обновление данных не меняет
ключи анимации и не пересоздаёт разделы. Скрытый CTA суточного тарифа возвращает
null до анимированной обёртки, сохраняя отсутствие лишнего отступа.

При системном `prefers-reduced-motion: reduce` новые разделы сразу видны.
Существующие внутренние эффекты и их владельцы сохранены. Этот scope не меняет
историческую обработку reduced motion на остальных страницах.

Запросы, ключи кэша, цены, права, платежные действия, маршруты и платформенные
интеграции не изменялись. Незакоммиченные правки владельца сохранены.

## Проверки

- Финальный `npm run build`: PASS, включая оба TypeScript-проекта.
- Biome по8 затронутым TSX-файлам и `git diff --check`: PASS.
- Chromium153, готовый `dist/`:60 сценариев PASS. Пять маршрутов ×12 наборов
  параметров; ширины320/375/768/1024/1280, light/dark, RU/EN/FA (RTL),
  изменённая операторская палитра, reduced motion на375/1280.
  Для каждой страницы задерживались обязательные данные; затем настоящий
  reconnect запускал новые запросы React Query. Повторных появлений нет,
  JS errors0, неожиданных API0, горизонтального переполнения0.
- Четыре мобильных снимка Dashboard/management в light/dark просмотрены.
- Клавиатура375/1280: PASS. Tab до навигации и устройств, видимый focus ring,
  Enter для перехода/открытия, Escape и возврат фокуса на исходную ссылку.
- Существующие browser suites на320/1280:152PASS/0FAIL/0SKIP/0retries.
  Management/loading, mobile density, sales loading, compact period cards и
  Dashboard refresh проверены без изменения существующих assertions/timeouts.
- Первый `npm test`:1163PASS/3FAIL. Повтор двух проблемных файлов:
  loadingStates48PASS, adminBroadcastCreateAudience3PASS/2FAIL.
- Полный повтор `npm test -- --maxWorkers=1`:1165PASS/1FAIL. Остался timeout5000ms
  в `adminBroadcastCreateAudience.test.tsx`, сценарий
  `keeps the accepted Telegram job identifiable and retries only Email after a partial failure`.
  Административный исходник и тест не изменялись; эта область ранее отмечена
  в CONTEXT.md как нестабильная. Общий unit gate остаётся **NOT_PASS**.
  Assertions, таймауты и конфигурация проекта не ослаблялись.
- Изолированный повтор оставшегося сценария:1PASS/4filteredSKIP при прежнем
  timeout5000ms. Это подтверждает успешное отдельное выполнение, но не заменяет
  итог полного прогона выше.

Локальные probes и логи: `.scratch/page-entrance-20261026/`,
`.scratch/page-entrance-*-20261026.log` и
`.scratch/page-entrance-verify-20261026.mts`.
Реальный backend/платежи/production не подключались. Проверка выполнялась в web
Chromium; физический Telegram/Android/iOS не проверялся.

Manifest готового `dist/`: `.scratch/page-entrance-20261026/artifact.sha256`,
SHA256 `a6f759c5bff072b1b6cdcace25bc04a0b9f20ae7bae062a77fb66fac84bc6f0b`.

## Дополнение: появление рекламной карусели

После визуальной проверки владельцем обнаружен пропуск: внутренний слайд имел
CSS fade, но весь DashboardPromoCarousel не участвовал в общем появлении.
Готовый контейнер теперь использует `motion.section` и существующий `staggerItem`.
Семантика section, DOM-структура, скелетон и null при отсутствии слайдов сохранены;
новых классов и настроек движения нет. Режим reduced motion наследуется от
PageEntrance, смена слайдов не пересоздаёт контейнер и не повторяет его вход.

Новый `dashboard-promo-entrance.spec.ts` сначала воспроизвёл отсутствие движения
всего баннера при удержании данных аккаунта (RED), затем прошёл после правки.
Проверяется opacity/y внешнего контейнера и его предков, поэтому внутренние
анимации слайда и иллюстрации не могут подменить проверку появления баннера.

- Development:20 promo/entrance browser checks PASS.
- Финальный artifact:50PASS/0FAIL/0SKIP/0retries на320/375/768/1024/1280.
  Проверены позднее появление, отсутствие повторного входа при смене слайдов,
  reduced motion, прежние приоритеты/ссылки, autoplay и pause.
- Build/оба TypeScript, focused Biome и diff check PASS.
- Полный unit run:1167PASS/182 файла, `npm test -- --maxWorkers=1`.

Evidence: `.scratch/promo-entrance-20261026/`; manifest нового dist —
`artifact.sha256`, SHA256
`b8561f260d4f6ed5b78d05c8127508bf6ce3ca0d6652fa9e9c08016ed6332c4f`.
Предыдущие результаты и hashes выше относятся к исходному снимку, а не к этому
дополнению. Production и физические Telegram/Android/iOS не проверялись.
