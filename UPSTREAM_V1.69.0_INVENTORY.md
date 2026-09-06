# Инвентаризация диапазона Upstream Cabinet v1.66.0 → v1.69.1

Дата: 2026-09-05. Актуализация: 2026-09-06.
Статус: **v1.69.0 реализован; инкремент v1.69.1 реализован локально и проверен;
runtime/Release не проверены**.

Документ дополняет [план обновления](UPSTREAM_V1.69.0_INTEGRATION_PLAN.md).
Разделы 1–4 сохраняют полный механический список v1.66.0–v1.69.0 и исходную
тематическую группировку. Раздел 5 добавляет отдельную окончательную матрицу
v1.69.0–v1.69.1; она сравнивает upstream old/new с уже адаптированным candidate,
а не повторяет завершённый перенос.

Точки сравнения:

- Прежний Upstream Cabinet: `2192484b011068d8cb75c61a6aeaada1d06115aa`.
- Предыдущая интегрированная цель: `2787b61751c4c2f82605004a3bb0c03a2395dc8d`.
- Текущая цель Upstream Cabinet: `3da34239d1c1c7b87a0184e74d49bde43ea88b89`.
- Custom Cabinet: `96c34492fdbd1cc96feaab10d12494dd780d876d`.

В диапазоне **96 commits**, из них 14 merge commits,
и **233 изменённых файла**. Merge commits перечислены для полноты
истории; их изменения не нужно переносить повторно после соответствующих commits.

## 1. Тематические решения для планирования

| Группа | Предлагаемое действие | Где и что проверять |
| --- | --- | --- |
| Storage и авторизация; старт, переводы, полифил | Приоритетный адаптированный перенос | Utils/store/bootstrap: запрещённый storage, OAuth, сессия, reload, задержка словарей и языка Telegram |
| Сборка и зависимости | Осознанный перенос нужных версий, отдельная правка Installer | package/lockfile/CI/Dockerfile: Node >=24.15.0, Router 8, тесты и воспроизводимость |
| Подарки; тикеты и профиль | Перенос поведения с сохранением нашего UI | API, gift links, маршруты и права |
| Реферальные функции | API/types затем адаптированный UI | Деньги/дни, chain/tiers, выбор подписки, частичные записи и legacy-настройки |
| Grace-доступ | Новые API и страница в нашем интерфейсе | Права, env-locked, 422, runtime/configured mode, доступность squads |
| Системные ошибки | API, страница и permission gates | Чтение, фильтры, пагинация, повтор доставки и его исход |
| Платежи | Перенос поддержки провайдеров | Sandbox, доступность по backend, callbacks и существующие методы |
| Темы; branding и мобильные отступы | Адаптация к нашим токенам и оболочке | Runtime identity, первый кадр, operator colors, iOS/Telegram/standalone |
| Загрузка и skeleton | Переиспользование существующих Custom Cabinet primitives | Loading/error/empty/success, a11y; без дублирования дизайн-системы |
| Email | API и UI вместе с Bot v4.4.0 | Required vars, can_disable, HTML preview и ошибки сохранения |
| Очистка и конфигурация репозитория | Только применимые изменения | Проверить локальные вызовы до удаления; не удалять наши документы и workflows |
| Upstream Release metadata и Merge | Не переносить механически | Сохранить полную provenance; выпускать собственные immutable tags |

## 2. Каждый входящий commit

| Commit и источник | Исходное описание | Предварительная группа |
| --- | --- | --- |
| [f1ce8302](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f1ce830266ae6ae551edfee19d17df7c3bc87bc5) | feat(ui): единый источник правды по стилям скелетонов | Загрузка и skeleton |
| [b6b608ed](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b6b608eda6065defa00b79d59b9940e7dc49b4b1) | feat(ui): примитив Skeleton и SkeletonGroup вместо двух мёртвых компонентов | Загрузка и skeleton |
| [db8cd5eb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/db8cd5eb11aa6a4fb21f5d652c8abddc6eba4a30) | refactor(ui): перевести скелетоны пользовательских экранов на общий примитив | Загрузка и skeleton |
| [0693ebaa](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0693ebaa241dde75eb473b15fabdc2ed044d44b4) | refactor(admin): перевести скелетоны админских экранов на общий примитив | Загрузка и skeleton |
| [712c3451](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/712c345151e331027e4292d38f65e32fe69b17bf) | refactor(stats): свести шесть копий заглушки вкладок в один компонент | Загрузка и skeleton |
| [2a7d9a45](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2a7d9a45ea85210a086d77860708ea19fa5aa549) | test(ui): страж от инлайновых скелетонов | Загрузка и skeleton |
| [bf4fc356](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bf4fc3563c4b03fa80e3166a50580264d0d318b6) | refactor(ui): убрать второй механизм скелетонов — CSS-класс .skeleton | Загрузка и skeleton |
| [1fc5e72c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1fc5e72c3446471a9d34252479dae87e260b1263) | feat(ui): скелетоны вместо спиннеров на пользовательских страницах | Загрузка и skeleton |
| [7b9c78c1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7b9c78c14ea4ca318be35eba3983e49d3bc9cd83) | feat(ui): доперевести пользовательские экраны со спиннеров на скелетоны | Загрузка и skeleton |
| [a330036e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a330036ebe7fa06d96ea7b99441f8054fa2793ee) | feat(admin): скелетоны вместо спиннеров в админке | Загрузка и skeleton |
| [56a5b25d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/56a5b25d611fd604a34d3c73415a08545363274b) | fix(ui): закрыть хвосты консолидации скелетонов | Загрузка и skeleton |
| [14036b7e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/14036b7eecba4cb0807968e747f23509d9063031) | refactor: удалить мёртвый код, найденный по графу | Очистка и конфигурация репозитория |
| [34275ee2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/34275ee2658e4489fc6f62ee2373992d84cd8e6f) | chore: убрать процессные документы из ветки | Очистка и конфигурация репозитория |
| [5d911370](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5d911370f1f6a68d1975ab61983bae5c66b0d285) | test(ui): компонентные тесты состояний загрузки + переведены пропущенные спиннеры | Загрузка и skeleton |
| [50f1c454](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/50f1c45450c3ec9e2e7e555ebe276b46f17b7dae) | style: привести импорт скелетона к стилю каждого файла | Загрузка и skeleton |
| [15846603](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/158466036dfc95356675df66472c4faee01225f5) | chore(ci): поднять Node с просроченного 20 до LTS 24 и закрыть часть уязвимостей | Сборка и зависимости |
| [7b6e277c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7b6e277c33092683eb1e3a6b35691a491080fba9) | chore(deps): react-router 8, React 19.2.8, override valibot; закрепить версию ноды | Сборка и зависимости |
| [b9c78807](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b9c788074e67af3bedbb6acd4c2e0620ceb9b86a) | chore: обновить базу браузеров caniuse-lite | Сборка и зависимости |
| [1681bf16](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1681bf16d22c7be3038581ed6cbab7268ea3747a) | chore(deps): обновить 34 зависимости в пределах мажоров — уязвимостей 3 -> 0 | Сборка и зависимости |
| [8e938a50](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8e938a509cbac68e95fb41a9dbd73d8bf97b1acc) | chore: одобрить install-скрипты esbuild и fsevents | Сборка и зависимости |
| [5489db6b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5489db6b36e7a75fc95475dd408ee56f61011206) | fix(admin): сделать имя пользователя в тикете ссылкой на его профиль | Тикеты и профиль |
| [48ef4639](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/48ef4639b21f8221dd7bfc02ac6bff9a65ddb79b) | Merge pull request #558 from haku4130/fix/admin-ticket-user-profile-link | Merge: учитывать изменения входящих commits один раз |
| [12b310b2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/12b310b2999f371ea47b96dc6c3cc02415e10929) | fix(gift): ссылка на подарок из кабинета не открывалась в боте | Подарки |
| [9d86ba60](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9d86ba6083741aa779f01079dffffeed4dca7b46) | test(env): вернуть Storage от jsdom в тестах на node 25+ | Сборка и зависимости |
| [673a772c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/673a772c5b4b0855d9ec176a16e78b4019c202f1) | fix(storage): не ронять приложение, когда браузер запретил хранилище | Storage и авторизация |
| [58e12880](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/58e12880beb83fce0d89ea46749f8e963b844938) | fix(storage): не считать хранилище мёртвым из-за одного отказа записи | Storage и авторизация |
| [803cb2e3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/803cb2e367cfaa8d1b5aa1d625ba4cc6b33f2ae9) | fix(storage): не принимать запись в память за сохранность там, где нужен reload | Storage и авторизация |
| [31a3a3e0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/31a3a3e07c48b277ef8bed6fb0685132ba512cc3) | fix(storage): перевести оставшиеся незащищённые обращения и поставить храповик | Storage и авторизация |
| [1df30e1c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1df30e1cca94ea5f8fcbe29495d35c4c52e6f0eb) | chore: убрать из репозитория случайно закоммиченный Архив.zip | Очистка и конфигурация репозитория |
| [1003bfc5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1003bfc53903fc6337156c2aedd703d93a1f7461) | feat(referral): render day rewards and chain levels | Реферальные функции |
| [99eacfa1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/99eacfa1602d340476967a2942d1026a68c32acd) | feat(admin): reward level editor in the cabinet | Реферальные функции |
| [8fdf978b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8fdf978b8ad8282f108c67113d58ea45feecea4e) | fix(referral): close what the UX review found in the cabinet | Реферальные функции |
| [3a5fc7ad](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3a5fc7ad465374005fe539ab970d8a8a9538166d) | fix(referral): make the level editor's numeric fields honest | Реферальные функции |
| [c3c79944](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c3c799449a09469a500a7d456a0675f2e0f46009) | feat(admin): import legacy referral settings from the cabinet | Реферальные функции |
| [d5e3b022](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d5e3b022f04ec87edb2ae839f5b4a30cc03c7403) | feat(admin): explain where day rewards land when no tariff is set | Реферальные функции |
| [b65137ee](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b65137ee086ffcd3347a54066ffaeaff9991fb18) | feat(admin): surface what the legacy import could not carry over | Реферальные функции |
| [7c679691](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7c6796917733490d621b5b00ecbc793724a2876c) | fix(admin): close three traps in the cabinet level editor | Реферальные функции |
| [caf21ec3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/caf21ec313abb9e84a6d26dd560cd33399b98c3e) | feat(admin): set the referral chain depth from the level editor | Реферальные функции |
| [8f6181f5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8f6181f5dcd74976b60584fb0684ed533e05a87d) | feat(admin): set how many referrals unlock a reward level | Реферальные функции |
| [c3eb6c58](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c3eb6c5831646cef9aff49b59fc5706b30c7542f) | fix(admin): put the reward-level editor in the admin main menu | Реферальные функции |
| [28cb8dc4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28cb8dc4a35555d4622bb3337e58bc79b9b52101) | feat(referral): режим рангов в редакторе уровней и на экране партнёра | Реферальные функции |
| [20ad9598](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/20ad9598a0d30ca8881ea524b2db586393246b1d) | feat(referral): понятная карточка условий и «Ваш уровень» вместо глубины сети | Реферальные функции |
| [097cd1e5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/097cd1e52735d82aafd82cf11be9008acacf4db7) | feat(referral): предупреждать о выключенном мультитарифе в редакторе уровней | Реферальные функции |
| [b35b19bc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b35b19bc587575134c7fee39fb2b62f128ef1efb) | feat(referral): блокировать поле глубины, закреплённое в .env | Реферальные функции |
| [7d51713c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7d51713cb8470f561e85abf8f4b07d701547956d) | feat(referral): карточка настроек наград на экране партнёра | Реферальные функции |
| [4db4fd1f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4db4fd1f2b072e2e86c18bcf21abe4473ca71bb0) | feat(referral): выбор награды карточками с иконками, деньги или дни | Реферальные функции |
| [e31c76c6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/e31c76c6d71c67799bb15d704bb268fca717382b) | feat(referral): суммы на карточках выбора и подписка только под дни | Реферальные функции |
| [bd86d3d2](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/bd86d3d27ca8bf9d71912a9a1d4392439704c208) | feat(admin): раздел grace-доступа в админменю | Grace-доступ |
| [73c57153](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/73c57153925ef864b0dfe5d659c98078923ff08a) | fix(admin): выбор аварийного сквада и очистка числовых полей | Grace-доступ |
| [f466b78e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f466b78e38e6c7efff4ddb0bfdfec58f9aaedc7f) | fix(admin): разбирать 422 от бэкенда и сторожить переводы раздела | Grace-доступ |
| [4d99cfca](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/4d99cfca33c362b253e53618c50baf82f01dc128) | fix(admin): «оставить как есть» распознавать без учёта регистра | Grace-доступ |
| [2f95c6a6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f95c6a6742f6293bdec9e74eb22fb8f0fabdee3) | feat(admin): предупреждать, когда весь раздел закреплён в .env | Grace-доступ |
| [9793e8bb](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9793e8bbe6e01f4504bbe034c18fa07c3d11a05a) | fix(admin): закрыть находки ревью раздела grace-доступа | Grace-доступ |
| [701b2c61](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/701b2c6105cacdc31f85ae16ca923a7b1fdf4d29) | Merge pull request #560 from BEDOLAGA-DEV/dev | Merge: учитывать изменения входящих commits один раз |
| [44a7d750](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/44a7d750fb82bc482ed2dabc72724540c21c289a) | chore(main): release 1.67.0 | Upstream Release metadata: сохранить наше издание |
| [35e5aa9e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/35e5aa9e78123fdf18506a7a8a46875d268689ed) | Merge pull request #561 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Merge: учитывать изменения входящих commits один раз |
| [d2e25abe](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d2e25abe94f72a0a76ce413c5c7db0b4959dcef6) | feat(admin): страница системных ошибок | Системные ошибки |
| [7c63bcd4](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7c63bcd474dbbe95a8455c839dac418435f2a615) | feat(admin): кнопка повторной доставки ошибки | Системные ошибки |
| [6b08bee8](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6b08bee8397292beea0fbadd44a82be4faa6118e) | fix(admin): неверный путь API у страницы системных ошибок | Системные ошибки |
| [eaeb0f11](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/eaeb0f119c2f11d97f4df455aa6a4e06c26ff4b1) | Merge pull request #566 from BEDOLAGA-DEV/main | Merge: учитывать изменения входящих commits один раз |
| [c39107de](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c39107def07f427c52b0acb2b9480223c9764c55) | fix(admin): гейт кнопки повтора, видимый исход доставки и дебаунс поиска | Системные ошибки |
| [a337b96f](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a337b96f9b76d2350c21e280fbd33548d5fec5c1) | Merge pull request #565 from haku4130/upstream-pr/admin-system-errors | Merge: учитывать изменения входящих commits один раз |
| [379ab0e9](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/379ab0e9e61f00ea3dfdf44f99bc3f9b3b813d71) | fix(i18n): не рисовать интерфейс раньше словарей и темы | Старт, переводы, полифил |
| [f23b3c0b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f23b3c0b3454470741745a066bd158879b44209b) | fix(build): вернуть тело полифила Object.hasOwn | Старт, переводы, полифил |
| [881122f7](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/881122f730f22f1d265e4120e51e52159778406c) | Merge pull request #567 from BEDOLAGA-DEV/fix/i18n-fouc-cold-cache | Merge: учитывать изменения входящих commits один раз |
| [47f8760d](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/47f8760d8816eafa6b58b13290e313ae4eb73fb3) | feat(payments): TabPay в кабинете | Платежи |
| [04dd8882](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/04dd8882ed0a971e3c68d7262e409cbb3ef3f5b9) | feat(payments): ParityPay в кабинете | Платежи |
| [906e6bdf](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/906e6bdfdda519d559c633ff893eef2036769561) | fix(repo): убрать закоммиченный симлинк node_modules | Очистка и конфигурация репозитория |
| [6fb9fb3a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6fb9fb3a4ec2b2ca65ef5061dac649a832f433a4) | chore(biome): не проверять то, что не входит в репозиторий | Очистка и конфигурация репозитория |
| [040691c6](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/040691c6366c90ab9557befcc569a2cb98e951eb) | Merge pull request #568 from BEDOLAGA-DEV/dev | Merge: учитывать изменения входящих commits один раз |
| [8f064bac](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8f064bacda70a206a5e0500b33b32b5f911e8f62) | chore(main): release 1.68.0 | Upstream Release metadata: сохранить наше издание |
| [d53f6f6a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d53f6f6a229b4eefd8cb2f203d00e513ecaab94c) | Merge pull request #569 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Merge: учитывать изменения входящих commits один раз |
| [b0570ee0](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b0570ee0aa596a8ea96d0d8ec94542c68c8722d4) | fix(admin): кастомные цвета темы не сохранялись при дефолтной палитре | Темы и первый кадр |
| [2f4f52a9](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2f4f52a9a302264b67160d0990ac57081236d1ac) | fix(theme): операторский фон светлой темы перекрывался заглушкой index.html | Темы и первый кадр |
| [414802bc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/414802bcff8e1712bf0b718b604a057870d12b58) | fix(theme): палитра статусных цветов теперь строится от выбранного цвета | Темы и первый кадр |
| [fcef18a1](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fcef18a11e95004c8ae98956d41d41f72bd4713b) | fix(theme): стеклянные карточки берут цвет текста из палитры оператора | Темы и первый кадр |
| [58f3f58a](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/58f3f58aaebffec312c676e63e5e5b89566222d9) | Merge pull request #571 from BEDOLAGA-DEV/dev | Merge: учитывать изменения входящих commits один раз |
| [486859ae](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/486859aef20b45487e891915f0fc06f8b281a879) | chore(main): release 1.68.1 | Upstream Release metadata: сохранить наше издание |
| [2a468bab](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2a468babc91f418a5b89384a37f97ef90efb6510) | Merge pull request #572 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Merge: учитывать изменения входящих commits один раз |
| [1ca7e489](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1ca7e489af577dda7c58302ecba161a3403f056d) | fix(branding): бренд инсталляции во вкладке, фавиконе и ярлыках вместо «VPN»/«V» | Branding и мобильные отступы |
| [59c42b19](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/59c42b197c9003d570c976811609b42cec44d791) | fix(ui): мобильная шапка не срезается статус-баром в standalone-режиме iOS | Branding и мобильные отступы |
| [38a6738c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/38a6738c4ae98f9ebc61a068aa60fca99e4c47e3) | fix(branding): иконки ярлыков без прозрачных углов — iOS и Android заливали их белым | Branding и мобильные отступы |
| [28fd9680](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28fd9680f1a2b45068b612e44c6f5ce049e66f2e) | fix(ui): полоса под статус-баром iOS вместо растянутого стекла шапки | Branding и мобильные отступы |
| [accd1e99](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/accd1e99c2866ddc5ede338e7434980394596d74) | fix(ui): ярлык iOS — шапка сливается со статус-баром, панель ближе к краю | Branding и мобильные отступы |
| [d62c8d39](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d62c8d39e6e99c91f567a1a4ac13e099ef630cff) | fix(theme): палитра оператора применяется до первой отрисовки | Темы и первый кадр |
| [2d71d63b](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2d71d63b68370b9cb3c679a52410eaa80edd7078) | fix(ui): боковые вырезы в альбомной ориентации iPhone | Branding и мобильные отступы |
| [b7d13915](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b7d1391518819689d807d4b5589e9d96aa551e51) | fix(ui): прижатые к низу элементы не прячутся за мобильной панелью | Branding и мобильные отступы |
| [5e8b026c](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5e8b026c4592369650e3df15aee88b1c6c62f943) | Merge pull request #573 from BEDOLAGA-DEV/dev | Merge: учитывать изменения входящих commits один раз |
| [8d697380](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8d697380d8ddf2d13a2146a2467ec51316fcac55) | chore(main): release 1.68.2 | Upstream Release metadata: сохранить наше издание |
| [804ea3b5](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/804ea3b5b7b5de32b001ea9ad7927c3f49e20f5f) | Merge pull request #574 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Merge: учитывать изменения входящих commits один раз |
| [3f073019](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3f0730191d0d0ff04fd7353d848c4fc8eb760142) | feat(admin): редактор email-шаблонов понимает общую обёртку писем | Email |
| [f18d64c3](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f18d64c3dd1d5ebab64d0c976cd0940e860b9269) | feat(admin): превью письма рассылки рендерит бот — в общей обёртке | Email |
| [745e8397](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/745e8397916754a9fb6d654e08f60afd15e9d14e) | feat(admin): переключатель «отправлять это письмо» в редакторе email-шаблонов | Email |
| [477164fc](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/477164fc46f2a6a31e9550a9e8e4ff6ac7de6d5e) | Merge pull request #575 from BEDOLAGA-DEV/dev | Merge: учитывать изменения входящих commits один раз |
| [d77a6a2e](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d77a6a2e782a6b78698889ed57113b9d86625e9b) | chore(main): release 1.69.0 | Upstream Release metadata: сохранить наше издание |
| [2787b617](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2787b61751c4c2f82605004a3bb0c03a2395dc8d) | Merge pull request #576 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend | Merge: учитывать изменения входящих commits один раз |

## 3. Каждый изменённый путь

Сравнение берёт именно committed Custom Cabinet HEAD; существующие
незакоммиченные изменения в эту статистику не входят.

`A` — добавлен в upstream, `M` — изменён, `D` — удалён.
«Ручное трёхстороннее сравнение» означает, что путь изменён и у нас относительно
v1.66.0, и в новом upstream, а итоговые деревья различаются. Это не результат
пробного merge и не доказательство текстового конфликта. Для upstream-удалений
проверять всех локальных потребителей до удаления.

- У нас нет отличий от прежней upstream базы: **110**.
- Ручное трёхстороннее сравнение: **123**.

| Статус upstream | Путь | Сопоставление с Custom Cabinet |
| --- | --- | --- |
| `M` | `.github/workflows/ci.yml` | У нас нет отличий от прежней upstream базы |
| `M` | `.github/workflows/lint.yml` | У нас нет отличий от прежней upstream базы |
| `M` | `.github/workflows/release.yml` | Ручное трёхстороннее сравнение |
| `M` | `.github/workflows/security-audit.yml` | У нас нет отличий от прежней upstream базы |
| `M` | `.gitignore` | Ручное трёхстороннее сравнение |
| `A` | `.nvmrc` | У нас нет отличий от прежней upstream базы |
| `M` | `CHANGELOG.md` | Ручное трёхстороннее сравнение |
| `M` | `Dockerfile` | Ручное трёхстороннее сравнение |
| `M` | `biome.json` | Ручное трёхстороннее сравнение |
| `M` | `index.html` | Ручное трёхстороннее сравнение |
| `M` | `package-lock.json` | Ручное трёхстороннее сравнение |
| `M` | `package.json` | Ручное трёхстороннее сравнение |
| `M` | `src/App.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/AppWithNavigator.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/api/adminBroadcasts.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/adminEmailTemplates.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/api/adminGraceAccess.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/api/adminSystemErrors.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/banSystem.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/branding.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/api/gift.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/index.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/menuLayout.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/partners.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/api/partnersReferralMode.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/referral.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/api/themeColors.ts` | Ручное трёхстороннее сравнение |
| `A` | `src/components/DocumentBranding.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/ErrorBoundary.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/Onboarding.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/PaymentMethodIcon.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/PromoOffersSection.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/TicketNotificationBell.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/components/admin/ListRowSkeleton.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/MenuEditorTab.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/admin/ThemeTab.test.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/ThemeTab.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/admin/bulkActions/FloatingActionBar.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/constants.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/remnawave/GeoCheckImageViewer.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/admin/remnawave/geoCheckRoute.test.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/components/admin/userDetail/GiftsTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/userDetail/InfoTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/userDetail/ReferralsTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/admin/userDetail/SubscriptionTab.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/broadcasts/BroadcastPreview.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/connection/TvQuickConnect.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/data-display/StatCard/StatCard.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/icons/extended-icons.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/layout/AppShell/AppHeader.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/layout/AppShell/AppShell.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/layout/AppShell/MobileBottomNav.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/partner/CampaignDetailStats.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/AddonsTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/DepositsTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/DualAreaChart.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/sales-stats/MultiSeriesAreaChart.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/sales-stats/PaymentHealthTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/RenewalsTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/SalesTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/SimpleAreaChart.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/sales-stats/SimpleBarChart.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/StackedBarChart.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/components/sales-stats/StatsTabSkeleton.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/sales-stats/TrialsTab.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/components/stats/DailyChart.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/stats/StatCard.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/subscription/SubscriptionConnectFooter.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/subscription/purchase/ClassicPurchaseWizard.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/subscription/sheets/ServerManagementSheet.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/components/subscription/sheets/SwitchTariffSheet.tsx` | Ручное трёхстороннее сравнение |
| `D` | `src/components/ui/BentoSkeleton.tsx` | У нас нет отличий от прежней upstream базы |
| `D` | `src/components/ui/Skeleton.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/components/ui/skeleton/PageSkeleton.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/ui/skeleton/Skeleton.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/ui/skeleton/Skeleton.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/ui/skeleton/index.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/ui/skeleton/skeletonStyles.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/ui/skeleton/skeletonStyles.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/components/ui/skeleton/skeletonUsage.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/config/constants.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/constants/paymentMethods.ts` | У нас нет отличий от прежней upstream базы |
| `D` | `src/data/colorPresets.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/hooks/useBranding.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/hooks/useDocumentBranding.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/hooks/useDocumentBranding.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/hooks/useHeaderHeight.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/hooks/useHeaderHeight.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/hooks/useTheme.ts` | Ручное трёхстороннее сравнение |
| `A` | `src/hooks/useThemeColors.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/hooks/useThemeColors.ts` | Ручное трёхстороннее сравнение |
| `D` | `src/hooks/useUserThemePreferences.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/i18n.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/i18n.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/i18nColdCache.test.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/locales/en.json` | Ручное трёхстороннее сравнение |
| `M` | `src/locales/fa.json` | Ручное трёхстороннее сравнение |
| `M` | `src/locales/ru.json` | Ручное трёхстороннее сравнение |
| `M` | `src/locales/zh.json` | Ручное трёхстороннее сравнение |
| `M` | `src/main.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminApps.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminAuditLog.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminBanSystem.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminBroadcastDetail.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminCampaignEdit.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminCampaignStats.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminCampaigns.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminChannelSubscriptions.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminCouponDetail.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminCoupons.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminDashboard.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminEmailTemplates.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/pages/AdminGraceAccess.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminInfoPageEditor.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminInfoPages.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminLandingStats.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminLandings.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminLegalPages.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminNews.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminNewsCreate.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPanel.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminPartnerCampaignAssign.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminPartnerDetail.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminPartnerSettings.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPartners.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPaymentMethodEdit.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPaymentMethods.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminPolicies.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPolicyEdit.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromoGroupCreate.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromoGroups.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromoOfferSend.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromoOfferTemplateEdit.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromoOffers.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromocodeCreate.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminPromocodeStats.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminPromocodes.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/pages/AdminReferralLevels.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminRemnawave.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminRemnawaveSquadDetail.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminRoleEdit.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminRoles.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminServerEdit.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminServers.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/pages/AdminSystemErrors.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminTariffCreate.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminTariffs.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminTicketSettings.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminTickets.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminTrafficUsage.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminUpdates.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminUserDetail.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminUsers.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminWheel.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/AdminWithdrawalDetail.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/AdminWithdrawals.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Balance.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/ConnectedAccounts.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Connection.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Contests.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/CouponStatus.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Dashboard.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/GiftClaim.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/GiftSubscription.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Info.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/InfoPageView.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/LinkTelegramCallback.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/Login.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/MergeAccounts.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/NewsArticle.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Polls.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Profile.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/PublicLegal.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/QuickPurchase.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Referral.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/ReferralNetwork/components/CampaignDetailPanel.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/ReferralNetwork/components/ScopeSelector.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/ReferralNetwork/components/UserDetailPanel.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/RenewSubscription.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/SavedCards.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Subscription.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/SubscriptionPurchase.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Subscriptions.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/Support.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/TelegramRedirect.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/pages/TopUpAmount.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/TopUpMethodSelect.tsx` | Ручное трёхстороннее сравнение |
| `M` | `src/pages/Wheel.tsx` | Ручное трёхстороннее сравнение |
| `A` | `src/pages/adminGraceAccess.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/adminNavCoverage.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/adminReferralLevels.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/adminSystemErrors.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/adminTicketUserLink.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/blockedStorageRendering.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/loadingStates.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/referralDayRewards.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/referralRewardSettings.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/referralTerms.test.tsx` | У нас нет отличий от прежней upstream базы |
| `A` | `src/pages/referralTierProgress.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/providers/ThemeColorsProvider.tsx` | У нас нет отличий от прежней upstream базы |
| `M` | `src/store/auth.ts` | Ручное трёхстороннее сравнение |
| `A` | `src/store/authBlockedStorage.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/styles/globals.css` | Ручное трёхстороннее сравнение |
| `A` | `src/test/setup.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/types/index.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/types/theme.ts` | Ручное трёхстороннее сравнение |
| `A` | `src/utils/brandingHtml.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/utils/colorConversion.ts` | Ручное трёхстороннее сравнение |
| `A` | `src/utils/documentBranding.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/documentBranding.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/utils/favicon.ts` | Ручное трёхстороннее сравнение |
| `A` | `src/utils/giftShare.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/giftShare.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/glassTheme.test.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/utils/glassTheme.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/utils/inputHelpers.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/utils/navigation.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/utils/nodeVersion.test.ts` | Ручное трёхстороннее сравнение |
| `M` | `src/utils/oauth.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/utils/rateLimit.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/safeStorage.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/safeStorage.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/storageGuards.test.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/utils/supportContact.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/themeColorsHint.test.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `src/utils/themeColorsHint.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `src/utils/token.ts` | Ручное трёхстороннее сравнение |
| `M` | `tsconfig.json` | У нас нет отличий от прежней upstream базы |
| `M` | `tsconfig.node.json` | У нас нет отличий от прежней upstream базы |
| `A` | `vite-plugins/brandMonogram.ts` | У нас нет отличий от прежней upstream базы |
| `A` | `vite-plugins/brandingHtml.ts` | У нас нет отличий от прежней upstream базы |
| `M` | `vite.config.ts` | Ручное трёхстороннее сравнение |
| `M` | `vitest.config.ts` | У нас нет отличий от прежней upstream базы |

## 4. Что нужно дополнить до изменения исходников

1. В sync report Custom Cabinet: для каждого commit уточнить класс,
   ownership, действие «перенос/адаптация/пропуск/блокировка», причину и тест.
2. В решениях по гибридным файлам: разобрать imports/types/state/effects,
   mutations/permissions/errors, переводы и каждый видимый режим по трём версиям.
3. В матрице совместимости: подтвердить каждый API на точном кандидате Bot,
   а при неизвестном контракте блокировать включение функции и Release.
4. В зависимости и locale-инвентаризации: проверить точные изменения lockfile
   и ключей всех четырёх языков; сохранить используемые Custom Cabinet сущности.

## 5. Окончательная матрица v1.69.0 → v1.69.1

Точный официальный диапазон:
`2787b61751c4c2f82605004a3bb0c03a2395dc8d..3da34239d1c1c7b87a0184e74d49bde43ea88b89`.
Он содержит 12 commits и 45 путей. Решения ниже относятся к текущему
адаптированному working tree. `Upstream-verbatim` означает совпадение текста
после нормализации CRLF/LF; `adapted` — входящее поведение встроено в Custom
Cabinet; `custom-base-preserved` — upstream release-текст не заменяет наш.

### 5.1. Все 12 commits

| Commit | Тема | Решение и доказательство |
| --- | --- | --- |
| [`a24058c9`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a24058c9855199e725b8f0316041b2036ee97d77) | Общий legal-consent gate для Telegram | Адаптирован во все три Telegram-входа; unit + Chrome callback/redirect/widget |
| [`1a9c9228`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1a9c922852d90f227dee35150ae471cbe3d256f5) | Структурные API errors | Адаптирован через общий `getApiErrorMessage`; unit guard + Chrome render |
| [`1137b70e`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1137b70ee2c1cb729a4760e2cd250f2099ce62b3) | Avatar fallback через Bot | Адаптирован в Custom `AppHeader`; hook tests + Chrome header |
| [`7efd51f6`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/7efd51f6d4f4508fbc68509ff62588d886cd301b) | Branding до React | Адаптирован к существующему `DocumentBranding` и custom title/favicon ownership |
| [`fb4ea701`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fb4ea701a5c582107b7bade1139c209ca3d62147) | Bot favicon endpoint / Safari / CORS | Перенесён; endpoint проверен Chrome, реальный Safari недоступен |
| [`06b331fc`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/06b331fceb85da28563a3f5024cc46a5bdc231ca) | Poisoned browser cache recovery | Перенесён с единым in-flight retry и `cache: reload`; unit tests |
| [`fccc16b7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fccc16b7d9436203b57a862285b84536d4f4f9c7) | PNG-only first-paint hint | Перенесён; document-branding tests |
| [`5869af43`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5869af43387a56f63fa2cf3a89dbb9b210c02e3c) | Меньшее скругление Safari tile | Перенесён, сохранив custom чёрно-белый monogram |
| [`0b577e07`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/0b577e0721531158a3dc5b053ff7e05a8cf4e594) | DOMParser для теста раннего branding | Перенесён verbatim |
| [`52ce005b`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/52ce005b6a792d9d961872fe5e166221f3429657) | Merge PR #580 | Provenance записана; constituent changes повторно не переносились |
| [`00ebbecd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/00ebbecdea95960a848854e51520e334f7b8d565) | Release metadata 1.69.1 | Package version адаптирована; Custom README/CHANGELOG сохранены; Tiptap 3.31.3 не откатан |
| [`3da34239`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3da34239d1c1c7b87a0184e74d49bde43ea88b89) | Merge release PR #581 | Точный target SHA и ancestry записаны; constituent changes не дублировались |

### 5.2. Все 45 путей

| Путь | Решение | Причина / проверка |
| --- | --- | --- |
| `CHANGELOG.md` | custom-base-preserved | История Custom Cabinet меняется только при разрешённом immutable Release |
| `README.md` | custom-base-preserved | Custom install/branding ownership; upstream release-текст не копируется |
| `index.html` | adapted | Early name + favicon, custom белый/чёрный first paint и privacy cleanup до subresources |
| `nginx.conf` | upstream-verbatim | `/index.html` no-cache + must-revalidate |
| `package-lock.json` | adapted | Версия 1.69.1; согласованный Tiptap 3.31.3 сохранён |
| `package.json` | adapted | Версия 1.69.1; direct Tiptap ranges `^3.30.4` сохранены |
| `src/api/auth.ts` | adapted | Avatar response/endpoint добавлены к текущему auth client |
| `src/api/branding.ts` | adapted | Retry `cache: reload` и один shared in-flight preload |
| `src/api/brandingPreloadLogo.test.ts` | adapted | Текущий test setup + cache/race contracts |
| `src/components/LegalConsentGate.tsx` | adapted | Canonical Custom `Card`, Button и framed/unframed states |
| `src/components/PromoOffersSection.tsx` | adapted | Structured error guard внутри текущей promo UI |
| `src/components/TelegramLoginButton.tsx` | adapted | Consent retry сохраняет abortable polling и widget/deep-link fallback |
| `src/components/admin/userDetail/ReferralsTab.tsx` | upstream-verbatim | Safe structured error rendering |
| `src/components/layout/AppShell/AppHeader.tsx` | adapted | Bot avatar внутри custom четырёхпунктовой навигации и safe-area |
| `src/components/telegramLoginButtonConsent.test.tsx` | adapted | Текущие providers/mocks и исходный Telegram payload |
| `src/hooks/useDocumentBranding.test.tsx` | upstream-verbatim | Runtime brand-ready и favicon contracts |
| `src/hooks/useDocumentBranding.ts` | upstream-verbatim | Единый runtime owner отмечает завершение раннего скрипта |
| `src/hooks/useLegalConsentGate.ts` | adapted | Текущий i18n/API client и повтор исходной операции |
| `src/hooks/useUserAvatar.test.tsx` | adapted | Custom test setup, success/failure/unmount states |
| `src/hooks/useUserAvatar.ts` | adapted | Fallback только для авторизованного пользователя без initData photo |
| `src/pages/AdminPromoOfferSend.tsx` | adapted | Structured error через общий helper |
| `src/pages/ConnectedAccounts.tsx` | adapted | Structured error + текущие linking/storage flows |
| `src/pages/Dashboard.tsx` | adapted | Structured error без изменения unified dashboard |
| `src/pages/Login.tsx` | adapted | Legal gate без потери SafeStorage/OAuth/custom layout |
| `src/pages/ResetPassword.tsx` | adapted | Structured error helper |
| `src/pages/Subscriptions.tsx` | upstream-verbatim | Safe structured error rendering |
| `src/pages/TelegramCallback.tsx` | adapted | Consent gate + одно обращение на payload при locale/re-render |
| `src/pages/TelegramRedirect.tsx` | adapted | Consent gate + текущий Telegram redirect flow |
| `src/pages/TopUpAmount.tsx` | adapted | Structured error без изменения payment flow |
| `src/pages/VerifyEmail.tsx` | upstream-verbatim | Safe structured error rendering |
| `src/pages/telegramCallbackConsent.test.tsx` | adapted | Custom provider harness + exact retry count |
| `src/pages/telegramRedirectConsent.test.tsx` | adapted | Custom provider harness + same initData retry |
| `src/test/consentRequiredError.ts` | upstream-verbatim | Общая regression fixture |
| `src/test/earlyBrand.test.ts` | upstream-verbatim | Настоящие inline scripts разбираются DOMParser |
| `src/types/index.ts` | upstream-verbatim | `UserAvatarResponse` transport type |
| `src/utils/api-error.guard.test.ts` | adapted | Проверяет все source call sites текущего дерева |
| `src/utils/api-error.test.ts` | adapted | Custom fallback cases + structured detail |
| `src/utils/api-error.ts` | adapted | Guard встроен в существующую Axios/fallback нормализацию |
| `src/utils/brandingHtml.test.ts` | upstream-verbatim | Build-time API/favicon injection |
| `src/utils/documentBranding.test.ts` | upstream-verbatim | PNG-only bounded hint и runtime ownership |
| `src/utils/documentBranding.ts` | upstream-verbatim | Ограниченный PNG hint и brand-ready attribute |
| `src/utils/favicon.ts` | upstream-verbatim | Safari-friendly raster tile behavior |
| `vite-plugins/brandMonogram.ts` | adapted | Новые размеры/радиус, custom black/white semantics сохранены |
| `vite-plugins/brandingHtml.ts` | upstream-verbatim | API URL и favicon endpoint injection |
| `vite.config.ts` | adapted | Plugin подключён без потери custom chunks/base/build rules |

Итог: 14 `upstream-verbatim`, 29 `adapted`, 2
`custom-base-preserved`, 0 пропусков. Дополнительная найденная browser-регрессия
закрыта вне входящих 45 путей в `src/utils/contactPrefill.ts`, его тесте и
`tests/e2e/quick-purchase-attribution.spec.ts`; новые browser-контракты находятся
в `tests/e2e/v1691-contracts.spec.ts`, общий mock дополнен в
`tests/e2e/cabinetTestHarness.ts`.

Рекомендуемый уровень рассуждения для следующей задачи: очень высокий — файловая матрица закрыта, но runtime-совместимость зависит от отдельного Upstream Bot v4.5.0 lifecycle и восстановления базы.
