# Контекстные скидочные действия Custom Cabinet — 2026-10-21

Статус: **IMPLEMENTED_LOCALLY_AND_VERIFIED**. Владелец разрешил продолжить
реализацию матрицы из [аудита 2026-10-20](discount-banners-audit-20261020.md).
Точка сравнения — локальный UI после изменения порядка управления, artifact
`1652266402acdd542ed9cf5e6111e23e0b8034c37260215cf78bca8238a8e8b7`.

## 1. Действие баннера

`Dashboard` передаёт явно выбранный ID, owned список и полную подписку.
`discountAction.ts` выбирает существующий flow; `useDiscountAction` перед переходом
перечитывает active discount, owned список, при необходимости полную подписку
и sales mode. Все эти запросы — GET. Ошибка, смена выбора/аккаунта или исчезновение
подписки не разрешают переход по старым данным; повторный клик блокируется.

| Подтверждённый контекст | Назначение |
| --- | --- |
| Нет подписок | `/subscription/purchase`, «Выбрать тариф» |
| Trial либо `requires_tariff_selection` | Существующий purchase с `subscriptionId` |
| Обычная paid active/expired, поддержанное продление | `/subscriptions/:id/renew`, «Продлить подписку» |
| Несколько, явно выбран owned ID | Действие именно для этого ID |
| Несколько без явного выбора либо выбранный ID больше не принадлежит списку | `/subscriptions`, «Выбрать подписку» |
| Daily/limited/неподдержанный статус | Управление `/subscriptions/:id` |
| Loading/error | Загрузка/повтор, без предположения об отсутствии подписки |

`canRenewSubscription` переиспользуется существующим `PurchaseCTAButton` и новым
resolver. Отсутствие `tariff_id` само по себе не доказывает classic mode. Trial
при других платных подписках сохраняет account-wide classic guard.

Claim по-прежнему отдельно активирует предложение и остаётся на Dashboard.
`test_access` не выдаётся за процентную скидку и не запускает покупку. Отключение
по явному подтверждению сохраняет source-specific API: `promocode:` — dedicated
POST deactivate-discount; offer/admin — DELETE active-discount.

## 2. Актуальность и подписи

- `invalidatePromoState` после успешного промокода, claim и отключения помечает
  устаревшими существующие кеши скидки, группы, подписок и ценовых GET. Это устраняет
  ожидание старого 30-секундного active-discount кеша при возврате с Balance.
- `promoExpiry` использует прежнюю UTC-конвенцию API и проверяет срок при показе
  и непосредственно перед действием. `usePromoAvailability` обновляет время на
  смонтированной секции, скрывает истёкшие offers и один раз перечитывает данные
  для каждого истёкшего benefit/account/deadline. Автоматического clear/deactivate нет.
- Stale active payload с истёкшим сроком показывает нейтральное «Скидка больше
  недоступна. Обновите предложения» с повтором и отдельным явным отключением.
- `usePromoDiscount` и общий помощник исключают истёкший account процент. Ранее
  существовавшая групповая цена и правила округления сохранены. Открытый каталог
  перестаёт показывать истёкший процент без перезагрузки.
- В RU/EN/FA/ZH групповая ссылка получила нейтральное «Условия вашей группы»;
  неизвестный offer без процента больше не обещает скидку.

Account banner не доказывает одинаковую скидку для renewal/add-ons/gift. Renewal
показывает серверную цену без повторного вычитания account процента; устройства,
трафик, подарки и public landing сохраняют свои quote/config и контексты.
Upstream Bot и его API/бизнес-логика/миграции не менялись.

## 3. Проверки

Совместимые Node24.15.0/npm11.12.1, локальные API mocks, compiled Vite preview,
pinned Chromium153. Денежных действий на настоящем API нет.

| Проверка | Результат |
| --- | --- |
| Полный unit suite, финальный повтор | **1161 PASS / 0 FAIL** |
| Build с обоими TypeScript projects | **PASS** |
| Biome check | **PASS**, 952 файла; 40 прежних warnings / 5 infos |
| Affected compiled browser gate | **821 PASS / 5 configured SKIP / 0 FAIL / 0 flaky**, 4 workers, без retries |
| Дополнительные banner captures | **32 PASS**, active/expired × light/dark × RU/EN/FA/ZH × 320/1280 |
| Git diff whitespace check | **PASS** |

Новые browser cases проверяют пустой аккаунт, trial, classic active/expired,
periodic tariff, legacy, daily/limited, несколько записей, явный и неверный ID,
удаление записи, изменение выбора во время GET, double click, ошибки списка/mode,
retry, отзыв скидки до клика, claim discount/test_access, отключение по source,
истечение открытого баннера/каталога и запрет claim после срока.
Общая матрица также включает прежние management/loading/overview/renewal/payment/
preview/navigation/return проверки на пяти ширинах 320–1280.

Просмотрены отдельные RU/FA/ZH captures; горизонтального overflow и сырых новых
translation keys в 32 capture cases нет. Использованы fallback fonts; это не
проверка загрузки внешних Google Fonts и не обещание проверки всех реальных устройств.
Первый capture при автоматическом центрировании попадал под fixed navigation;
повтор снимает тот же banner после явного выравнивания прокрутки к началу.

### Исторические неуспешные запуски

- TDD route/cache/expiry и expired-price RED сохранены. Последующий focused GREEN
  не подменяет финальный gate.
- Первый full unit: 1158 PASS / 3 FAIL в admin audience/loadingStates. Отдельный
  повтор этих двух файлов: 53 PASS. Финальный полный повтор: 1161 PASS; код этих
  страниц, таймауты и число unit workers не менялись. Исправление причин прежних
  нестабильных тестов не заявлено.
- Первый широкий browser остановлен лимитом времени внешней команды, без PASS.
  Следующий: 810 PASS / 5 SKIP / 11 FAIL — три старых сценария искали удалённый
  владельцем web Back. Тесты теперь используют browser Back, а navigation case
  сначала действительно открывает management с Dashboard, создавая историю.
  Проверки конечного адреса/содержимого не ослаблялись; production UI не возвращался.
- Эти результаты сохранены отдельно от финального 821/5/0.

## 4. Точная сборка и локальные записи

286 compiled files:

- artifact manifest SHA256:
  `5acf17d4770b8acc0bba52230b70595cac3cd03be33cb53b67b7ec9bf904cf35`;
- source/test manifest SHA256:
  `9bb6361076212c12be298d20e1c762776a44bb8650c9d2b59d0f0f26cca4f270`.

До и после финального browser gate обе identities совпали. Локальные receipts:
`.scratch/discount-actions-20261021/`, в частности `artifact-verified.json`,
`unit-repeat.json`, `browser-verified.json`, `browser-visual-aligned.json`,
`build-final.log`, `biome-reviewed.log`. Scratch configs/captures — локальные
вспомогательные материалы; их не публиковать как runtime source.

Это frontend-local proof. Release Bundle/production требуют отдельного разрешения;
существующие historical OPEN/BLOCKED и SKIPPED_OWNER_ACCEPTED сохраняют свой scope.

Рекомендуемый уровень рассуждения для следующей задачи: средний — функциональная матрица проверена, дальнейшие локальные UI-уточнения можно выполнять точечно.
