# Upstream Synchronization Report: v1.69.1

Status: local candidate implemented and verified; runtime/Release not verified
Date: 2026-09-06

## Source identity

- Original Upstream Cabinet baseline: v1.66.0 / 2192484b011068d8cb75c61a6aeaada1d06115aa
- Previous integrated target: v1.69.0 / 2787b61751c4c2f82605004a3bb0c03a2395dc8d
- Target Upstream Cabinet: v1.69.1 / 3da34239d1c1c7b87a0184e74d49bde43ea88b89
- The remote `v1.69.1` tag resolves directly to the recorded target SHA.
- Receiving Custom Cabinet base: 96c34492fdbd1cc96feaab10d12494dd780d876d
- Candidate branch: sync/upstream-v1.69.0 (uncommitted working tree)
- Required Upstream Bot candidate for the full v1.69.1 contract: v4.5.0 /
  07f3c6081233f5517200e62ad7be70aaa58ef27c. No Bot selection was changed.
- Source API evidence and local Cabinet/Installer gates pass; Bot runtime
  compatibility, migrations and release remain unverified.
- Release Bundle: not scheduled or published.

The extended adaptive plan is UPSTREAM_V1.69.0_INTEGRATION_PLAN.md.
The initial 233-file and incremental 45-file inventory is
UPSTREAM_V1.69.0_INVENTORY.md.
Existing user edits in the original main worktree are excluded.
All initial 96 commits / 233 paths and all incremental 12 commits / 45 paths
are resolved below. The candidate also carries a post-upstream Tiptap security refresh from 3.30.2 to
3.31.3 after the inherited v1.69.0 lockfile produced GHSA-cp6q-959q-f8rh.

## Implemented outcome

- Node 24.19.0 is the local verification runtime; the source requires Node
  >=24.15, Docker uses Node 24, and CI covers Node 24/26. Custom metadata,
  scripts, Playwright and the exact react-zoom-pan-pinch pin are retained.
- SafeStorage and the affected auth, OAuth, Dashboard and Subscription paths
  degrade without persistent browser storage; reload loops stay bounded.
- Startup waits for the selected locale with bounded Telegram/theme waits and
  deduplicated locale imports. Delayed-locale entry, Login and Dashboard are
  covered in a real browser.
- DocumentBranding owns title/favicon and preserves Custom Cabinet contrast
  semantics. Login and Quick Purchase no longer compete for document branding.
- Canonical skeleton primitives replace the incoming loading spinners while
  preserving custom error/retry states, layout sizes, sheets and instructions.
- Referral days, reward choice, terms, tiers and level administration are
  ported with strict numeric validation and the existing mobile collapsibles.
- Gift code/link behavior and provider labels are ported without enabling new
  business settings automatically.
- Grace Access, Referral Levels and System Errors are integrated with routes,
  menu and permissions. Email preview remains a sandboxed server-rendered
  iframe; no real email was sent.
- The custom four-item mobile navigation, support counter and safe-area spacing
  are preserved. Recharts tooltip formatter compatibility is applied.
- Browser regressions found during the gate were fixed: delayed locale startup,
  Telegram Back for reopened GeoCheck, and StrictMode contact prefill.
- v1.69.1 adds one legal-consent gate for Telegram callback, redirect and widget
  login. Each retry preserves its original payload; callback effects are keyed
  to the raw search payload so locale/gate re-renders cannot resubmit it.
- Structured backend `detail` values are normalized through
  `getApiErrorMessage`; objects are no longer handed to React as visible text.
- The existing Custom `AppHeader` now asks the Bot avatar endpoint only when
  Telegram initData has no usable photo and falls back to initials on failure.
- First-paint branding, Safari favicon, PNG-only hints and poisoned-cache retry
  are integrated with the existing runtime `DocumentBranding` owner. Custom
  white light, black dark and white-on-accent contrast remains unchanged.
- A browser regression found during the v1.69.1 gate is fixed: `/buy/<slug>`
  removes `contact` before favicon/fonts/branding can expose it via `Referer`,
  while preserving the existing blocked-storage transient prefill.

## Commit impact matrix

Ownership: U = upstream-sensitive behavior; H = hybrid UI/behavior;
C = Custom Cabinet presentation or repository ownership.
For every H/C path, inspect the exact old/new/current trees before accepting
the proposed merge. A clean textual merge is not behavioral verification.

| Upstream source | Scope | Class / ownership | Applied decision | Verification group |
| --- | --- | --- | --- | --- |
| [f1ce8302](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f1ce830266ae6ae551edfee19d17df7c3bc87bc5) | Загрузка и skeleton: feat(ui): единый источник правды по стилям скелетонов | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [b6b608ed](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b6b608eda6065defa00b79d59b9940e7dc49b4b1) | Загрузка и skeleton: feat(ui): примитив Skeleton и SkeletonGroup вместо двух мёртвых компонентов | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [db8cd5eb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/db8cd5eb11aa6a4fb21f5d652c8abddc6eba4a30) | Загрузка и skeleton: refactor(ui): перевести скелетоны пользовательских экранов на общий примитив | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [0693ebaa](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0693ebaa241dde75eb473b15fabdc2ed044d44b4) | Загрузка и skeleton: refactor(admin): перевести скелетоны админских экранов на общий примитив | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [712c3451](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/712c345151e331027e4292d38f65e32fe69b17bf) | Загрузка и skeleton: refactor(stats): свести шесть копий заглушки вкладок в один компонент | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [2a7d9a45](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2a7d9a45ea85210a086d77860708ea19fa5aa549) | Загрузка и skeleton: test(ui): страж от инлайновых скелетонов | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [bf4fc356](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bf4fc3563c4b03fa80e3166a50580264d0d318b6) | Загрузка и skeleton: refactor(ui): убрать второй механизм скелетонов — CSS-класс .skeleton | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [1fc5e72c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1fc5e72c3446471a9d34252479dae87e260b1263) | Загрузка и skeleton: feat(ui): скелетоны вместо спиннеров на пользовательских страницах | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [7b9c78c1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7b9c78c14ea4ca318be35eba3983e49d3bc9cd83) | Загрузка и skeleton: feat(ui): доперевести пользовательские экраны со спиннеров на скелетоны | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [a330036e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a330036ebe7fa06d96ea7b99441f8054fa2793ee) | Загрузка и skeleton: feat(admin): скелетоны вместо спиннеров в админке | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [56a5b25d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/56a5b25d611fd604a34d3c73415a08545363274b) | Загрузка и skeleton: fix(ui): закрыть хвосты консолидации скелетонов | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [14036b7e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/14036b7eecba4cb0807968e747f23509d9063031) | Очистка и конфигурация репозитория: refactor: удалить мёртвый код, найденный по графу | Dependency/Presentation / U,H,C | Apply only after local consumer review; preserve custom docs and CI | No lost exports/consumers; check/build |
| [34275ee2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/34275ee2658e4489fc6f62ee2373992d84cd8e6f) | Очистка и конфигурация репозитория: chore: убрать процессные документы из ветки | Dependency/Presentation / U,H,C | Apply only after local consumer review; preserve custom docs and CI | No lost exports/consumers; check/build |
| [5d911370](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5d911370f1f6a68d1975ab61983bae5c66b0d285) | Загрузка и skeleton: test(ui): компонентные тесты состояний загрузки + переведены пропущенные спиннеры | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [50f1c454](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/50f1c45450c3ec9e2e7e555ebe276b46f17b7dae) | Загрузка и skeleton: style: привести импорт скелетона к стилю каждого файла | Presentation/Accessibility / H,C | Adapt through canonical skeletons | Loading/empty/error, reduced motion, custom layouts |
| [15846603](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/158466036dfc95356675df66472c4faee01225f5) | Сборка и зависимости: chore(ci): поднять Node с просроченного 20 до LTS 24 и закрыть часть уязвимостей | Dependency/Contract / U,C | Port required dependency/toolchain changes; retain custom metadata and workflows | Node 24.19, types, build, audit, Installer publication contract |
| [7b6e277c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7b6e277c33092683eb1e3a6b35691a491080fba9) | Сборка и зависимости: chore(deps): react-router 8, React 19.2.8, override valibot; закрепить версию ноды | Dependency/Contract / U,C | Port required dependency/toolchain changes; retain custom metadata and workflows | Node 24.19, types, build, audit, Installer publication contract |
| [b9c78807](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b9c788074e67af3bedbb6acd4c2e0620ceb9b86a) | Сборка и зависимости: chore: обновить базу браузеров caniuse-lite | Dependency/Contract / U,C | Port required dependency/toolchain changes; retain custom metadata and workflows | Node 24.19, types, build, audit, Installer publication contract |
| [1681bf16](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1681bf16d22c7be3038581ed6cbab7268ea3747a) | Сборка и зависимости: chore(deps): обновить 34 зависимости в пределах мажоров — уязвимостей 3 -> 0 | Dependency/Contract / U,C | Port required dependency/toolchain changes; retain custom metadata and workflows | Node 24.19, types, build, audit, Installer publication contract |
| [8e938a50](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8e938a509cbac68e95fb41a9dbd73d8bf97b1acc) | Сборка и зависимости: chore: одобрить install-скрипты esbuild и fsevents | Dependency/Contract / U,C | Port required dependency/toolchain changes; retain custom metadata and workflows | Node 24.19, types, build, audit, Installer publication contract |
| [5489db6b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5489db6b36e7a75fc95475dd408ee56f61011206) | Тикеты и профиль: fix(admin): сделать имя пользователя в тикете ссылкой на его профиль | Behavior/Accessibility / H | Port navigable user identity | Authorized admin link, missing identity |
| [48ef4639](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/48ef4639b21f8221dd7bfc02ac6bff9a65ddb79b) | Merge: учитывать изменения входящих commits один раз: Merge pull request #558 from haku4130/fix/admin-ticket-user-profile-link | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [12b310b2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/12b310b2999f371ea47b96dc6c3cc02415e10929) | Подарки: fix(gift): ссылка на подарок из кабинета не открывалась в боте | Behavior/Platform/Contract / U,H | Port canonical claim artifacts; retain custom presentation | Gift link/code from real API shape, Telegram activation |
| [9d86ba60](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9d86ba6083741aa779f01079dffffeed4dca7b46) | Сборка и зависимости: test(env): вернуть Storage от jsdom в тестах на node 25+ | Dependency/Contract / U,C | Port required dependency/toolchain changes; retain custom metadata and workflows | Node 24.19, types, build, audit, Installer publication contract |
| [673a772c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/673a772c5b4b0855d9ec176a16e78b4019c202f1) | Storage и авторизация: fix(storage): не ронять приложение, когда браузер запретил хранилище | Security/Contract / U,H | Port storage adapter and every affected call site | Denied/quota storage, auth/OAuth, bounded reload |
| [58e12880](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/58e12880beb83fce0d89ea46749f8e963b844938) | Storage и авторизация: fix(storage): не считать хранилище мёртвым из-за одного отказа записи | Security/Contract / U,H | Port storage adapter and every affected call site | Denied/quota storage, auth/OAuth, bounded reload |
| [803cb2e3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/803cb2e367cfaa8d1b5aa1d625ba4cc6b33f2ae9) | Storage и авторизация: fix(storage): не принимать запись в память за сохранность там, где нужен reload | Security/Contract / U,H | Port storage adapter and every affected call site | Denied/quota storage, auth/OAuth, bounded reload |
| [31a3a3e0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/31a3a3e07c48b277ef8bed6fb0685132ba512cc3) | Storage и авторизация: fix(storage): перевести оставшиеся незащищённые обращения и поставить храповик | Security/Contract / U,H | Port storage adapter and every affected call site | Denied/quota storage, auth/OAuth, bounded reload |
| [1df30e1c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1df30e1cca94ea5f8fcbe29495d35c4c52e6f0eb) | Очистка и конфигурация репозитория: chore: убрать из репозитория случайно закоммиченный Архив.zip | Dependency/Presentation / U,H,C | Apply only after local consumer review; preserve custom docs and CI | No lost exports/consumers; check/build |
| [1003bfc5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1003bfc53903fc6337156c2aedd703d93a1f7461) | Реферальные функции: feat(referral): render day rewards and chain levels | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [99eacfa1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/99eacfa1602d340476967a2942d1026a68c32acd) | Реферальные функции: feat(admin): reward level editor in the cabinet | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [8fdf978b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8fdf978b8ad8282f108c67113d58ea45feecea4e) | Реферальные функции: fix(referral): close what the UX review found in the cabinet | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [3a5fc7ad](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3a5fc7ad465374005fe539ab970d8a8a9538166d) | Реферальные функции: fix(referral): make the level editor's numeric fields honest | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [c3c79944](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c3c799449a09469a500a7d456a0675f2e0f46009) | Реферальные функции: feat(admin): import legacy referral settings from the cabinet | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [d5e3b022](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d5e3b022f04ec87edb2ae839f5b4a30cc03c7403) | Реферальные функции: feat(admin): explain where day rewards land when no tariff is set | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [b65137ee](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b65137ee086ffcd3347a54066ffaeaff9991fb18) | Реферальные функции: feat(admin): surface what the legacy import could not carry over | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [7c679691](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7c6796917733490d621b5b00ecbc793724a2876c) | Реферальные функции: fix(admin): close three traps in the cabinet level editor | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [caf21ec3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/caf21ec313abb9e84a6d26dd560cd33399b98c3e) | Реферальные функции: feat(admin): set the referral chain depth from the level editor | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [8f6181f5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8f6181f5dcd74976b60584fb0684ed533e05a87d) | Реферальные функции: feat(admin): set how many referrals unlock a reward level | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [c3eb6c58](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c3eb6c5831646cef9aff49b59fc5706b30c7542f) | Реферальные функции: fix(admin): put the reward-level editor in the admin main menu | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [28cb8dc4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28cb8dc4a35555d4622bb3337e58bc79b9b52101) | Реферальные функции: feat(referral): режим рангов в редакторе уровней и на экране партнёра | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [20ad9598](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/20ad9598a0d30ca8881ea524b2db586393246b1d) | Реферальные функции: feat(referral): понятная карточка условий и «Ваш уровень» вместо глубины сети | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [097cd1e5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/097cd1e52735d82aafd82cf11be9008acacf4db7) | Реферальные функции: feat(referral): предупреждать о выключенном мультитарифе в редакторе уровней | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [b35b19bc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b35b19bc587575134c7fee39fb2b62f128ef1efb) | Реферальные функции: feat(referral): блокировать поле глубины, закреплённое в .env | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [7d51713c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7d51713cb8470f561e85abf8f4b07d701547956d) | Реферальные функции: feat(referral): карточка настроек наград на экране партнёра | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [4db4fd1f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4db4fd1f2b072e2e86c18bcf21abe4473ca71bb0) | Реферальные функции: feat(referral): выбор награды карточками с иконками, деньги или дни | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [e31c76c6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e31c76c6d71c67799bb15d704bb268fca717382b) | Реферальные функции: feat(referral): суммы на карточках выбора и подписка только под дни | Behavior/Contract/Localization / U,H | Port API and all states; adapt to our UI | Money/days, chain/tiers, partial writes, permissions, locales |
| [bd86d3d2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bd86d3d27ca8bf9d71912a9a1d4392439704c208) | Grace-доступ: feat(admin): раздел grace-доступа в админменю | Behavior/Contract/Localization / U,H | Port API/form and permissions | Env locks, validation 422, pending modes, read/write roles |
| [73c57153](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/73c57153925ef864b0dfe5d659c98078923ff08a) | Grace-доступ: fix(admin): выбор аварийного сквада и очистка числовых полей | Behavior/Contract/Localization / U,H | Port API/form and permissions | Env locks, validation 422, pending modes, read/write roles |
| [f466b78e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f466b78e38e6c7efff4ddb0bfdfec58f9aaedc7f) | Grace-доступ: fix(admin): разбирать 422 от бэкенда и сторожить переводы раздела | Behavior/Contract/Localization / U,H | Port API/form and permissions | Env locks, validation 422, pending modes, read/write roles |
| [4d99cfca](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4d99cfca33c362b253e53618c50baf82f01dc128) | Grace-доступ: fix(admin): «оставить как есть» распознавать без учёта регистра | Behavior/Contract/Localization / U,H | Port API/form and permissions | Env locks, validation 422, pending modes, read/write roles |
| [2f95c6a6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f95c6a6742f6293bdec9e74eb22fb8f0fabdee3) | Grace-доступ: feat(admin): предупреждать, когда весь раздел закреплён в .env | Behavior/Contract/Localization / U,H | Port API/form and permissions | Env locks, validation 422, pending modes, read/write roles |
| [9793e8bb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9793e8bbe6e01f4504bbe034c18fa07c3d11a05a) | Grace-доступ: fix(admin): закрыть находки ревью раздела grace-доступа | Behavior/Contract/Localization / U,H | Port API/form and permissions | Env locks, validation 422, pending modes, read/write roles |
| [701b2c61](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/701b2c6105cacdc31f85ae16ca923a7b1fdf4d29) | Merge: учитывать изменения входящих commits один раз: Merge pull request #560 from BEDOLAGA-DEV/dev | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [44a7d750](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/44a7d750fb82bc482ed2dabc72724540c21c289a) | Upstream Release metadata: сохранить наше издание: chore(main): release 1.67.0 | Metadata / C | Skip upstream release publishing; record provenance in our report | Custom immutable release policy |
| [35e5aa9e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/35e5aa9e78123fdf18506a7a8a46875d268689ed) | Merge: учитывать изменения входящих commits один раз: Merge pull request #561 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [d2e25abe](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d2e25abe94f72a0a76ce413c5c7db0b4959dcef6) | Системные ошибки: feat(admin): страница системных ошибок | Security/Contract/Behavior / U,H | Port routes, API, retry permission and delivery outcomes | Read/retry denial, pagination, failure paths |
| [7c63bcd4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7c63bcd474dbbe95a8455c839dac418435f2a615) | Системные ошибки: feat(admin): кнопка повторной доставки ошибки | Security/Contract/Behavior / U,H | Port routes, API, retry permission and delivery outcomes | Read/retry denial, pagination, failure paths |
| [6b08bee8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6b08bee8397292beea0fbadd44a82be4faa6118e) | Системные ошибки: fix(admin): неверный путь API у страницы системных ошибок | Security/Contract/Behavior / U,H | Port routes, API, retry permission and delivery outcomes | Read/retry denial, pagination, failure paths |
| [eaeb0f11](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/eaeb0f119c2f11d97f4df455aa6a4e06c26ff4b1) | Merge: учитывать изменения входящих commits один раз: Merge pull request #566 from BEDOLAGA-DEV/main | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [c39107de](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c39107def07f427c52b0acb2b9480223c9764c55) | Системные ошибки: fix(admin): гейт кнопки повтора, видимый исход доставки и дебаунс поиска | Security/Contract/Behavior / U,H | Port routes, API, retry permission and delivery outcomes | Read/retry denial, pagination, failure paths |
| [a337b96f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a337b96f9b76d2350c21e280fbd33548d5fec5c1) | Merge: учитывать изменения входящих commits один раз: Merge pull request #565 from haku4130/upstream-pr/admin-system-errors | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [379ab0e9](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/379ab0e9e61f00ea3dfdf44f99bc3f9b3b813d71) | Старт, переводы, полифил: fix(i18n): не рисовать интерфейс раньше словарей и темы | Platform/Localization/Contract / U,H | Adapt bounded startup waits; preserve contact capture and SDK guards | Cold cache, delayed/failed locale, differing Telegram language, old WebView |
| [f23b3c0b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f23b3c0b3454470741745a066bd158879b44209b) | Старт, переводы, полифил: fix(build): вернуть тело полифила Object.hasOwn | Platform/Localization/Contract / U,H | Adapt bounded startup waits; preserve contact capture and SDK guards | Cold cache, delayed/failed locale, differing Telegram language, old WebView |
| [881122f7](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/881122f730f22f1d265e4120e51e52159778406c) | Merge: учитывать изменения входящих commits один раз: Merge pull request #567 from BEDOLAGA-DEV/fix/i18n-fouc-cold-cache | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [47f8760d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/47f8760d8816eafa6b58b13290e313ae4eb73fb3) | Платежи: feat(payments): TabPay в кабинете | Behavior/Contract / U,H | Port provider support and labels | Sandbox success/pending/failure/cancel; existing providers |
| [04dd8882](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/04dd8882ed0a971e3c68d7262e409cbb3ef3f5b9) | Платежи: feat(payments): ParityPay в кабинете | Behavior/Contract / U,H | Port provider support and labels | Sandbox success/pending/failure/cancel; existing providers |
| [906e6bdf](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/906e6bdfdda519d559c633ff893eef2036769561) | Очистка и конфигурация репозитория: fix(repo): убрать закоммиченный симлинк node_modules | Dependency/Presentation / U,H,C | Apply only after local consumer review; preserve custom docs and CI | No lost exports/consumers; check/build |
| [6fb9fb3a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6fb9fb3a4ec2b2ca65ef5061dac649a832f433a4) | Очистка и конфигурация репозитория: chore(biome): не проверять то, что не входит в репозиторий | Dependency/Presentation / U,H,C | Apply only after local consumer review; preserve custom docs and CI | No lost exports/consumers; check/build |
| [040691c6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/040691c6366c90ab9557befcc569a2cb98e951eb) | Merge: учитывать изменения входящих commits один раз: Merge pull request #568 from BEDOLAGA-DEV/dev | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [8f064bac](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8f064bacda70a206a5e0500b33b32b5f911e8f62) | Upstream Release metadata: сохранить наше издание: chore(main): release 1.68.0 | Metadata / C | Skip upstream release publishing; record provenance in our report | Custom immutable release policy |
| [d53f6f6a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d53f6f6a229b4eefd8cb2f203d00e513ecaab94c) | Merge: учитывать изменения входящих commits один раз: Merge pull request #569 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [b0570ee0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b0570ee0aa596a8ea96d0d8ec94542c68c8722d4) | Темы и первый кадр: fix(admin): кастомные цвета темы не сохранялись при дефолтной палитре | Presentation/Accessibility/Contract / H,C | Adapt operator palette to existing custom tokens | Dark/light/operator colors and first paint |
| [2f4f52a9](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f4f52a9a302264b67160d0990ac57081236d1ac) | Темы и первый кадр: fix(theme): операторский фон светлой темы перекрывался заглушкой index.html | Presentation/Accessibility/Contract / H,C | Adapt operator palette to existing custom tokens | Dark/light/operator colors and first paint |
| [414802bc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/414802bcff8e1712bf0b718b604a057870d12b58) | Темы и первый кадр: fix(theme): палитра статусных цветов теперь строится от выбранного цвета | Presentation/Accessibility/Contract / H,C | Adapt operator palette to existing custom tokens | Dark/light/operator colors and first paint |
| [fcef18a1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fcef18a11e95004c8ae98956d41d41f72bd4713b) | Темы и первый кадр: fix(theme): стеклянные карточки берут цвет текста из палитры оператора | Presentation/Accessibility/Contract / H,C | Adapt operator palette to existing custom tokens | Dark/light/operator colors and first paint |
| [58f3f58a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/58f3f58aaebffec312c676e63e5e5b89566222d9) | Merge: учитывать изменения входящих commits один раз: Merge pull request #571 from BEDOLAGA-DEV/dev | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [486859ae](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/486859aef20b45487e891915f0fc06f8b281a879) | Upstream Release metadata: сохранить наше издание: chore(main): release 1.68.1 | Metadata / C | Skip upstream release publishing; record provenance in our report | Custom immutable release policy |
| [2a468bab](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2a468babc91f418a5b89384a37f97ef90efb6510) | Merge: учитывать изменения входящих commits один раз: Merge pull request #572 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [1ca7e489](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1ca7e489af577dda7c58302ecba161a3403f056d) | Branding и мобильные отступы: fix(branding): бренд инсталляции во вкладке, фавиконе и ярлыках вместо «VPN»/«V» | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [59c42b19](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/59c42b197c9003d570c976811609b42cec44d791) | Branding и мобильные отступы: fix(ui): мобильная шапка не срезается статус-баром в standalone-режиме iOS | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [38a6738c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/38a6738c4ae98f9ebc61a068aa60fca99e4c47e3) | Branding и мобильные отступы: fix(branding): иконки ярлыков без прозрачных углов — iOS и Android заливали их белым | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [28fd9680](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28fd9680f1a2b45068b612e44c6f5ce049e66f2e) | Branding и мобильные отступы: fix(ui): полоса под статус-баром iOS вместо растянутого стекла шапки | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [accd1e99](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/accd1e99c2866ddc5ede338e7434980394596d74) | Branding и мобильные отступы: fix(ui): ярлык iOS — шапка сливается со статус-баром, панель ближе к краю | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [d62c8d39](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d62c8d39e6e99c91f567a1a4ac13e099ef630cff) | Темы и первый кадр: fix(theme): палитра оператора применяется до первой отрисовки | Presentation/Accessibility/Contract / H,C | Adapt operator palette to existing custom tokens | Dark/light/operator colors and first paint |
| [2d71d63b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2d71d63b68370b9cb3c679a52410eaa80edd7078) | Branding и мобильные отступы: fix(ui): боковые вырезы в альбомной ориентации iPhone | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [b7d13915](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b7d1391518819689d807d4b5589e9d96aa551e51) | Branding и мобильные отступы: fix(ui): прижатые к низу элементы не прячутся за мобильной панелью | Platform/Accessibility/Presentation / H,C | Adapt runtime branding and safe area to existing shell | Neutral artifact, tenant branding, iOS standalone, Telegram, landscape |
| [5e8b026c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5e8b026c4592369650e3df15aee88b1c6c62f943) | Merge: учитывать изменения входящих commits один раз: Merge pull request #573 from BEDOLAGA-DEV/dev | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [8d697380](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8d697380d8ddf2d13a2146a2467ec51316fcac55) | Upstream Release metadata: сохранить наше издание: chore(main): release 1.68.2 | Metadata / C | Skip upstream release publishing; record provenance in our report | Custom immutable release policy |
| [804ea3b5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/804ea3b5b7b5de32b001ea9ad7927c3f49e20f5f) | Merge: учитывать изменения входящих commits один раз: Merge pull request #574 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [3f073019](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3f0730191d0d0ff04fd7353d848c4fc8eb760142) | Email: feat(admin): редактор email-шаблонов понимает общую обёртку писем | Security/Contract/Behavior / U,H | Port wrapper/preview/toggle with Bot v4.4.0 | Required vars, protected emails, preview sanitization, API errors |
| [f18d64c3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f18d64c3dd1d5ebab64d0c976cd0940e860b9269) | Email: feat(admin): превью письма рассылки рендерит бот — в общей обёртке | Security/Contract/Behavior / U,H | Port wrapper/preview/toggle with Bot v4.4.0 | Required vars, protected emails, preview sanitization, API errors |
| [745e8397](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/745e8397916754a9fb6d654e08f60afd15e9d14e) | Email: feat(admin): переключатель «отправлять это письмо» в редакторе email-шаблонов | Security/Contract/Behavior / U,H | Port wrapper/preview/toggle with Bot v4.4.0 | Required vars, protected emails, preview sanitization, API errors |
| [477164fc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/477164fc46f2a6a31e9550a9e8e4ff6ac7de6d5e) | Merge: учитывать изменения входящих commits один раз: Merge pull request #575 from BEDOLAGA-DEV/dev | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |
| [d77a6a2e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d77a6a2e782a6b78698889ed57113b9d86625e9b) | Upstream Release metadata: сохранить наше издание: chore(main): release 1.69.0 | Metadata / C | Skip upstream release publishing; record provenance in our report | Custom immutable release policy |
| [2787b617](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2787b61751c4c2f82605004a3bb0c03a2395dc8d) | Merge: учитывать изменения входящих commits один раз: Merge pull request #576 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Metadata / U | Record ancestry; do not duplicate constituent changes | Constituent commits covered |

### Incremental v1.69.1 commit impact matrix

Reference: Upstream Cabinet v1.69.0
`2787b61751c4c2f82605004a3bb0c03a2395dc8d` to v1.69.1
`3da34239d1c1c7b87a0184e74d49bde43ea88b89`.

| Upstream source | Scope | Applied decision | Verification |
| --- | --- | --- | --- |
| [`a24058c9`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a24058c9855199e725b8f0316041b2036ee97d77) | Telegram legal consent | Adapt all callback/redirect/widget entries through one gate, preserving Custom auth/storage behavior | Unit + 3 Chrome flows |
| [`1a9c9228`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1a9c922852d90f227dee35150ae471cbe3d256f5) | Structured API errors | Central string guard; replace 12 raw detail reads in 9 paths | Guard test + browser render |
| [`1137b70e`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1137b70ee2c1cb729a4760e2cd250f2099ce62b3) | Bot avatar fallback | Adapt hook/API into Custom header | Hook tests + browser header |
| [`7efd51f6`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7efd51f6d4f4508fbc68509ff62588d886cd301b) | Branding before React | Adapt early name to runtime DocumentBranding ownership | Early-brand unit + browser first paint |
| [`fb4ea701`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fb4ea701a5c582107b7bade1139c209ca3d62147) | Dedicated favicon | Port Bot endpoint and CORS-safe logo separation | Build HTML + Chrome request; real Safari pending |
| [`06b331fc`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/06b331fceb85da28563a3f5024cc46a5bdc231ca) | Poisoned cache recovery | Port reload-cache retry and shared in-flight request | Branding preload unit tests |
| [`fccc16b7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fccc16b7d9436203b57a862285b84536d4f4f9c7) | PNG-only hint | Port bounded PNG hint; exclude SVG | Document-branding unit tests |
| [`5869af43`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5869af43387a56f63fa2cf3a89dbb9b210c02e3c) | Safari tile radius | Port smaller radius, preserve black/white Custom monogram | Unit/build contracts |
| [`0b577e07`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0b577e0721531158a3dc5b053ff7e05a8cf4e594) | Inline-script test parser | Port verbatim | Vitest jsdom |
| [`52ce005b`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/52ce005b6a792d9d961872fe5e166221f3429657) | Merge PR #580 | Record ancestry only | Constituent commits covered |
| [`00ebbecd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/00ebbecdea95960a848854e51520e334f7b8d565) | Release 1.69.1 metadata | Set package version; preserve Custom release docs and Tiptap security refresh | Audit, lock dry-run, build |
| [`3da34239`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3da34239d1c1c7b87a0184e74d49bde43ea88b89) | Merge release PR #581 | Record exact target/ancestry only | Remote tag/SHA verified |

## File-level decisions

This ledger is reconciled against the final uncommitted candidate tree, the
target Upstream Cabinet tree and the receiving Custom Cabinet base. Totals:
110 verbatim upstream files, 112 adapted files, 6 preserved custom-base files,
4 applied upstream deletions and 1 preserved custom deletion. Deleted upstream
files passed consumer search, types and build; the removed upstream release
workflow stays removed.

| Path | Three-way result | Integration status |
| --- | --- | --- |
| .github/workflows/ci.yml | direct | applied verbatim; verified |
| .github/workflows/lint.yml | direct | applied verbatim; verified |
| .github/workflows/release.yml | custom-delete-preserve | custom deletion retained; upstream release workflow intentionally absent |
| .github/workflows/security-audit.yml | direct | applied verbatim; verified |
| .gitignore | merged-review | adapted to Custom Cabinet; verified |
| .nvmrc | direct | applied verbatim; verified |
| CHANGELOG.md | conflict-review | custom version retained; v1.69.0 release entry intentionally deferred |
| Dockerfile | merged-review | adapted to Custom Cabinet; verified |
| biome.json | merged-review | adapted to Custom Cabinet; verified |
| index.html | conflict-review | adapted to Custom Cabinet; verified |
| package-lock.json | conflict-review | adapted to Custom Cabinet; verified |
| package.json | conflict-review | adapted to Custom Cabinet; verified |
| src/App.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/AppWithNavigator.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/api/adminBroadcasts.ts | direct | applied verbatim; verified |
| src/api/adminEmailTemplates.ts | direct | applied verbatim; verified |
| src/api/adminGraceAccess.ts | direct | applied verbatim; verified |
| src/api/adminSystemErrors.ts | direct | applied verbatim; verified |
| src/api/banSystem.ts | direct | applied verbatim; verified |
| src/api/branding.ts | conflict-review | adapted to Custom Cabinet; verified |
| src/api/gift.ts | direct | applied verbatim; verified |
| src/api/index.ts | direct | applied verbatim; verified |
| src/api/menuLayout.ts | direct | applied verbatim; verified |
| src/api/partners.ts | direct | applied verbatim; verified |
| src/api/partnersReferralMode.test.ts | direct | applied verbatim; verified |
| src/api/referral.ts | direct | applied verbatim; verified |
| src/api/themeColors.ts | merged-review | applied verbatim; verified |
| src/components/DocumentBranding.tsx | direct | applied verbatim; verified |
| src/components/ErrorBoundary.tsx | direct | applied verbatim; verified |
| src/components/Onboarding.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/PaymentMethodIcon.tsx | direct | applied verbatim; verified |
| src/components/PromoOffersSection.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/components/TicketNotificationBell.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/admin/ListRowSkeleton.tsx | direct | applied verbatim; verified |
| src/components/admin/MenuEditorTab.tsx | direct | applied verbatim; verified |
| src/components/admin/ThemeTab.test.tsx | direct | applied verbatim; verified |
| src/components/admin/ThemeTab.tsx | merged-review | applied verbatim; verified |
| src/components/admin/bulkActions/FloatingActionBar.tsx | direct | applied verbatim; verified |
| src/components/admin/constants.ts | direct | applied verbatim; verified |
| src/components/admin/remnawave/GeoCheckImageViewer.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/components/admin/remnawave/geoCheckRoute.test.ts | conflict-review | stricter custom route cases retained; verified |
| src/components/admin/userDetail/GiftsTab.tsx | direct | applied verbatim; verified |
| src/components/admin/userDetail/InfoTab.tsx | direct | applied verbatim; verified |
| src/components/admin/userDetail/ReferralsTab.tsx | direct | applied verbatim; verified |
| src/components/admin/userDetail/SubscriptionTab.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/broadcasts/BroadcastPreview.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/connection/TvQuickConnect.tsx | direct | applied verbatim; verified |
| src/components/data-display/StatCard/StatCard.tsx | direct | applied verbatim; verified |
| src/components/icons/extended-icons.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/layout/AppShell/AppHeader.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/layout/AppShell/AppShell.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/components/layout/AppShell/MobileBottomNav.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/components/partner/CampaignDetailStats.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/AddonsTab.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/DepositsTab.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/DualAreaChart.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/sales-stats/MultiSeriesAreaChart.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/sales-stats/PaymentHealthTab.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/RenewalsTab.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/SalesTab.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/SimpleAreaChart.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/sales-stats/SimpleBarChart.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/StackedBarChart.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/sales-stats/StatsTabSkeleton.tsx | direct | applied verbatim; verified |
| src/components/sales-stats/TrialsTab.tsx | direct | applied verbatim; verified |
| src/components/stats/DailyChart.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/stats/StatCard.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/components/subscription/SubscriptionConnectFooter.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/components/subscription/purchase/ClassicPurchaseWizard.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/subscription/sheets/ServerManagementSheet.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/subscription/sheets/SwitchTariffSheet.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/components/ui/BentoSkeleton.tsx | upstream-delete-review | upstream deletion applied; consumers absent; verified |
| src/components/ui/Skeleton.tsx | upstream-delete-review | upstream deletion applied; consumers absent; verified |
| src/components/ui/skeleton/PageSkeleton.tsx | direct | applied verbatim; verified |
| src/components/ui/skeleton/Skeleton.test.tsx | direct | applied verbatim; verified |
| src/components/ui/skeleton/Skeleton.tsx | direct | applied verbatim; verified |
| src/components/ui/skeleton/index.ts | direct | applied verbatim; verified |
| src/components/ui/skeleton/skeletonStyles.test.ts | direct | applied verbatim; verified |
| src/components/ui/skeleton/skeletonStyles.ts | direct | applied verbatim; verified |
| src/components/ui/skeleton/skeletonUsage.test.ts | direct | applied verbatim; verified |
| src/config/constants.ts | direct | applied verbatim; verified |
| src/constants/paymentMethods.ts | direct | applied verbatim; verified |
| src/data/colorPresets.ts | upstream-delete-review | upstream deletion applied; consumers absent; verified |
| src/hooks/useBranding.ts | direct | applied verbatim; verified |
| src/hooks/useDocumentBranding.test.tsx | direct | applied verbatim; verified |
| src/hooks/useDocumentBranding.ts | direct | applied verbatim; verified |
| src/hooks/useHeaderHeight.test.ts | direct | applied verbatim; verified |
| src/hooks/useHeaderHeight.ts | direct | applied verbatim; verified |
| src/hooks/useTheme.ts | merged-review | applied verbatim; verified |
| src/hooks/useThemeColors.test.ts | direct | adapted to Custom Cabinet; verified |
| src/hooks/useThemeColors.ts | conflict-review | adapted to Custom Cabinet; verified |
| src/hooks/useUserThemePreferences.ts | upstream-delete-review | upstream deletion applied; consumers absent; verified |
| src/i18n.test.ts | direct | adapted to Custom Cabinet; verified |
| src/i18n.ts | direct | adapted to Custom Cabinet; verified |
| src/i18nColdCache.test.tsx | direct | applied verbatim; verified |
| src/locales/en.json | merged-review | adapted to Custom Cabinet; verified |
| src/locales/fa.json | merged-review | adapted to Custom Cabinet; verified |
| src/locales/ru.json | merged-review | adapted to Custom Cabinet; verified |
| src/locales/zh.json | merged-review | adapted to Custom Cabinet; verified |
| src/main.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/AdminApps.tsx | direct | applied verbatim; verified |
| src/pages/AdminAuditLog.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminBanSystem.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminBroadcastDetail.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminCampaignEdit.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminCampaignStats.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminCampaigns.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminChannelSubscriptions.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminCouponDetail.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminCoupons.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminDashboard.tsx | direct | applied verbatim; verified |
| src/pages/AdminEmailTemplates.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminGraceAccess.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/AdminInfoPageEditor.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminInfoPages.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminLandingStats.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminLandings.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminLegalPages.tsx | direct | applied verbatim; verified |
| src/pages/AdminNews.tsx | direct | applied verbatim; verified |
| src/pages/AdminNewsCreate.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPanel.tsx | direct | applied verbatim; verified |
| src/pages/AdminPartnerCampaignAssign.tsx | direct | applied verbatim; verified |
| src/pages/AdminPartnerDetail.tsx | direct | applied verbatim; verified |
| src/pages/AdminPartnerSettings.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPartners.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPaymentMethodEdit.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPaymentMethods.tsx | direct | applied verbatim; verified |
| src/pages/AdminPolicies.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPolicyEdit.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminPromoGroupCreate.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPromoGroups.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminPromoOfferSend.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPromoOfferTemplateEdit.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminPromoOffers.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPromocodeCreate.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminPromocodeStats.tsx | direct | applied verbatim; verified |
| src/pages/AdminPromocodes.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminReferralLevels.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/AdminRemnawave.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminRemnawaveSquadDetail.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminRoleEdit.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminRoles.tsx | direct | applied verbatim; verified |
| src/pages/AdminServerEdit.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminServers.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminSystemErrors.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/AdminTariffCreate.tsx | direct | applied verbatim; verified |
| src/pages/AdminTariffs.tsx | merged-review | applied verbatim; verified |
| src/pages/AdminTicketSettings.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminTickets.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/AdminTrafficUsage.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminUpdates.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/AdminUserDetail.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminUsers.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminWheel.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/AdminWithdrawalDetail.tsx | direct | applied verbatim; verified |
| src/pages/AdminWithdrawals.tsx | merged-review | applied verbatim; verified |
| src/pages/Balance.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/ConnectedAccounts.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/Connection.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/Contests.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/CouponStatus.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/Dashboard.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/GiftClaim.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/GiftSubscription.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/Info.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/InfoPageView.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/LinkTelegramCallback.tsx | direct | applied verbatim; verified |
| src/pages/Login.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/MergeAccounts.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/NewsArticle.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/Polls.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/Profile.tsx | conflict-review | custom page retained; incoming loader moved to ProfileNotifications |
| src/pages/PublicLegal.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/QuickPurchase.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/Referral.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/ReferralNetwork/components/CampaignDetailPanel.tsx | direct | applied verbatim; verified |
| src/pages/ReferralNetwork/components/ScopeSelector.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/ReferralNetwork/components/UserDetailPanel.tsx | direct | applied verbatim; verified |
| src/pages/RenewSubscription.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/SavedCards.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/Subscription.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/SubscriptionPurchase.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/Subscriptions.tsx | direct | applied verbatim; verified |
| src/pages/Support.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/TelegramRedirect.tsx | direct | applied verbatim; verified |
| src/pages/TopUpAmount.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/TopUpMethodSelect.tsx | conflict-review | adapted to Custom Cabinet; verified |
| src/pages/Wheel.tsx | merged-review | adapted to Custom Cabinet; verified |
| src/pages/adminGraceAccess.test.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/adminNavCoverage.test.ts | direct | applied verbatim; verified |
| src/pages/adminReferralLevels.test.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/adminSystemErrors.test.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/adminTicketUserLink.test.tsx | direct | applied verbatim; verified |
| src/pages/blockedStorageRendering.test.tsx | direct | applied verbatim; verified |
| src/pages/loadingStates.test.tsx | direct | applied verbatim; verified |
| src/pages/referralDayRewards.test.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/referralRewardSettings.test.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/referralTerms.test.tsx | direct | adapted to Custom Cabinet; verified |
| src/pages/referralTierProgress.test.ts | direct | adapted to Custom Cabinet; verified |
| src/providers/ThemeColorsProvider.tsx | direct | applied verbatim; verified |
| src/store/auth.ts | merged-review | adapted to Custom Cabinet; verified |
| src/store/authBlockedStorage.test.ts | direct | applied verbatim; verified |
| src/styles/globals.css | merged-review | adapted to Custom Cabinet; verified |
| src/test/setup.ts | direct | applied verbatim; verified |
| src/types/index.ts | direct | applied verbatim; verified |
| src/types/theme.ts | merged-review | adapted to Custom Cabinet; verified |
| src/utils/brandingHtml.test.ts | direct | applied verbatim; verified |
| src/utils/colorConversion.ts | conflict-review | adapted to Custom Cabinet; verified |
| src/utils/documentBranding.test.ts | direct | applied verbatim; verified |
| src/utils/documentBranding.ts | direct | applied verbatim; verified |
| src/utils/favicon.ts | conflict-review | applied verbatim; verified |
| src/utils/giftShare.test.ts | direct | applied verbatim; verified |
| src/utils/giftShare.ts | direct | applied verbatim; verified |
| src/utils/glassTheme.test.ts | conflict-review | custom semantic light/dark assertions retained; verified |
| src/utils/glassTheme.ts | conflict-review | custom semantic light/dark colors retained; verified |
| src/utils/inputHelpers.ts | merged-review | adapted to Custom Cabinet; verified |
| src/utils/navigation.ts | merged-review | adapted to Custom Cabinet; verified |
| src/utils/nodeVersion.test.ts | conflict-review | stricter custom Node cases retained; verified |
| src/utils/oauth.ts | direct | applied verbatim; verified |
| src/utils/rateLimit.ts | direct | applied verbatim; verified |
| src/utils/safeStorage.test.ts | direct | applied verbatim; verified |
| src/utils/safeStorage.ts | direct | applied verbatim; verified |
| src/utils/storageGuards.test.ts | direct | applied verbatim; verified |
| src/utils/supportContact.test.ts | direct | applied verbatim; verified |
| src/utils/themeColorsHint.test.ts | direct | applied verbatim; verified |
| src/utils/themeColorsHint.ts | direct | applied verbatim; verified |
| src/utils/token.ts | merged-review | adapted to Custom Cabinet; verified |
| tsconfig.json | direct | applied verbatim; verified |
| tsconfig.node.json | direct | applied verbatim; verified |
| vite-plugins/brandMonogram.ts | direct | adapted to Custom Cabinet; verified |
| vite-plugins/brandingHtml.ts | direct | applied verbatim; verified |
| vite.config.ts | merged-review | adapted to Custom Cabinet; verified |
| vitest.config.ts | direct | applied verbatim; verified |

### Incremental v1.69.1 file decisions

| Path | Decision | Result |
| --- | --- | --- |
| `CHANGELOG.md` | custom-base-preserved | Custom release history retained until an authorized immutable Release |
| `README.md` | custom-base-preserved | Custom install/branding documentation retained |
| `index.html` | adapted | Early brand/favicon plus Custom first-paint colors and pre-subresource contact privacy |
| `nginx.conf` | upstream-verbatim | No-cache `index.html` response |
| `package-lock.json` | adapted | 1.69.1 metadata with Tiptap 3.31.3 retained |
| `package.json` | adapted | 1.69.1 metadata with direct Tiptap `^3.30.4` retained |
| `src/api/auth.ts` | adapted | Bot avatar endpoint added to current auth client |
| `src/api/branding.ts` | adapted | Reload-cache retry and shared in-flight preload |
| `src/api/brandingPreloadLogo.test.ts` | adapted | Cache/race regressions under Custom test setup |
| `src/components/LegalConsentGate.tsx` | adapted | Canonical Custom Card/Button presentation |
| `src/components/PromoOffersSection.tsx` | adapted | Safe error helper in current promo UI |
| `src/components/TelegramLoginButton.tsx` | adapted | Gate retains widget/deep-link and abortable poll behavior |
| `src/components/admin/userDetail/ReferralsTab.tsx` | upstream-verbatim | Safe structured error rendering |
| `src/components/layout/AppShell/AppHeader.tsx` | adapted | Avatar fallback in Custom navigation/safe-area shell |
| `src/components/telegramLoginButtonConsent.test.tsx` | adapted | Exact original widget payload retry |
| `src/hooks/useDocumentBranding.test.tsx` | upstream-verbatim | Runtime/early ownership contract |
| `src/hooks/useDocumentBranding.ts` | upstream-verbatim | Runtime marks branding ready |
| `src/hooks/useLegalConsentGate.ts` | adapted | Current i18n/API retry integration |
| `src/hooks/useUserAvatar.test.tsx` | adapted | Custom success/failure/unmount coverage |
| `src/hooks/useUserAvatar.ts` | adapted | Authenticated Bot fallback with initials on failure |
| `src/pages/AdminPromoOfferSend.tsx` | adapted | Safe structured error helper |
| `src/pages/ConnectedAccounts.tsx` | adapted | Safe error with existing linking/storage flow |
| `src/pages/Dashboard.tsx` | adapted | Safe error without changing unified Dashboard |
| `src/pages/Login.tsx` | adapted | Legal gate with SafeStorage/OAuth/Custom layout preserved |
| `src/pages/ResetPassword.tsx` | adapted | Safe structured error helper |
| `src/pages/Subscriptions.tsx` | upstream-verbatim | Safe structured error rendering |
| `src/pages/TelegramCallback.tsx` | adapted | Consent plus raw-search attempt guard against re-render duplicates |
| `src/pages/TelegramRedirect.tsx` | adapted | Consent integrated into current redirect flow |
| `src/pages/TopUpAmount.tsx` | adapted | Safe error without payment-flow changes |
| `src/pages/VerifyEmail.tsx` | upstream-verbatim | Safe structured error rendering |
| `src/pages/telegramCallbackConsent.test.tsx` | adapted | Provider harness and exact request count |
| `src/pages/telegramRedirectConsent.test.tsx` | adapted | Provider harness and same-initData retry |
| `src/test/consentRequiredError.ts` | upstream-verbatim | Shared regression fixture |
| `src/test/earlyBrand.test.ts` | upstream-verbatim | DOMParser-based real inline script extraction |
| `src/types/index.ts` | upstream-verbatim | Avatar transport type |
| `src/utils/api-error.guard.test.ts` | adapted | Current-tree raw-detail ratchet |
| `src/utils/api-error.test.ts` | adapted | Existing fallback plus structured detail cases |
| `src/utils/api-error.ts` | adapted | String-only detail guard in current normalizer |
| `src/utils/brandingHtml.test.ts` | upstream-verbatim | API/favicon build injection |
| `src/utils/documentBranding.test.ts` | upstream-verbatim | Bounded PNG hint and ready state |
| `src/utils/documentBranding.ts` | upstream-verbatim | Runtime brand owner and hint writer |
| `src/utils/favicon.ts` | upstream-verbatim | Safari-friendly raster tile behavior |
| `vite-plugins/brandMonogram.ts` | adapted | Size/radius change with Custom black/white semantics |
| `vite-plugins/brandingHtml.ts` | upstream-verbatim | Runtime API/favicon placeholders |
| `vite.config.ts` | adapted | Branding plugin with Custom chunks/base/build rules retained |

Count: 14 upstream-verbatim, 29 adapted, 2 custom-base-preserved, 0 omitted.
Additional local regression coverage/fix outside the 45 paths touches
`src/utils/contactPrefill.ts`, `src/utils/contactPrefill.test.ts`,
`tests/e2e/quick-purchase-attribution.spec.ts`,
`tests/e2e/cabinetTestHarness.ts` and `tests/e2e/v1691-contracts.spec.ts`.

## Verification

- Original source baseline: 286 tests plus type-check, build and Biome passed
  on Node 24.19.0 before candidate integration.
- Current candidate unit gate: 80 files / 638 tests passed with one worker on
  Node 24.19.0. A two-worker repeat completed 635 assertions and timed out in
  three old `loadingStates` cases at the five-second limit; that complete file
  then passed 48/48 in isolation. The earlier pre-privacy v1.69.1 tree also
  passed 80 files / 637 tests.
- Candidate types/build: both TypeScript projects passed; Vite production build
  passed with 2,898 modules in 12.29 seconds.
- Candidate formatting: the complete 45-path v1.69.1 range passed Biome for all
  41 supported files (inline ES5 compatibility diagnostics are warnings/info,
  not errors); the added E2E suite and harness pass separately. A repository-
  wide check still reports one pre-existing formatting error in
  `src/components/admin/remnawave/geoCheckRoute.test.ts`, outside this increment.
- Candidate browser gate: all 11 executions dedicated to v1.69.1 passed on
  system Chrome. The first full 405-test matrix found the real pre-subresource
  contact leak plus one old QR timing failure (397 pass / 6 skip / 2 fail).
  After the privacy fix, the second full matrix passed 398 with 6 intentional
  skips and one different old Profile timing failure. Privacy, QR and Profile
  each passed unchanged in isolated one-worker reruns; no v1.69.1 contract test
  failed in either full run.
  System Chrome was used because the bundled Playwright Chromium download was
  unavailable; this substitution is recorded, not hidden as an identical run.
- Real Safari/iOS is unavailable on this Windows host. Safari-specific favicon
  behavior is covered by unit/build contracts and the real endpoint request was
  observed in Chrome, but no physical Safari claim is made.
- Translation preservation: en/ru/fa/zh contain every key from both target
  v1.69.0 and the Custom Cabinet base. Existing non-English fallback gaps were
  not introduced by this integration.
- Dependency audit: npm reports 0 vulnerabilities after the coordinated Tiptap
  v3 refresh. The inherited v1.69.0 lock had 33 moderate entries from one
  @tiptap/core advisory. `npm ls` reports one deduplicated 3.31.3 family and a
  normal `npm ci --dry-run` accepts the regenerated lock without force flags.
- High-confidence secret-shape scan covered all 275 modified/untracked candidate
  files and found 0 matching files. Private production paths were not read.
- Installer candidate: all 100 local tests ran, 95 passed and 5 POSIX-only
  checks skipped on Windows. Its Node 20/24 builder contract passed all three
  top-level scenarios, including five rejected invalid Dockerfiles.
- Source research proves that Bot v4.4.0 lacks the complete v1.69.1 contract.
  Bot v4.5.0 / 07f3c6081233f5517200e62ad7be70aaa58ef27c adds web Telegram
  consent payloads (`58e9050c8d34a6ec7ae725b8706be46be1536448`),
  `/cabinet/auth/me/avatar` (`17b382532f94a4c89220124f1dde25a88b5c454f`)
  and `/cabinet/branding/favicon`
  (`46a7590c34ba778efbbcfcb4c1a617bc1a175c40`). Its runtime and migrations
  0107-0114 remain pending on an isolated lifecycle; no selected Bot changed.
- Release Bundle publication, disposable lifecycle/final postflight, staging
  and production: not started.
- UPSTREAM.md retains the verified v1.66.0 production baseline;
  COMPATIBILITY.md records v1.69.1 only as an unverified local candidate until
  the separate runtime and Release gates establish a new verified combination.

## Risks and rollback

See the approved plan for source/production identity distinctions, eight Bot
migrations, Installer Node builder contract and the lack of late Bundle rollback.
No source commit alone establishes a prepared production rollback artifact.
No public commit, tag, Release, payment, email or production operation was made.
