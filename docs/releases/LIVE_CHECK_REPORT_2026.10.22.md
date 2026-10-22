# Live Check Report: Custom Cabinet2026.10.22.1

Status: **PASS WITH RISKS — RELEASED_STABLE_WITH_ACCEPTED_LIVE_LIMITATIONS**.<br>
Date:2026-10-22<br>
Checker/Implementer/Observer: агент<br>
Release owner: владелец
Это отчёт фактического scope, не заявление полного live PASS всех интеграций.
Итог выпуска: [RELEASE_COMPLETION_2026.10.22.1.md](RELEASE_COMPLETION_2026.10.22.1.md).

1. **Где и версии:** isolated source `80be79d59791c330dae3fc5eac46d96d2e503357`,
   public Bundle `bundle-v2026.10.22.1`, artifact `3b02860e5de08b1f7d6aae56777eeb1b4cb740dc6acfc8460fa449671fdbb8ed`.
   Неизменённый Upstream Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installerf1f301b.
   Rollback reference — прежний stable `bundle-v2026.10.18.1`.
2. **Роли:** Release owner — владелец; implementer/checker/observer — агент.
   Владелец завершил дизайн, разрешил пакет и исправления, затем отдельно принял
   физический device gate текущего исправленного пакета как SKIPPED_OWNER_ACCEPTED.
3. **Локальный технический gate:** exact Linux CI Node24/26 по1166 unit PASS,
   полный types/build/lint/format/guards PASS. Fresh audit15 OPEN/non-blocking,
   включая1critical; CodeQL completed без новых IDs, existing alerts сохранены.
4. **Browser design/flow gate:**1766PASS/35configuredSKIP/0FAIL/0flaky на точном
   публичном архиве,320/375/768/1024/1280; текущие management/purchase/renewal/
   discount/device funding/auth/navigation/profile/admin mocked flows. Дополнительные
   R1–R5 RED→GREEN и185 affected cases сохранены. Один geometry sampling block
   в отдельной verification-copy измеряется атомарно, без изменения assertions,
   timeouts/retries/fixtures. Tagged source, animations и compiled bytes сохранены.
5. **Disposable live installation/connection:** новый собственный root на
   назначенной Ubuntu24.04. PG18/schema0131, exact source/artifact identities,
   health/frontend/instructions/branding/API/webhook404/no-store PASS;287 установленных
   файлов совпали с публичным архивом. Это targeted Installer/connection smoke,
   не новый backend acceptance suite и не проверка реального платежа.
6. **Cleanup:** новые roots/containers/volumes/image tag удалены после checksum/
   inventory-проверенной off-host копии. Прежние volumes и management/Caddy/UFW/
   launcher/locators bytes/modes сохранены. Старый инцидент15 октября не повторён
   и не объявлен восстановлением прежнего стенда.
7. **Physical Telegram/Android/iOS:** **SKIPPED_OWNER_ACCEPTED**, не PASS.
   Telegram в автоматических browser cases эмулирован; реальные init data,
   сессия и native return на устройстве этим не доказаны.
8. **Другие live-ограничения:** реальные provider/recurring/response-parity/
   renewal/concurrency/Panel сценарии не объявляются PASS. Прежние OPEN/BLOCKED
   сохраняют даты/scope; backend fixes/SDK/RBAC повторная приёмка не становятся
   остатком frontend-задачи. Outstanding initial Remnawave sync marker не изменялся.
9. **Production smoke:** NOT_RUN_NOT_AUTHORIZED; production исключён из разрешения
   этого пакета. Нужен отдельно разрешённый переход с fresh baseline/off-host backup.

Публичные доказательства и точные workflow URLs — в итоговом отчёте и Installer
promotion record `dbdfbd958deac179fee20224548895b9f3efed83`.

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet | `cabinet-v2026.10.22.1` / `80be79d59791c330dae3fc5eac46d96d2e503357` |
| Committed Upstream Cabinet provenance | `v1.79.0` / `821c7b71823573a756de00418acb25118ede1c9c`; later selected adaptations retain their existing evidence |
| Upstream Bot | `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, неизменённый |
| Release Bundle | `bundle-v2026.10.22.1`, stable/immutable |
| Artifact SHA256 | `3b02860e5de08b1f7d6aae56777eeb1b4cb740dc6acfc8460fa449671fdbb8ed` |
| Rollback reference | `bundle-v2026.10.18.1`, existing stable/immutable |

## Environment

Назначенная disposable Ubuntu24.04/linux-amd64; HTTPS routes проверены native
smoke. Non-secret environment ID: **`cabinet-public-20261022-c63be8ccdf`**.
Deployment outcome receipt (`committed`) записан **2026-10-22T20:16:33Z**;
smoke завершился **2026-10-22T20:17:06Z**. Это UTC mtimes соответствующих файлов
в проверенной off-host копии, а не выдуманные поля времени в JSON receipt.
SHA256 native log:
`2f45574c081ef1014ce2d4e89f0b3f5be833eb77543ad53541439db0dbe31ae5`;
control archive SHA256:
`c562a052985a25cba54141db309e94bf4ba21cd15daa59adbdee8f4f41932deb`.
Они связывают environment ID/time с конкретной установкой; credentials и private
URL не публикуются.

Pinned Chromium153 и отдельный Firefox155.0/revision1543. Основной gate имеет
пять viewport projects; дополнительный public-artifact run проверил точные
320×568,768×1024,1440×900. Вместе с375×812,1024×768,1280×800 основного run покрыты
все шесть размеров обязательной viewport matrix. Dark/light/operator и RU/EN/FA/ZH
проверены в соответствующих cases, без заявления полного декартова произведения.
Physical Telegram clients не запускались; Google Fonts remote load не доказана.

## Change Scope

`/subscriptions`, `/subscriptions/:id`, purchase/renewal/device funding и discount
surfaces; approved compact controls, read-only conditions/badges и loading states.
R1–R5 описаны в release completion. Backend/API/business rules не менялись.

## Automated Gate

| Command / gate | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS | committed lockfile в clean copy и exact Actions |
| `npm run check` / lint/format | PASS | 40 прежних warnings/5 infos |
| `npm test` | PASS |1166unit; exact Linux Node24/26 по1166 каждая |
| `npm run type-check` | PASS | оба TypeScript проекта внутри build |
| `npm run build` | PASS | local/CI; release Docker compile независим |
| Browser automation | PASS в scoped mocks |1766/35/0;0flaky;2workers/0retries; atomic measurement-only verification copy |
| Missing-size supplement | PASS |486/3/0,0flaky; точные320×568/768×1024/1440×900;2workers/0retries |
| Independent Firefox smoke | PASS в configured cases |78/3/0,0flaky; Firefox155.0/revision1543;1worker/0retries |
| Public install/smoke | PASS |287file hashes,141Installer source files,health/routes/owned cleanup |

## Test Accounts and Data

Aliases `guest`, `new-user`, `trial-user`, `active-user`, `expired-user`,
`multi-user`, `full-admin`, `restricted-admin` представлены синтетическими browser
fixtures. Это не реальные пользователи и не новая backend permission matrix.
Live smoke использовал новую пустую disposable установку без финансовых действий.

## Functional Results

| Area | Result | Scope / limitation |
| --- | --- | --- |
| Runtime smoke | PASS | новый public Bundle,health/static/API, identities/cleanup |
| Web auth/Dashboard/subscription | PASS в mocks | routing/loading/error/renewal/selected ID; genuine login здесь не заявляется |
| Balance/payments/recurring | PASS в mocks | explicit confirmation/request parameters/return; real providers не проверены |
| Connection/Profile/support/optional/admin | PASS в configured browser cases | UI/navigation/visibility/error fixtures, не самостоятельная backend-приёмка |
| Telegram real authentication | SKIPPED_OWNER_ACCEPTED | текущий исправленный пакет, не PASS |

## Platform and Visual Results

| Matrix | Result | Scope / limitation |
| --- | --- | --- |
| Responsive | PASS в declared critical-page scope |320×568,375×812,768×1024,1024×768,1280×800,1440×900; основной и supplemental run |
| Dark/light/operator/locales | PASS в configured cases |RU/EN/FA/ZH по suite, не полный cross-product |
| Desktop/mobile Chromium | PASS | pinned153, emulated mobile viewports |
| Desktop Firefox | PASS в smoke scope |155.0/revision1543,78PASS/3configuredSKIP/0FAIL |
| Physical Android/iOS Telegram | SKIPPED_OWNER_ACCEPTED | отдельное текущее решение владельца |

## Accessibility Results

Keyboard/focus/names/forms/dialogs/current-navigation/reduced-motion assertions
в настроенных cases прошли. Полный accessibility audit, screen reader smoke и
общая матрица Zoom200% этим отчётом не заявляются и не переименовываются в PASS.

## Failure and Recovery Results

Review PR45 выявил недостаточную идентификацию staging и отсутствующий1440×900
в отчёте. Время/id восстановлены из checksum-verified private archives; недостающие
viewport inputs фактически проверены на тех же public bytes, не объявлены PASS
по результатам других размеров.

Первый supplemental run558PASS/8SKIP/4FAIL сохранён как NOT_PASS. Один mobile case
ошибочно определял ожидаемую ОС по стандартному имени project; конфигурация
сохранила имя `mobile-320` при точном новом height568, не меняя app/UA/assertions.
Ещё два Firefox failures были ошибками Browser.removeBrowserContext при teardown,
один — мгновенным чтением scrollY до окончания асинхронного smooth scroll.
Отдельная Firefox verification-copy сохраняет тот же `scrollY > 0` predicate,
но измеряет его с polling; source tag/assets/assertion thresholds/timeouts/retries
сохранены. На1worker полный заявленный Firefox smoke прошёл78/3/0; прежние failures
не переписаны в PASS. Три configured skips сохранены, а не скрыты.

Supplemental evidence: `browser-supplement-chrome-corrected.json`,
`browser-supplement-firefox-verified.json`, `supplement-proof.json`,
`firefox-verification-inputs.json` и measurement diff в закрытом release packet.

Browser cases покрывают injected API/load/permission/session failures, refresh/
retry, double-submit protection и mocked interrupted external return. R4/R5
отдельно подтверждают unavailable generic primary query и retry после503 options.
Настоящие платежи/провайдеры и их внутренний recovery этим не проверены.

## Defects

Release-blocking R1–R5 исправлены и проверены RED→GREEN. Тестовые даты, remount/
clock и geometry sampling разведены по evidence без ослабления assertions.
Нерешённых обязательных source/integrity/browser/lifecycle/smoke gates нет.

## Residual Risks

Physical Telegram — текущее явное принятие владельца. Fresh audit15, включая
1critical, остаётся OPEN по существующей non-blocking политике; все security
alerts не объявляются закрытыми. Historical live OPEN/BLOCKED сохраняют свой
scope и принятую границу Upstream Bot; дополнительные backend задачи не создаются.

## Staging Decision

**PASS WITH RISKS в описанном frontend/targeted-install scope**, не full live PASS.
Владелец2026-10-22 разрешил пакет и исправления и отдельно выбрал принятие
ограничения physical Telegram текущего исправленного пакета. Публичный Bundle
прошёл обязательные publication/public/browser/smoke gates и stable promotion.

## Production Smoke

**NOT STARTED / NOT AUTHORIZED**. Все production health/assets/login/read-only/
logs checks в этой задаче не выполнялись. Выпуск не является deployment.

## Rollback

Rollback required: No.<br>
Rollback Release Bundle: `bundle-v2026.10.18.1`.<br>
Rollback result: NOT NEEDED; прежний публичный immutable источник сохранён.<br>
Production post-rollback checks: NOT RUN, поскольку production не менялся.

## Final Sign-off

- [x] Exact source versions и фактические gates зафиксированы.
- [x] Обязательные release blockers исправлены; accepted risks не названы PASS.
- [x] Physical device gate явно принят владельцем как SKIPPED_OWNER_ACCEPTED.
- [x] Rollback reference и существующие Releases сохранены.
- [x] В отчёте нет credentials, cookies, init data или персональных данных.
- [x] Production smoke явно NOT STARTED.

Final result: **PASS WITH RISKS — stable package, production not deployed**.

Рекомендуемый уровень рассуждения для следующей задачи: высокий — нужно сохранить
границу между готовым stable-пакетом и ещё не выполненным production-переходом.
