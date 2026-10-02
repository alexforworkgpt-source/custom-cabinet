# ADR 0002: Upstream v1.79/v4.15 адаптируется вертикальными срезами

Status: Accepted
Date: 2026-09-23
PRD: [`UPSTREAM_V1.79.0_ADAPTATION_PRD.md`](../../UPSTREAM_V1.79.0_ADAPTATION_PRD.md)

## Context

Текущий production Release Bundle `v2026.09.21.1` использует:

- Upstream Cabinet `v1.74.0` at
  `57810c7da24b5c142371ed83a6ad5e43a591d454`;
- Custom Cabinet `cabinet-v2026.09.21.1` at
  `aec198424aa0b489db6d07d1af92bd704aa7c518`;
- Upstream Bot `v4.10.0` at
  `9fcebfd7bc075dcca1bb9d1514740039208b906a`;
- Alembic schema `0119`.

Целевые официальные релизы на cutoff-дате:

- Upstream Cabinet `v1.79.0` at
  `821c7b71823573a756de00418acb25118ede1c9c`;
- Upstream Bot `v4.15.0` at
  `877690a7039d1326b2c00eda3e297879b80c0678`;
- Alembic schema `0127`.

Cabinet-диапазон содержит 78 commits и 340 changed paths. Bot-диапазон
содержит 133 commits и 365 changed paths. У 136 Cabinet paths есть одновременно
incoming changes и отличия текущего Custom Cabinet от старого upstream tree.

Custom Cabinet уже архитектурно расходится с Upstream Cabinet:

- `/`, `/subscriptions`, subscription detail, balance и connection собраны
  вокруг одного Unified Dashboard и responsive overlays;
- пользовательская mobile navigation имеет собственный четырёхпунктовый
  контракт;
- layout, primitives, branding и дизайн-токены принадлежат Custom Cabinet;
- ранний `index.html` удаляет quick-purchase `contact` до любого subresource
  request;
- Dashboard loading и Instructions имеют собственные исправления и E2E proof;
- BSCHEKER frontend запрещён ADR 0001.

Upstream `v1.79.0` одновременно добавляет optional Simple/Lite Mode через
отдельные Dashboard/Subscription presentations, reminders, новые admin flows и
platform изменения. Product goal простого вида уже реализован архитектурой
Custom Cabinet. Прямое принятие upstream route/page tree или добавление второго
presentation path восстановит архитектурную сложность, которую Custom Cabinet
намеренно устранил.

Формальная upstream compatibility matrix для пары `v1.79.0` / `v4.15.0` не
найдена. Их совместимость подтверждается соответствующими API-контрактами в
точных source trees и синхронными release notes. Это evidence-based inference,
а не самостоятельное заявление upstream.

## Decision

### 1. Adopt exact upstream identities as one compatibility target

Custom Cabinet принимает contracts и behavior Upstream Cabinet `v1.79.0` и
проверяется только с точным Upstream Bot `v4.15.0` как целевой парой.

Upstream Bot остаётся внешним неизменённым source. Его business logic не
копируется и не переопределяется во frontend. В Release Bundle будет закреплён
его точный SHA после прохождения release gate.

### 2. Use a three-way, vertical-slice adaptation

Каждый срез сравнивает:

1. previous Upstream Cabinet SHA `57810c7…`;
2. target Upstream Cabinet SHA `821c7b7…`;
3. зафиксированный receiving Custom Cabinet commit.

Не допускаются:

- замена Custom Cabinet upstream archive;
- `merge --allow-unrelated-histories` как способ синхронизации;
- массовый cherry-pick release range;
- разрешение hybrid-файла полной версией одной стороны;
- одновременный unrelated redesign или dependency upgrade.

Порядок срезов: provenance → Bot contract/schema → account/grace/date → admin
users → platform/branding → legacy subscriptions → reminders → promo/broadcast
operations → explicit Simple/Lite Mode exclusion → cross-cutting quality →
localization/docs → release.

### 3. Preserve ownership boundaries

Upstream-owned contracts принимаются максимально близко к upstream:

- `src/api/`;
- `src/types/`;
- functional utilities;
- storage keys and feature constants;
- permission and route contracts;
- Telegram/platform adapters;
- locale keys;
- deployment-facing HTML/plugin contracts.

Из этого правила исключены Simple/Lite Mode и BSCHEKER contracts, явно
зафиксированные ниже.

Custom-owned presentation сохраняется:

- design tokens and global theme semantics;
- canonical primitives and ResponsiveOverlay;
- user/admin shells;
- branding foreground and first-paint policy;
- browser acceptance harness.

Route pages и feature components остаются hybrid. В них incoming behavior
портируется concern-by-concern: data loading, mutation, errors, permission,
navigation и state отдельно от JSX и styles.

### 4. Do not integrate upstream Simple/Lite Mode

Custom Cabinet не принимает отдельный upstream Simple/Lite Mode, потому что его
продуктовая цель уже реализована существующими Unified Dashboard, responsive
overlays и четырёхпунктовой mobile navigation. Добавление feature flag и второго
presentation path дублировало бы subscription/payment decisions без новой
подтверждённой ценности.

В Custom Cabinet не добавляются:

- `useLiteMode` и storage key `cabinet-lite-mode`;
- frontend client `/cabinet/branding/lite-mode` и admin toggle;
- `HomeScreen`, `DashboardLite`, `SubscriptionScreen`, `SubscriptionLite` и
  остальные lite-specific components;
- lite-specific route или navigation branching.

В commit ledger как `intentionally skipped` фиксируются
`b247fbfa0ae2151b4ab397c60170e58f3eaa6021`,
`501c9c33cbf8b5aef3a01e993ba9d8a26e167897` и
`e12f3880a31090d103daa74dc812d5ebbe89676a`. Подготовительные refactor commits
`ebe4a57b57dcb8dbf234f09c2d66aa5fa4bae16a` и
`3de515b18366dd0202dad818fcb21a2ae82e76f3` также не переносятся: исследованный
diff не подтверждает в них изменения поведения, необходимые независимо от
lite. Upstream Bot endpoint остаётся частью точного неизменённого Bot
`v4.15.0`, но Custom Cabinet его не вызывает.

В будущих upstream sync каждый lite-related commit проверяется отдельно. Общие
security, API contract, payment, subscription или accessibility fixes должны
быть адаптированы в существующие Custom surfaces. Сам Simple/Lite Mode может
быть пересмотрен только новым owner-approved ADR.

### 5. Merge PWA manifest into the existing privacy-first branding pipeline

`index.html` должен получить Bot manifest URL, но раннее удаление `contact`
остаётся первым исполняемым действием до favicon, manifest, fonts, branding и
других subresources.

Runtime branding:

- сохраняет same-origin Bot manifest;
- не заменяет его `data:` manifest-ом;
- использует frontend manifest fallback, если API находится на другом origin;
- сохраняет Custom monogram contrast semantics;
- принимает upstream edge-color fix для logo tiles;
- добавляет explicit `color-scheme` и Telegram background alignment.

### 6. Centralize legacy subscription decisions

Optional Bot field `requires_tariff_selection` становится источником решения
для Dashboard, subscription list/detail, renew и tariff picker.

Один pure helper `needsTariff` определяет legacy-состояние. UI consumers не
должны независимо повторять это условие и расходиться между существующими
Custom surfaces. Более широкий `tariffAction` refactor из пропускаемого commit
`3de515b1…` не переносится только ради Simple/Lite Mode.

### 7. Keep reminders behind exact Bot permissions and upstream defaults

Новые admin routes используют только:

- `user_reminders:read`;
- `user_reminders:create`;
- `user_reminders:edit`;
- `user_reminders:delete`.

User cards используют authenticated reminder API. Marketing opt-out, quiet
hours, delivery limits и dispatcher concurrency принадлежат Upstream Bot и не
реализуются повторно во frontend.

Миграция `0127` создаёт built-in reminder выключенным. Custom Cabinet не
включает его автоматически. Grace traffic reset также сохраняет upstream
default `false`. Lite-mode endpoint Upstream Bot не имеет frontend consumer в
Custom Cabinet.

### 8. Preserve the BSCHEKER boundary

ADR 0001 остаётся сильнее соседних upstream changes. Никакие reachability
routes, permissions, API clients, requests, polling, locales, fixtures или
assets не переносятся.

Общие admin-users, responsive, icon или performance fixes из mixed commits
могут переноситься только после удаления reachability dependency. Guard test
остаётся release-blocking.

### 9. Treat release as a new full lifecycle proof

Интеграция не меняет production сама по себе. После source gate необходимы:

- committed Custom Cabinet source and artifact;
- exact Bot SHA;
- schema `0127` migration proof from `0119` and fresh database;
- new immutable Custom Cabinet tag;
- new immutable Release Bundle tag;
- full Installer lifecycle gate on the supported target OS;
- targeted browser/Telegram/staging smoke.

Предыдущий lifecycle proof нельзя переиспользовать, потому что Bot SHA,
database schema, Cabinet source и Release Bundle contract меняются.

`UPSTREAM.md` и `COMPATIBILITY.md` обновляются только после успешной source и
compatibility verification. До этого production baseline остаётся `v1.74.0` /
`v4.10.0`.

## Contract Map

| Area | Confirmed target contract | Custom Cabinet seam |
| --- | --- | --- |
| Grace | extra squads endpoint, synced source, allowed services, notifications, traffic reset | Existing grace form logic and Custom fields |
| Accounts | optional `forgets_email`; merge offer for occupied social identity | Existing account-link flow and safe API error boundary |
| Admin users | filters, `sort_order`, `grace_until`, online timestamps, sales mode | Existing admin shell and user-detail permissions |
| Subscription | optional `requires_tariff_selection` | `needsTariff` используется во всех существующих Custom surfaces |
| PWA | same-origin manifest and normal icon URLs | Existing early branding plugin and runtime DocumentBranding |
| Lite mode | public read и admin patch существуют в Upstream Bot | Намеренно не поддерживается; frontend consumer, setting и storage hint отсутствуют |
| Reminders | user active/dismiss; admin CRUD/audience/test; four permissions | Route-level permission guards and Custom admin components |
| Broadcasts | promo-group filters and `user_<id>` email target | Existing broadcast editor and user-card action |
| Promo groups | start/status recalculation | Existing permission store and bounded polling hook |
| Localization | `ru`, `en`, `fa`, `zh` keys | Existing async i18n startup and RTL rules |

## Migration and Compatibility Constraints

1. Alembic must run `0120` through `0127` in order. No migration may be copied
   into Custom Cabinet; they belong to exact Upstream Bot source.
2. Migration `0118` has a formatting-only diff. Its applied schema identity is
   not changed by this target range.
3. `uv.lock` in Bot tag `v4.15.0` reports virtual project version `4.14.0`, while
   `pyproject.toml` and Docker build arg report `4.15.0`. Exact-tag build and
   runtime version reporting must be verified; the tag must not be silently
   patched and still called upstream `v4.15.0`.
4. Frontend dependencies do not change in upstream `v1.74.0..v1.79.0` beyond
   package version metadata. Existing Custom dependency decisions remain.
5. Optional response fields keep upstream-safe fallbacks. This tolerance does
   not authorize release against an unverified mixed Bot/Cabinet pair.

## Consequences

### Positive

- Custom presentation and navigation survive the sync.
- Upstream contract, payment, subscription, platform and accessibility fixes
  remain traceable to exact commits.
- Параллельный Simple/Lite presentation path не создаётся.
- BSCHEKER cannot return through a large mixed diff.
- Each vertical slice can be reviewed, tested and reverted independently before
  release.
- Future sync starts from exact `v1.79.0` provenance instead of an approximate
  visual copy.

### Costs

- Adaptation requires more work than replacing the tree or cherry-picking.
- Admin users и branding затрагивают high-conflict hybrid areas.
- Будущие lite-related upstream commits требуют отдельной классификации общих
  и lite-only изменений.
- Full lifecycle verification is required because backend and schema change.
- A complete commit ledger is still required during implementation; PRD and ADR
  do not replace the final sync report.

### Risks

- Случайный перенос upstream lite pages или setting создаст второй путь queries,
  mutations и payment decisions; commit ledger и regression guard должны это
  предотвращать.
- PWA manifest may violate contact privacy ordering if inserted before the
  current sanitizing script.
- Admin users redesign can expose BSCHEKER-adjacent code if commits are taken
  wholesale.
- Bot migration rollback safety is unproven until lifecycle tests; `downgrade()`
  presence alone is insufficient.
- Upstream Bot version metadata mismatch may affect build or version reporting;
  this is a gate item, not a reason to invent a patched SHA.

## Alternatives Considered

### Replace Custom Cabinet with the v1.79.0 tree

Rejected. It would remove current navigation, Unified Dashboard, branding,
instructions, design system and regression coverage.

### Cherry-pick the entire upstream range

Rejected. The repositories have a deliberately adapted history, 136 overlapping
changed paths and mixed commits containing presentation, behavior and excluded
reachability concerns.

### Port only features listed in release notes

Rejected. Release notes omit parts of route, fallback, storage, permission,
test and error-state behavior visible in the diff.

### Upgrade Custom Cabinet without Upstream Bot

Rejected. New endpoints, response fields, RBAC permissions and schema-backed
features require Bot `v4.15.0` for the target compatibility claim.

### Copy upstream lite pages alongside Unified Dashboard

Rejected. This duplicates subscription selection, data loading, mutations and
payment decisions and violates the existing separation of behavior and
presentation.

### Adapt lite mode as a variant inside Unified Dashboard

Rejected. Unified Dashboard уже выполняет продуктовую задачу простого вида.
Дополнительные flag, endpoint, storage hint и presentation branch увеличивают
поверхность синхронизации без подтверждённой отдельной пользы.

### Fork Upstream Bot to remove excluded capability

Rejected. The exclusion applies to Custom Cabinet frontend. A Bot fork is a
different product and licensing/maintenance decision outside this work.

### Skip optional product features and port only bug fixes

Rejected как общая стратегия: reminders, promo-group recalculation, broadcasts
и grace contracts дают отдельные подтверждённые возможности и переносятся по
PRD. Simple/Lite Mode является узким осознанным исключением, потому что его цель
уже покрыта Custom Cabinet, а параллельная реализация повышает риск.

## Verification and Rollback

### Source gate

- Every incoming Cabinet commit classified.
- Unit tests, type-check, build and source check pass.
- Browser scenarios pass for affected routes, states, permissions, themes,
  locales and widths.
- No lite-mode frontend client, storage key, admin toggle, routes or components
  are introduced; `src/noLiteMode.guard.test.ts`, existing Dashboard and
  mobile-navigation regressions pass.
- No-BSCHEKER guard passes.
- No unreviewed whole-file resolution in hybrid/custom-owned areas.

### Compatibility gate

- Exact Upstream Bot `877690a…` builds and starts.
- Fresh schema and `0119 → 0127` upgrade pass.
- Custom Cabinet uses only confirmed v4.15 contracts.
- Manifest/icons, reminders, legacy subscriptions, admin users, grace,
  broadcasts and promo recalculation pass integration smoke.

### Release gate

- Full Installer lifecycle gate succeeds for the new identities.
- Release Bundle is immutable and contains checksums/digests.
- Production deployment still requires explicit owner authorization.

### Rollback reference

Until the new Release Bundle is independently published and verified, the only
confirmed runtime fallback is Release Bundle `v2026.09.21.1` with Custom Cabinet
`aec198424aa0b489db6d07d1af92bd704aa7c518`, Upstream Cabinet `v1.74.0`,
Upstream Bot `v4.10.0` and schema `0119`.

The safe rollback procedure for a future schema `0127` release cannot be
declared from source inspection alone. It must be proven by the Installer
lifecycle gate and protected migration backup; otherwise release remains
blocked.

## Evidence

- [Upstream Cabinet v1.79.0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.79.0)
- [Upstream Cabinet v1.74.0...v1.79.0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/v1.74.0...v1.79.0)
- [Upstream Bot v4.15.0](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.15.0)
- [Upstream Bot v4.10.0...v4.15.0](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/v4.10.0...v4.15.0)
- `UPSTREAM_SYNC.md`, `CUSTOMIZATION_MAP.md`, `REDESIGN_RULES.md`,
  `INTERFACE_MAP.md`, `LIVE_CHECK.md`, `COMPATIBILITY.md` and `CONTEXT.md` in
  the Custom Cabinet repository.
