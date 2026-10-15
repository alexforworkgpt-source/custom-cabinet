# Custom Cabinet Context

## Актуальный scope владельца — 2026-10-15

**Upstream Bot принимаем как рабочую основу.** Это постоянное решение, а не только
запрет редактировать backend. Следующий чат не должен снова выбирать самостоятельные
backend-тесты из исторического списка S9. Проверяем Custom Cabinet, его запросы к
существующему API, подключение и условия тестового стенда; исправления относятся
к нашему frontend или его тестовому подключению.

Текущее решение о готовности и следующий шаг:

**Владелец2026-10-15 пропустил реальный Telegram/device gate:
SKIPPED_OWNER_ACCEPTED, не PASS.** Решение относится к текущему tested manifest
0aa20cd и текущей подготовке релиза; не требовать телефоны снова и не переносить
waiver автоматически на другие релизы/существенные Telegram-auth изменения.
Frontend готов **к подготовке релиза** с этим
ограничением. Следующий этап — чистый reviewed/tested source/record и обязательные
CI/publication/new Bundle smoke по RELEASE_PROCESS, после разрешения на конкретный
пакет. Сам пакет ещё не собран/опубликован, его новые gates не объявлены PASS.
[Readiness record](docs/releases/FRONTEND_RELEASE_READINESS_2026.10.15.md).

Текущие доказательства и тестовый стенд:

1. **Уже выполнено15 октября14:03 UTC:** exact проверенный Custom Cabinet manifest
   `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0` доступен на
   публичном тестовом адресе. Все284 файла проверены по HTTPS; существующий Caddy
   подаёт отдельную папку, API/health и managed files сохранены. Новых контейнеров,
   backend restarts и DB fixtures0. Guest Chrome320/375/1280, оферта/reload/возврат,
   API-подключение PASS. Повторная выкладка и повтор полного browser gate не нужны.
2. Реальные Android/iOS Telegram/navigation/session/device проверки
   **SKIPPED_OWNER_ACCEPTED**; фактического device PASS не было.

Frontend сохранён на тестовом адресе; device gate уже пропущен владельцем.
Deployment journal `FRONTEND_READY_WAITING_DEVICE` — исторический operational
label, не требование возобновить device gate.
Workspace controller/receipts: `.scratch/cabinet-frontend-stage-20261015/`; источник
test URL — private/target.json, remote_root/owner — prepared.json. Команда `rollback`
возвращает исходную подачу Caddy и сохраняет пакет; **не выполнялась**. Не запускать
старые payment/Installer `finish` и whole-parent cleanup. Cleanup нового frontend
stage пока **NOT_RUN_FRONTEND_RETAINED**; parent `SKIPPED_OWNER_REQUEST` сохранён.
Перед smoke нового Bundle контролируемо убрать frontend override из его пути,
иначе старая тестовая подача может скрыть результат новой установки.
[Актуальный frontend staging report](docs/frontend-staging-20261015.md).

Внутренние capture/refund/recurring handlers, SDK, вся backend RBAC/ABAC-матрица
и повторная приёмка Upstream Bot не входят в этот остаток. Датированные ограничения
ниже остаются фактами своего scope, не становятся PASS и не являются поручениями
на backend. Применимые frontend/installation/Release gates не отменены.
Закрытые1084 unit/1146 browser/merchant callback/lifecycle proofs повторять только
при изменённых входах или конкретной новой причине. Работать последовательно;
новый Release Bundle, production и новые финансовые операции не разрешены.

## Local v1.80.1 frontend integration (2026-10-13)

Latest15 October autonomous remainder: full `npm run check` **PASS** after format-only
normalization of three historical JSONs; all values preserved, exact originals
archived,40 warnings/5 infos remain. On the unchanged284-file0aa20cd artifact,
**8 new functional browser/native-API cases +1 native-login prerequisite PASS**:
three public documents RU/EN/emptyFA/missingZH/cache, inactive reminder create/
update/delete, real WS reconnect with unsaved input, owned audience preview and
actual15-minute access expiry→native refresh without password. Read-only native
Remnawave status200/connected PASS. Source/schema API audit549 declarations:
349 literal/199 possible-template/one known unused wrapper/0 unresolved.
All owned fixtures removed; postflight12:35:15 and native403 restore12:43:25 UTC
PASS, parent preserved, local bridge stopped. Backend/application/E2E/Installer/
site/dependencies unchanged; closed gates not repeated. Current payment discovery
offers only Stars. Public test entry module is not this exact candidate; Bot
menu normalized origin/path matches (query difference harmless). Full S9 PARTIAL:
remaining matrix requires exact public candidate/device actions, provider/data/
operation conditions; no full live/Release PASS.
[Autonomous remainder evidence](docs/compatibility-evidence-v1801-bot-v5-remaining-20261015.md).
The dated paragraphs below retain their original scope and earlier failure states.

Later2026-10-15 unit follow-up: **ordinary npm test now PASS,1084 tests/176 files**,
without CLI flags, with unchanged5000ms timeout. Only `vitest.config.ts` now caps
workers at2, matching the already configured CI command. Same-source diagnostic
baseline:1082 PASS/2 FAIL with13 overlapping module intervals; worker-only control
at2/default5s:1084 PASS. Build/both TS/focused Biome PASS; all284 compiled files
match manifest `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
The completed1146/35 browser gate is retained by exact bytes/source; not rerun.
This supersedes only the current local ordinary-unit gap below; earlier failures
retain their old configuration scope. Full S9/live/Release readiness still incomplete.
[Default unit evidence](docs/compatibility-evidence-v1801-bot-v5-unit-default-20261015.md).

Latest2026-10-15: the missing full local compiled browser matrix is now
**1146 PASS /35 configured SKIP /0 FAIL**, no retries, on new284-file manifest
`0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
Five old test contracts corrected; a genuine19–23px loading shift fixed only in
SubscriptionCardSkeleton/Dashboard. Limited/unlimited regression10 PASS with the
original4px allowance. Build/both TS/focused Biome PASS;1084 unit PASS with2 workers/
10s. Ordinary npm test **FAIL:1076 PASS/8 FAIL in six unchanged test files**;
default publication policy remains NOT_PASS. Full S9/live remains PARTIAL/BLOCKED.
No remote/merchant/Panel/commit/Release/production actions; completed native gates
not repeated. [Final browser matrix evidence](docs/compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.md).
The dated14 October paragraphs below retain their historical artifact scope.

Latest 2026-10-14 follow-up: two frontend session-recovery/return fixes now
modify the previously tested snapshot. Final compiled manifest is
`024382a677dc952f64364425698eb8766260ebc5cdbb0360c1592170874c8df9` (284 files).
Seven actual native-API browser stages and two mocked regression tests PASS.
1084 unit tests pass with explicit2 workers/10s budget; build/both TS/focused
Biome PASS. Follow-up default5s unit runs timed out in unchanged audience tests
and are not PASS. Historical398 cases below apply to the original artifact,
not the new bytes; full new browser/default-publication gates remain incomplete.
[Latest browser recovery proof](docs/compatibility-evidence-v1801-bot-v5-browser-recovery-20261014.md).

The selective Upstream Cabinet `v1.80.1` adaptation is now applied in this
working tree. Existing owner changes are retained; no commit, tag or Release
was created. Language/reminder fixes, audience rules and Cashera use the
existing Custom Cabinet consumers. DPI/BSCHEKER/Lite stay excluded.
Installer, site, Upstream Bot and production were not modified.

Local verification: 1084 unit tests, both TypeScript configurations, build and
frontend Biome passed. The rebuilt 284-file artifact and all 945 source/test
inputs match the candidate that passed 398 browser cases (14 configured skips).
Full repository Biome retains three unchanged historical JSON format errors;
Bot v5 targeted VPS startup/HTTPS/JWT/Marketer checks passed. Subsequent
2026-10-14 sandbox and native Installer results are recorded below;
full S9/live, full RBAC/ABAC and physical-client coverage remain PARTIAL.
Read [the transfer report](UPSTREAM_V1.80.1_SYNC_REPORT.md),
[PRD](docs/prd/bedolaga-v1.80.1-bot-v5.0.0.md) and
[ADR 0003](docs/adr/0003-adapt-upstream-v1.80.1-bot-v5.0.0.md).

Older source/production paragraphs below retain their recorded dates.
The newer recorded production Bundle is `bundle-v2026.10.10.1` in root
CONTEXT.md; this local integration did not query or change production.

### Targeted VPS Bot v5 proof

Subsequent 2026-10-14 sandbox stage: native Email registration/login, actual
YooKassa test success/callback/credit, declined-card no-credit and eight
concurrent duplicate native service calls passed. Owner's actual Telegram web
login and four preset role assignment/revocation cycles passed selected HTTPS
checks (99 assertions). Read-only Remnawave permits no subscription mutations.
Owner confirmed Mini App opening on physical Android/iOS; client versions,
navigation and no-repeat-login are not yet confirmed. Owned cleanup/postflight
passed after this check: root/resources/webhook/listeners absent, private snapshot
and DB preserved, management222/config unchanged, Caddy baseline restored.
Merchant UI is unchanged; the test URL was offline immediately after this
sandbox cleanup. Separate later Installer runs are recorded below. Full RBAC/ABAC,
physical-client coverage, first-delivery race and full live remain partial. See
[sandbox evidence](docs/compatibility-evidence-v1801-bot-v5-sandbox-20261014.md).
The following paragraph records the separate completed run of 2026-10-13.

Owner-authorized native main.py/unified lifespan, exact compiled Cabinet,
HTTPS/proxy and 14 actual JWT/API checks passed on Ubuntu24.04/PG15/Redis7.
Native Marketer receives count-only preview and cannot search user lists.
Three services stayed healthy during 60s observation without restart/OOM.
Owned cleanup and independent postflight passed: no test stack/webhook remains;
38 management runtime files and private config are preserved. Native warnings,
uncommitted snapshot scope and remaining S9 limits are in
[the VPS proof](docs/compatibility-evidence-v1801-bot-v5-vps-runtime-20261013.md).
No source, Release or production changes; do not repeat existing gates
without changed identities/inputs or a new concern.

### Native Installer lifecycle and cross-version transition (2026-10-14)

Exact unchanged Installer `75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Bot v5,
PG15/Redis7 and the published reference Cabinet from `bundle-v2026.10.10.1`
passed [ten native lifecycle stages](../installer/docs/bot-v5-pg15-lifecycle-20261014.md).
The terminal receipts were recovered after SSH interruption without rerunning
the scenario; that run's source-integrity and cleanup/postflight passed.

The separate [cross-version transition](../installer/docs/bot-v5-pg15-transition-20261014.md)
then passed Bot v4.15/schema0127 → v5/schema0131, intentional failure after
successful native verification, native rollback to old runtime/dump/schema0127,
and a second committed update. Two fixture users/balances and one synthetic
legacy transaction were preserved; subscriptions0, Panel writes0, native exit0.
These Installer runs used the published reference Cabinet, not the new
uncommitted Custom Cabinet artifact. They do not constitute a new Bundle gate.

Latest recorded test VPS state: transition runtime left running at owner's
request, cleanup `SKIPPED_OWNER_REQUEST`; state after a possible reinstall is
unknown. No remote action is needed to consolidate these saved proofs. The
transition container's source-integrity probe and final DB/root archives were
not collected. Earlier cleanup/image proofs apply only to their own runs.
No commit, public Release or production operation; full S9 remains PARTIAL.

### Extended native role checks (2026-10-14)

Owner confirmed the transition VPS was not reinstalled. Fresh verified SSH
preflight and independent final postflight observed the same healthy native v5
stack, unchanged configuration/images and no restart/OOM. Thirty-four new HTTPS
assertions passed custom-role CRUD/permission grants, multi-role union, actual
expiry and deactivate/revoke/reassign/delete enforcement on the same token.
Two native ORM fixture accounts used real HTTPS Email/password login; verified
Email/controller-role setup is fixture data, no manual JWT or owner admin change.

Initial login403 was the original disabled Email-auth setting. One temporary
DB flag enabled the scenario without a restart and was removed afterward,
restoring the original403 gate. New accounts/roles/assignments were removed;
core non-fixture data and local server.env were preserved. The transition VPS
itself remains running; earlier SKIPPED_OWNER_REQUEST cleanup was not performed.
Full ABAC/resource/all-mutation coverage and full S9 remain partial. See
[the extended role proof](docs/compatibility-evidence-v1801-bot-v5-rbac-extended-20261014.md).
Old99 assertions and frontend/schema/browser/lifecycle gates were not repeated.

### Native access-policy checks (2026-10-14)

Subsequent native policy proof on 2026-10-14 produced31 HTTPS checks:
29 expected statuses matched, two failed. Deny policies attached to expired
assignments or inactive carrier roles still apply even though the permission
response excludes those roles. Native source trace and same-token negative
controls confirm L-ABAC-01/02; targeted ABAC gate FAIL, limitations remain OPEN.
No backend change is in scope. Its owned fixtures/policies/temporary Email-auth
flag were removed; independent postflight preserved core records/config/images
and healthy/restart0/OOMfalse. The earlier VPS remains running. See
[native ABAC evidence](docs/compatibility-evidence-v1801-bot-v5-abac-20261014.md).

### First-local payment race fixture (2026-10-14)

A separate empty DB/Redis and the same native Bot image exercised first local
processing of an existing real succeeded test provider object. Eight sessions
started, six provider-confirmed handlers overlapped under a fixture row-lock
guard; balance0→5000 and transactions0→1, paid/linked and subscriptions0.
Two lookups failed: eight-success profile NOT_PASS, financial invariant PASS
only in the observed six-handler scope. This is not actual first merchant or
simultaneous HTTPS delivery. No previous credited payment record was reset.

Read-only diagnosis found transport ReadTimeout masked by installed SDK3.12.1
as AttributeError on absent HTTP response; serial2/3 and parallel8/8 reads.
The later diagnostic did not repeat or replace the financial race. L-PAY-API-01
OPEN; backend/SDK source unchanged. Two native payment modules matched raw Git
at exact SHA in a targeted diagnostic, not a full810-file rerun.
Only the fixture DB/containers were removed. Independent postflight preserved
original core records/config/images and healthy/restart0/OOMfalse services;
the earlier VPS stays running with cleanup skipped. Full S9 remains PARTIAL.
[Payment race evidence](docs/compatibility-evidence-v1801-bot-v5-payment-race-20261014.md).

### Native session recovery / logout (2026-10-14)

Thirty-five new native HTTPS checks matched 35 expected responses: three setup
logins and 32 recovery/denial cases on two new ORM verified Email accounts.
Invalid access 401 → native refresh 200 → same-account access 200; four parallel
refreshes added no token rows. Logout rejected the revoked refresh, including
four concurrent replays; second session and control account stayed usable.
Owned DB-expiry/blocked-status controls denied, restoration resumed access.
Native logout revokes only refresh; unexpired access still returns 200 and
refresh does not rotate the key. Automatic compiled UI recovery is not proved.

Only new accounts/refresh rows and the temporary DB Email-auth flag were removed.
Independent postflight 16:42:46 UTC confirmed original disabled login 403,
unchanged core/refresh projections/config/images and healthy/restart0/OOMfalse.
Earlier transition VPS stays running with cleanup skipped. Three auth modules
match exact Git blobs; this is a targeted new trace, not a full integrity rerun.
Full S9 remains PARTIAL; old gates were not repeated.
[Auth recovery evidence](docs/compatibility-evidence-v1801-bot-v5-auth-recovery-20261014.md).

### Canceled payment authority / missing-row recovery (2026-10-14)

Latest payment follow-up on 2026-10-14: the earlier declined test object now
confirms canceled/unpaid/insufficient_funds via real provider GET. Separate empty
DB/Redis/same-image worker passed three native service cases: false success body,
repeat and missing-local-row recovery. Each ends balance0/transactions0/
subscriptions0, one canceled5000-kopek/RUB unpaid/unlinked record. No provider
writes/new payment, mocks, SDK/source or parent configuration change.
First SDK lookup failed at TLS handshake before user/payment fixtures/stages;
failure retained, then read-only2/2 confirmations allowed one unstarted run.
L-PAY-API-01 OPEN, actual merchant canceled HTTPS delivery not proved.
Postflight18:56:24 UTC removed only new DB/containers and preserved the healthy
parent/core/config/images. Whole VPS cleanup stays skipped; old gates not rerun.
[Canceled payment-state evidence](docs/compatibility-evidence-v1801-bot-v5-payment-state-20261014.md).

### Native callback HTTPS lab (2026-10-14)

Latest native callback layer on 2026-10-14:14/14 checks passed on a closed
loopback TLS app mounting unchanged native payment router/service. Certificate
trust/hostname verified, header/body guards exercised and four concurrent
operator callbacks returned200; canceled/unpaid row with balance0/transactions0/
subscriptions0. Native API replies were genuine, accepted forwarded source a
trusted-hop fixture. This is not true merchant delivery, stock Caddy prefix,
full main.py startup or new Bundle proof. Parent source/Caddy/UFW unchanged;
postflight20:11:59 UTC removed all newly owned DB/containers/root/cert/listener
and preserved fresh-baseline core/config/images. Full S9 PARTIAL, old gates
not repeated. [Native callback HTTPS evidence](docs/compatibility-evidence-v1801-bot-v5-callback-https-20261014.md).

### Current merchant / receiver readiness audit (2026-10-14 UTC)

Read-only readiness audit21:05–21:14 UTC on14 October (00:05–00:14 Moscow15 Oct)
confirmed the owner-authenticated test Merchant Profile matches saved credentials,
historical notification URL/current expanded Caddy app host and four events.
That target currently returns404; parent env has YooKassa off/no shop/key and no
YooKassa DB override. E-PAY-STAND-01 is current test receiver NOT_READY after the
configured sandbox was removed, not a regression/invalidation of earlier real
50 RUB callback PASS. No source/config/provider mutation or closed gate rerun.
Known SDK/access/classic/refund/default-unit limits retain their actual scopes.
[Current readiness / issue audit](docs/compatibility-evidence-v1801-bot-v5-current-payment-audit-20261014.md).

### Genuine public canceled callback completed (2026-10-15 UTC)

The same merchant URL is now native200/enabledtrue through the live Caddy snippet,
with isolated schema0131 DB/Redis/same-image worker and target-only admission.
Parent candidate/env/Compose/core and product source are preserved. Initial setup
rollback and infrastructure diagnostics are retained, not product regressions.
The owner authorized one new declined sandbox50 RUB invoice, created once through
native PaymentService04:31:01 UTC. The checkout displayed insufficient funds, but
native provider GET04:43:40 UTC still reports pending/unpaid/testtrue. Local balance,
transactions and subscriptions0 in that earlier observation. Later, actual
provider `payment.canceled` arrived05:33:02 UTC, passed native IP checks/owned ID
and received200. Independent DB observation06:55:17 UTC confirmed canceled/unpaid,
one5000/RUB row, balance0/transactions0/subscriptions0/no transaction link.
Selected genuine canceled-delivery scope PASS; no operator callback injection.
Owned cleanup and independent exact-rollback postflight06:57:13 UTC PASS: parent
core/config/source/images/three healthy services preserved, owned receiver absent.
Parent whole cleanup SKIPPED_OWNER_REQUEST; temporary route removed, parent original
configuration restored. Historical succeeded50 RUB merchant/credit PASS unchanged;
do not repeat completed gates without new inputs/reason. Full S9 PARTIAL.
[Public callback result](docs/compatibility-evidence-v1801-bot-v5-public-callback-20261015.md).

### Earlier partial local Bot v5 proof

The unchanged v5 source now passed local schema0127→0131/fresh/restore,
Redis7 CacheService operations, 172 selected upstream tests and six real
local ASGI JWT/auth/DB contract cases. Full target runtime/staging remains
PARTIAL at that run's completion; later main.py, sandbox merchant and Installer
proofs are linked above. Full merchant/physical Telegram coverage remains partial.
Frontend source and existing production remain unchanged.
Read [the proof and scope](docs/compatibility-evidence-v1801-bot-v5-local-20261013.md); do not repeat successful local proofs
without changed inputs or another unresolved concern.

## Product

Custom Cabinet is an independently maintained frontend for a compatible
Upstream Bot. It works as a normal web application and as a Telegram Mini App.

The product has three interface modes:

1. Public authentication and transactional flows.
2. User Cabinet for subscriptions, connection, payments and account management.
3. Administrative console protected by roles and permissions.

## Current Source and Production Reference

As recorded on `2026-10-02`, the latest separate stable Custom Cabinet Release is
`cabinet-v2026.10.02.1` at `8fb8cbec19d651fcfaee3bce32621031b3e69965`;
Release Bundle `bundle-v2026.10.02.1` uses Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab` and unchanged Upstream Bot
`877690a7039d1326b2c00eda3e297879b80c0678`. Exact source CI/public downloads and
targeted disposable Bundle installation/cleanup passed; Installer lifecycle
was reused for exact identities. Accepted OPEN/BLOCKED live limitations remain.

This publication did not deploy production or change `latest`. The last recorded
production deployment is Bundle `v2026.10.01`, Custom Cabinet
`cabinet-v2026.10.01.1` at `5ee46023afc373fbfcef69f6793d440aa1d2cdd0`, artifact
`a068888441ab8cc996a45c9f60fc2f4c750d23efa389041b255c6138f2d3ff7e`, with
unchanged Upstream Bot `877690a7039d1326b2c00eda3e297879b80c0678`.
Read root `CONTEXT.md` and `PRODUCTION_TRANSITION_RUNBOOK.md` and take a fresh
baseline before another production operation.

Future publication follows [`RELEASE_PROCESS.md`](RELEASE_PROCESS.md) and
Installer `docs/deployment-procedure.md`: exact clean source, project releases,
prerelease Bundle, public checks/targeted smoke, reviewed evidence, stable
metadata promotion, then a separately authorized production transition.
Backend code/API/migrations and the selected Bot SHA remain unchanged.

### Historical verified reference — 2026-09-21

The historical production reference, deployed and verified on `2026-09-21`, is
Custom Cabinet `cabinet-v2026.09.21.1` at
`aec198424aa0b489db6d07d1af92bd704aa7c518`, package `v1.74.0`, through Release
Bundle `v2026.09.21.1`, identity
`991c6ec42053876ae6079d82faee14dc7a6e65157fd9d3c8ada3875795b768af`. It
integrates Upstream Cabinet `v1.74.0` at
`57810c7da24b5c142371ed83a6ad5e43a591d454` and runs with Upstream Bot
`v4.10.0` at `9fcebfd7bc075dcca1bb9d1514740039208b906a`.

The protected transition from Release Bundle `v2026.09.14` completed with
`outcome=committed`. A full migration package was checksum-verified on the VPS,
copied off-host and verified again before the update. Database revision `0119`,
the existing PostgreSQL/Redis volumes and immutable runtime images were
preserved. Independent verification passed for exact identities, clean runtime
repositories, three healthy services without restart/OOM, Installer Status and
Diagnostics, firewall, Caddy, public health and Telegram webhook.

The owner-authenticated read-only production browser smoke passed for Dashboard,
Balance, Connection, Profile, Support, tariffs without purchase, Instructions
and selected admin pages. Responsive checks at 390 and 320 pixels also passed
for the changed Dashboard/Instructions/Support scope, including all six lazy
instruction images. No payment, ticket, synchronization, settings save or other
production mutation was performed. Full authenticated Telegram staging, real
Android/iOS Telegram and physical screen-reader checks remain `BLOCKED` and were
explicitly accepted by the owner for this rollout. See
[`LIVE_CHECK_REPORT_2026.09.21.md`](LIVE_CHECK_REPORT_2026.09.21.md).

Release Bundle `v2026.09.07` is an immutable, superseded publication and was
not deployed. A migration-export race was found after publication; the fix was
published and deployed only as `v2026.09.07.1`. Never replace assets under the
older tag.

Release Bundle `v2026.09.21` is also immutable and superseded. Targeted
fresh-install smoke found a nonexistent PostgreSQL digest before production.
Its assets remain unchanged; only corrected Bundle `v2026.09.21.1` may be used.

## Historical Release Reference

The following references are retained as historical evidence and must not be
used as the current production baseline.

- Previous published candidate: Custom Cabinet `cabinet-v2026.09.05.1`, commit
  `5cf81e74dcacad02336e57af6f71d490688cdf88`, through Release Bundle
  `v2026.09.05`. Publication and independent public-asset verification passed.
  The translation-loading limitation was accepted by the owner; a separate
  disposable-VPS installation was skipped by owner decision.
- Previous production management Installer: `v2026.08.25`, commit
  `27e73f662297bbfe459af86cbe00b2a132d8ac0e`.
- Previous fully verified production Release Bundle: `v2026.08.24`, policy
  `rollback-compatible`.
- Custom Cabinet in that historical Bundle: `cabinet-v2026.08.24.4`, commit
  `3250e3a7f31fc2dc6f2c7779a42d86cf99a03210`.
- Production baseline, transition, Status, Diagnostics, health, exact runtime
  identities and authorized browser smoke passed. The later Installer update
  was management-only and did not change the runtime Bundle.
- Real Telegram Android/iOS, physical screen-reader, authenticated staging,
  initial Remnawave synchronization and Remnawave `3.3.0+` GeoCheck remain
  `BLOCKED`, not `PASS`.

See [`COMPATIBILITY.md`](COMPATIBILITY.md) for exact source, image and Release
Bundle identities. Historical live-check reports retain the result known at
their verification date and must not be reinterpreted as current production
state.

## Actors

**Guest**

An unauthenticated visitor using Login, registration, legal, callback or public
purchase flows.

**User**

An authenticated customer who needs to understand subscription state, connect a
device, pay, renew and get support with minimal cognitive load.

**Administrator**

An authenticated operator with one or more administrative permissions.

**Installer**

The supported installation and update path for a committed Custom Cabinet and a
compatible Release Bundle.

**Upstream Cabinet**

The external source Cabinet from which selected changes are intentionally
integrated.

**Upstream Bot**

The compatible external Bot providing Cabinet APIs and Telegram behavior.

**Release Bundle**

An immutable, verified combination of Installer, Upstream Bot, Custom Cabinet
and runtime images.

## Primary User Jobs

- Understand whether the service is active.
- Connect the current device.
- Buy or renew a subscription.
- Check traffic and device usage.
- Top up balance and understand payment result.
- Manage account identity and notifications.
- Reach support when a critical flow fails.

## Product Direction

The user Cabinet prioritizes clarity over feature visibility. Critical status
and primary actions stay visible. Secondary settings and multi-step operations
use progressive disclosure through accessible dialogs or sheets.

The interface must remain compatible with Upstream Cabinet behavior, Upstream
Bot contracts, Telegram navigation and Installer-based deployment.

## Canonical Rules

- Do not use public upstream branding as Custom Cabinet branding.
- Preserve exact technical attribution, source URLs, Git SHAs and licenses.
- Keep presentation separate from authentication, payment, subscription and
  platform behavior.
- Preserve callback routes and deep links when simplifying visible navigation.
- Test user-facing changes through whole browser scenarios and the live-check
  process after installation through Installer.

## Excluded Frontend Capability

BSCHEKER is intentionally unsupported in Custom Cabinet. No route, navigation
item, permission, setting, API client or request, polling, locale, fixture or
feature-specific asset may expose it. This is an executable product boundary,
not a temporary feature flag; `src/noBscheker.guard.test.ts` enforces it during
the normal unit-test gate.

The official Upstream Bot `v4.7.1` still contains its BSCHEKER backend and
migrations. Custom Cabinet's frontend exclusion does not authorize a backend
fork or a claim that the upstream capability is absent. General platform and
accessibility fixes may be adapted from adjacent upstream commits only after
they are separated from reachability contracts. See
[`docs/adr/0001-no-bscheker-frontend.md`](docs/adr/0001-no-bscheker-frontend.md).
