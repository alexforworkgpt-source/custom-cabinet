# Upstream Cabinet v1.66.0: исследование диапазона от v1.65.0

Дата проверки: 2026-08-22

Статус: исследование завершено; интеграция не выполнялась

Upstream Cabinet: <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet>

Release: <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0>
Exact compare: <https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa>

## 1. Краткий вывод

`v1.66.0` указывает точно на commit
`2192484b011068d8cb75c61a6aeaada1d06115aa`. Это lightweight-тег, а не
аннотированный тег: GitHub Git Ref возвращает для `refs/tags/v1.66.0`
объект типа `commit` непосредственно с этим SHA, без промежуточного объекта
типа `tag`. Источники:
[GitHub Git Ref](https://api.github.com/repos/BEDOLAGA-DEV/bedolaga-cabinet/git/ref/tags/v1.66.0),
[target commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2192484b011068d8cb75c61a6aeaada1d06115aa),
[release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0).

Заданный baseline `v1.65.0` точно совпадает с
`b866bebeeb6032db4baa3869a4917316fe8e0453`; он является merge-base и
предком target. Диапазон содержит 45 коммитов, 53 изменённых файла,
3 554 добавления и 507 удалений. Из файлов 23 добавлены, 30 изменены, удалённых
и переименованных нет. Источник:
[exact GitHub Compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

Главные изменения диапазона:

1. Добавлен GeoCheck узлов в админке: запуск асинхронной проверки, polling,
   просмотр SVG/JSON, масштабирование, выбор IP/interface/default route и
   ограничения для Telegram Mini App. Источники:
   [feature commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b4e1de6152cfc85418c62e4f840180411989a2a7),
   [API source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminRemnawave.ts),
   [modal source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckModal.tsx).
2. Админские контракты расширены сортировкой пользователей по окончанию
   подписки, удалением конкретной подписки и трафиком в наборе бонусов
   промокода. Источники:
   [admin users source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminUsers.ts),
   [promocodes source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/promocodes.ts).
3. На главной multi-tariff Cabinet действие подключения перенесено в карточку
   каждой подписки; при заполненном лимите открывается окно управления
   устройствами, а не неактивная кнопка. Источники:
   [dashboard commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28e25a92922501ed609623776e987fcd96f71032),
   [Dashboard source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Dashboard.tsx),
   [state source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/subscription/connectFooterState.ts).
4. Telegram login получил ручной выбор deep-link входа через бота, а чтение
   Mini App `initData` теперь выбирает более свежий источник по `auth_date`
   между официальным мостом и SDK. Источники:
   [manual login commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d03b9bdad785ac7710f30527f230eeb793e1089b),
   [initData fix](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f81af401f7f6ca1a28806cbf237a33da7449d893),
   [initData source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/telegramInitData.ts).
5. Гостевая покупка передаёт `campaign_slug`; `?contact=` предзаполняет
   контакт и удаляется из browser URL, чтобы снизить его попадание в
   последующую аналитику, Referer и историю. Начальный HTTP-запрос уже содержит
   query parameter, поэтому frontend не может удалить его из ранее созданных
   proxy/access logs. Источники:
   [campaign commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d4379fce25af69e866e9232a3cd036652e7eae17),
   [contact cleanup commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/acbffa4e17e4549a1068f286e3009b38d30ae6be),
   [purchase source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/QuickPurchase.tsx),
   [contact source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/contactPrefill.ts).
6. Ошибки создания/ответа в тикете теперь видимы пользователю, а длинные
   неразрывные строки переносятся в пользовательском и административном UI.
   Источники:
   [support commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d88928912acaaf9eeee52235ee4e2aace5e245e7),
   [wrapping commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2ba6fc0f6f743b8648c0d1e708cd123a465ee77f),
   [Support source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Support.tsx).

## 2. Идентичность источника и тега

| Поле | Проверенный результат | Первичный источник |
| --- | --- | --- |
| Previous tag | `v1.65.0` | [Git ref](https://api.github.com/repos/BEDOLAGA-DEV/bedolaga-cabinet/git/ref/tags/v1.65.0) |
| Previous exact SHA | `b866bebeeb6032db4baa3869a4917316fe8e0453` | [Commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b866bebeeb6032db4baa3869a4917316fe8e0453) |
| Target tag | `v1.66.0` | [Release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| Target exact SHA | `2192484b011068d8cb75c61a6aeaada1d06115aa` | [Commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2192484b011068d8cb75c61a6aeaada1d06115aa) |
| Git ref object type | `commit` | [Git ref JSON](https://api.github.com/repos/BEDOLAGA-DEV/bedolaga-cabinet/git/ref/tags/v1.66.0) |
| Tag kind | lightweight, не annotated | [Git ref JSON](https://api.github.com/repos/BEDOLAGA-DEV/bedolaga-cabinet/git/ref/tags/v1.66.0) |
| Target parents | `6474b28cef525083c17631238165cce198c991ca`, `8a7ef9ace0fc714dac242b44459ef504d86f1737` | [Target commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2192484b011068d8cb75c61a6aeaada1d06115aa) |
| Release state | published, `draft=false`, `prerelease=false` | [Release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| Published at | `2026-08-20T09:40:59Z` | [Release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| Release assets | отсутствуют | [Release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| Merge-base | exact baseline SHA | [Exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa) |

Проверка выполнена двумя независимыми путями: GitHub Git Ref/Release/Compare и
локальные Git-объекты после клонирования upstream. Локально
`git cat-file -t refs/tags/v1.66.0` вернул `commit`, `git rev-parse` и
`git rev-list -n 1` вернули один и тот же target SHA, а `git merge-base`
вернул заданный baseline. Веб-подтверждение тех же идентичностей:
[Git ref](https://api.github.com/repos/BEDOLAGA-DEV/bedolaga-cabinet/git/ref/tags/v1.66.0),
[compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

## 3. Release notes и changelog

GitHub Release и добавленный раздел `CHANGELOG.md` содержат одинаковый
Release Please-текст: 9 пунктов `Features` и 14 пунктов `Bug Fixes`. В notes
дважды перечислена отправка campaign slug и дважды перенос длинного сообщения,
потому что в историю попали и рабочие, и merge-коммиты; notes не являются
полным списком всех 45 коммитов. Источники:
[release notes](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0),
[raw CHANGELOG at exact target](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/CHANGELOG.md),
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

Release notes заявляют следующие функциональные темы: ручной deep-link вход,
подключение устройств с главной, `contact` в URL гостевой покупки,
`campaign_slug`, traffic bonus промокода, GeoCheck и удаление подписки
администратором. Исправления охватывают сортировку, Telegram login, счётчик
устройств, GeoCheck, очистку `contact`, промокоды, тикеты и ошибки удаления
подписки. Точный текст принадлежит upstream:
[release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0).

## 4. Все коммиты диапазона

Ниже все 45 коммитов в порядке, который возвращает GitHub Compare для exact
base/head; время приведено в UTC. Источник порядка и состава:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

| # | UTC | Commit | Subject |
| ---: | --- | --- | --- |
| 1 | 2026-07-30 22:29:16 | [`89a9f9f70c5910916097818696711cb99ae19bcc`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/89a9f9f70c5910916097818696711cb99ae19bcc) | `feat: add sort by subscription expiry to user list` |
| 2 | 2026-08-03 17:46:28 | [`d03b9bdad785ac7710f30527f230eeb793e1089b`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d03b9bdad785ac7710f30527f230eeb793e1089b) | `feat(auth): allow manual opt-in for deep-link Telegram login` |
| 3 | 2026-08-03 18:23:16 | [`75424dba473925b99d993d0e52f33067f14125ce`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/75424dba473925b99d993d0e52f33067f14125ce) | `refactor(auth): consolidate three Telegram entry points into two` |
| 4 | 2026-08-03 20:04:25 | [`596b39b765de0b574bae1ef9affb7d9bec21feae`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/596b39b765de0b574bae1ef9affb7d9bec21feae) | `Merge pull request #540 from BEDOLAGA-DEV/main` |
| 5 | 2026-08-04 18:38:20 | [`eafc563128b68f49f0a1f03a30c899b527ce4734`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/eafc563128b68f49f0a1f03a30c899b527ce4734) | `feat(users): кнопка удаления подписки в карточке пользователя` |
| 6 | 2026-08-04 19:02:29 | [`f6a64bfc1eb885cde31bcbab1f1474b1d693e718`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f6a64bfc1eb885cde31bcbab1f1474b1d693e718) | `feat(promocodes): трафик в наборе бонусов промокода` |
| 7 | 2026-08-04 19:30:40 | [`06c7d1388308de5fc1adad0cd2697d3c03c41c49`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/06c7d1388308de5fc1adad0cd2697d3c03c41c49) | `feat(dashboard): плитка «Подключить устройство» на главной` |
| 8 | 2026-08-05 23:04:02 | [`b3a3dc4ff4846cc69761c4c5df1ae15b41968020`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b3a3dc4ff4846cc69761c4c5df1ae15b41968020) | `Merge remote-tracking branch 'origin/dev' into pr-534` |
| 9 | 2026-08-05 23:11:14 | [`2d6f8d97546f7ca69540924aa0637f720500bef3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2d6f8d97546f7ca69540924aa0637f720500bef3) | `fix(admin): дополнить тип sort_by и китайскую строку сортировки` |
| 10 | 2026-08-05 23:11:20 | [`fdaf03feffdf0542b0af7316de18bed26d381ff3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fdaf03feffdf0542b0af7316de18bed26d381ff3) | `Merge pull request #534 from BlackRaincoat/feat/sort-users-by-subscription-expiry` |
| 11 | 2026-08-05 23:13:07 | [`76e10cc06ccc3e59183b4036c57d40cd065ecbf3`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/76e10cc06ccc3e59183b4036c57d40cd065ecbf3) | `Merge remote-tracking branch 'origin/dev' into pr-539` |
| 12 | 2026-08-05 23:16:02 | [`c1088325aabaf43de6f60653ff650c3cfb1beb2f`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/c1088325aabaf43de6f60653ff650c3cfb1beb2f) | `fix(auth): вернуть виджет после «Назад» и добить локали до четырёх` |
| 13 | 2026-08-05 23:16:11 | [`02b3ffd4a0afb72b750357588917feadf2a82e64`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/02b3ffd4a0afb72b750357588917feadf2a82e64) | `Merge pull request #539 from off-art/feat/manual-deeplink-login` |
| 14 | 2026-08-05 23:22:42 | [`fa6b57b6ed5965479257d3bd9b1800547ec9f591`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/fa6b57b6ed5965479257d3bd9b1800547ec9f591) | `Merge remote-tracking branch 'origin/dev' into pr-542` |
| 15 | 2026-08-05 23:25:02 | [`415a76f7cff4e0e06edb15b91a24467f0465e2e9`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/415a76f7cff4e0e06edb15b91a24467f0465e2e9) | `fix(users): показывать причину отказа при удалении подписки` |
| 16 | 2026-08-05 23:25:10 | [`04d39907491a9241630eb9ef05ce7e7e9ed624a5`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/04d39907491a9241630eb9ef05ce7e7e9ed624a5) | `Merge pull request #542 from Case211/feat/admin-delete-subscription` |
| 17 | 2026-08-05 23:35:35 | [`1883ec93400cfa623f7fadfd796d566bc33bf7bd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/1883ec93400cfa623f7fadfd796d566bc33bf7bd) | `Merge remote-tracking branch 'origin/dev' into pr-543` |
| 18 | 2026-08-05 23:53:02 | [`29c9ed1a40bad95b187fabd81098a795d4c096da`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/29c9ed1a40bad95b187fabd81098a795d4c096da) | `fix(promocodes): чекбоксы набора по значениям, трафик в списке` |
| 19 | 2026-08-05 23:53:11 | [`3995ed8a28b2f82b43da56ce8b692d6b8202a69d`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/3995ed8a28b2f82b43da56ce8b692d6b8202a69d) | `Merge pull request #543 from Case211/feat/promocode-traffic-bonus` |
| 20 | 2026-08-07 12:24:13 | [`9532819fc6104c98e3a4e377755fc14d38620576`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9532819fc6104c98e3a4e377755fc14d38620576) | `Merge remote-tracking branch 'origin/dev' into pr-544` |
| 21 | 2026-08-07 12:27:17 | [`39b9b8e1d2690c894ce08b0ce16d4780ecffee09`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/39b9b8e1d2690c894ce08b0ce16d4780ecffee09) | `fix(dashboard): счётчик устройств в плитке на главной` |
| 22 | 2026-08-07 12:27:29 | [`9a12e002fd3bea1e0fc94b46430934e275da69cd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/9a12e002fd3bea1e0fc94b46430934e275da69cd) | `Merge pull request #544 from Case211/feat/home-connect-device` |
| 23 | 2026-08-10 14:38:47 | [`d88928912acaaf9eeee52235ee4e2aace5e245e7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d88928912acaaf9eeee52235ee4e2aace5e245e7) | `fix(support): показывать пользователю отказ бэка при создании тикета` |
| 24 | 2026-08-11 10:40:38 | [`a82950126e5600a9cd63e3db45f91f6d713a73be`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a82950126e5600a9cd63e3db45f91f6d713a73be) | `Merge remote-tracking branch 'origin/dev' into pr-548` |
| 25 | 2026-08-11 10:44:00 | [`533fc3073f24c3a6dc8c280c99ff4e1cf0c27a7d`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/533fc3073f24c3a6dc8c280c99ff4e1cf0c27a7d) | `test(support): закрепить привязку onError к мутациям тикетов` |
| 26 | 2026-08-11 10:44:30 | [`893b4020bdd2eff7d21b6c60b773e45005aee8b0`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/893b4020bdd2eff7d21b6c60b773e45005aee8b0) | `Merge pull request #548 from AirP0WeR/fix/support-ticket-errors` |
| 27 | 2026-08-12 12:08:32 | [`d4379fce25af69e866e9232a3cd036652e7eae17`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d4379fce25af69e866e9232a3cd036652e7eae17) | `feat(landing): отправлять слаг рекламной кампании при гостевой покупке` |
| 28 | 2026-08-17 06:07:53 | [`2ba6fc0f6f743b8648c0d1e708cd123a465ee77f`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2ba6fc0f6f743b8648c0d1e708cd123a465ee77f) | `fix(tickets): длинный текст в сообщении уезжал за пределы карточки` |
| 29 | 2026-08-17 18:23:35 | [`cfc2ab2f7fe641570a818d0ca75c9cd9dddbf2b7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cfc2ab2f7fe641570a818d0ca75c9cd9dddbf2b7) | `Merge pull request #549 from AirP0WeR/feat/campaign-slug-on-guest-purchase` |
| 30 | 2026-08-17 18:23:35 | [`8e9bb0dc23e2f963673a25a494d58d549327a759`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8e9bb0dc23e2f963673a25a494d58d549327a759) | `test(landing): закрепить отправку слага кампании при гостевой покупке` |
| 31 | 2026-08-17 18:54:25 | [`eede5ffdfdde9ece9956817c646ade36a9b2ccf6`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/eede5ffdfdde9ece9956817c646ade36a9b2ccf6) | `Merge pull request #551 from Chara-Freedom/fix/ticket-long-message-wrap` |
| 32 | 2026-08-17 18:54:25 | [`714ece82508533b076eeecdb4a503a8600186d63`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/714ece82508533b076eeecdb4a503a8600186d63) | `test(tickets): закрепить перенос длинного текста в сообщении` |
| 33 | 2026-08-17 20:18:48 | [`cb309ead51dd6031c640927d0accfeb111e9ff63`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/cb309ead51dd6031c640927d0accfeb111e9ff63) | `now able to pass username \| email in params` |
| 34 | 2026-08-18 12:11:35 | [`8d0c33bb08b8f28b19367d1ea612a8455fba0ff1`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8d0c33bb08b8f28b19367d1ea612a8455fba0ff1) | `Merge pull request #552 from DarkWood312/main` |
| 35 | 2026-08-18 12:11:49 | [`acbffa4e17e4549a1068f286e3009b38d30ae6be`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/acbffa4e17e4549a1068f286e3009b38d30ae6be) | `fix(landing): не оставлять контакт из ссылки в адресной строке` |
| 36 | 2026-08-18 23:00:41 | [`f81af401f7f6ca1a28806cbf237a33da7449d893`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f81af401f7f6ca1a28806cbf237a33da7449d893) | `fix(auth): читать initData из моста Telegram, а не только из кэша SDK` |
| 37 | 2026-08-19 13:01:05 | [`b4e1de6152cfc85418c62e4f840180411989a2a7`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/b4e1de6152cfc85418c62e4f840180411989a2a7) | `feat(remnawave): GeoCheck ноды в админке — запуск проверки и просмотр отчёта` |
| 38 | 2026-08-19 13:55:27 | [`28e25a92922501ed609623776e987fcd96f71032`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/28e25a92922501ed609623776e987fcd96f71032) | `feat(dashboard): подключение устройства прикреплено к карточке подписки` |
| 39 | 2026-08-19 14:23:30 | [`debe26ae359545fead38bf087b069e9defecec26`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/debe26ae359545fead38bf087b069e9defecec26) | `fix(geocheck): сквозные клики через портал и safe-зоны в полноэкранном режиме` |
| 40 | 2026-08-19 14:33:56 | [`5db1ffccf6a6659c06a1fbe5b2b703abd0c609bd`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5db1ffccf6a6659c06a1fbe5b2b703abd0c609bd) | `fix(geocheck): убрать полноэкранный режим в Telegram Mini App` |
| 41 | 2026-08-19 14:58:54 | [`5c3031f5f52e4a7bbe101441a97f5e47dd1eff3f`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5c3031f5f52e4a7bbe101441a97f5e47dd1eff3f) | `fix(geocheck): скелетон до отрисовки отчёта и сброс зума на новом отчёте` |
| 42 | 2026-08-19 15:11:58 | [`a451a129fe0b211369f336f09f8c8e1abd105173`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a451a129fe0b211369f336f09f8c8e1abd105173) | `fix(geocheck): убрать скачивание отчёта в Telegram Mini App` |
| 43 | 2026-08-20 09:38:16 | [`6474b28cef525083c17631238165cce198c991ca`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/6474b28cef525083c17631238165cce198c991ca) | `Merge pull request #554 from BEDOLAGA-DEV/dev` |
| 44 | 2026-08-20 09:39:10 | [`8a7ef9ace0fc714dac242b44459ef504d86f1737`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/8a7ef9ace0fc714dac242b44459ef504d86f1737) | `chore(main): release 1.66.0` |
| 45 | 2026-08-20 09:40:40 | [`2192484b011068d8cb75c61a6aeaada1d06115aa`](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2192484b011068d8cb75c61a6aeaada1d06115aa) | `Merge pull request #555 from BEDOLAGA-DEV/release-please--branches--main--components--cabinet-frontend` |

## 5. Changed files и статистика

Вся таблица ниже получена из одного exact GitHub Compare:
<https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa>.

| Status | `+` | `-` | File |
| --- | ---: | ---: | --- |
| M | 33 | 0 | `CHANGELOG.md` |
| M | 17 | 2 | `package-lock.json` |
| M | 2 | 1 | `package.json` |
| M | 68 | 0 | `src/api/adminRemnawave.ts` |
| M | 15 | 1 | `src/api/adminUsers.ts` |
| M | 6 | 8 | `src/api/client.ts` |
| M | 4 | 0 | `src/api/landings.ts` |
| M | 4 | 0 | `src/api/promocodes.ts` |
| M | 77 | 20 | `src/components/TelegramLoginButton.tsx` |
| A | 167 | 0 | `src/components/admin/remnawave/GeoCheckImageViewer.tsx` |
| A | 234 | 0 | `src/components/admin/remnawave/GeoCheckModal.tsx` |
| A | 231 | 0 | `src/components/admin/remnawave/GeoCheckReport.tsx` |
| A | 152 | 0 | `src/components/admin/remnawave/GeoCheckSetup.tsx` |
| A | 134 | 0 | `src/components/admin/remnawave/geoCheckRoute.test.ts` |
| A | 55 | 0 | `src/components/admin/remnawave/geoCheckRoute.ts` |
| A | 121 | 0 | `src/components/admin/remnawave/useGeoCheckJob.ts` |
| M | 37 | 0 | `src/components/admin/userDetail/SubscriptionTab.tsx` |
| M | 1 | 1 | `src/components/admin/userDetail/TicketsTab.tsx` |
| A | 143 | 0 | `src/components/dashboard/ConnectDeviceTile.tsx` |
| M | 6 | 111 | `src/components/dashboard/SubscriptionCardActive.tsx` |
| M | 26 | 0 | `src/components/icons/extended-icons.tsx` |
| A | 139 | 0 | `src/components/subscription/DeviceLimitSheet.tsx` |
| A | 93 | 0 | `src/components/subscription/SubscriptionConnectFooter.tsx` |
| M | 113 | 76 | `src/components/subscription/SubscriptionListCard.tsx` |
| A | 70 | 0 | `src/components/subscription/connectFooterState.test.ts` |
| A | 61 | 0 | `src/components/subscription/connectFooterState.ts` |
| A | 90 | 0 | `src/components/ui/ResponsiveSheet.tsx` |
| M | 2 | 6 | `src/hooks/useTelegramSDK.ts` |
| M | 73 | 5 | `src/locales/en.json` |
| M | 73 | 5 | `src/locales/fa.json` |
| M | 73 | 5 | `src/locales/ru.json` |
| M | 73 | 5 | `src/locales/zh.json` |
| M | 4 | 3 | `src/main.tsx` |
| M | 43 | 4 | `src/pages/AdminPromocodeCreate.tsx` |
| M | 18 | 7 | `src/pages/AdminPromocodes.tsx` |
| M | 256 | 227 | `src/pages/AdminRemnawave.tsx` |
| M | 1 | 1 | `src/pages/AdminTickets.tsx` |
| M | 24 | 0 | `src/pages/AdminUserDetail.tsx` |
| M | 1 | 0 | `src/pages/AdminUsers.tsx` |
| M | 53 | 2 | `src/pages/Dashboard.tsx` |
| M | 14 | 7 | `src/pages/QuickPurchase.tsx` |
| M | 40 | 10 | `src/pages/Support.tsx` |
| A | 91 | 0 | `src/utils/campaign.test.ts` |
| A | 127 | 0 | `src/utils/contactPrefill.test.ts` |
| A | 41 | 0 | `src/utils/contactPrefill.ts` |
| A | 52 | 0 | `src/utils/nodeVersion.test.ts` |
| A | 43 | 0 | `src/utils/nodeVersion.ts` |
| A | 139 | 0 | `src/utils/telegramInitData.test.ts` |
| A | 63 | 0 | `src/utils/telegramInitData.ts` |
| A | 85 | 0 | `src/utils/ticketErrors.test.ts` |
| A | 14 | 0 | `src/utils/ticketErrors.ts` |
| A | 46 | 0 | `src/utils/ticketMessageWrap.test.ts` |
| M | 6 | 0 | `src/vite-env.d.ts` |
| **Итого** | **3 554** | **507** | **53 файла** |

## 6. Dependency и lockfile changes

`package.json` и корень `package-lock.json` изменяют версию приложения с
`1.65.0` на `1.66.0`. Единственная новая runtime-зависимость:
`react-zoom-pan-pinch: ^4.0.4`; lockfile фиксирует `4.0.4`, MIT, с peer
dependencies `react` и `react-dom`. Она используется только просмотрщиком
GeoCheck для zoom/pan/pinch. Остальные dependency и devDependency версии в
диапазоне не изменены. Источники:
[package.json raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/package.json),
[package-lock.json raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/package-lock.json),
[GeoCheck viewer raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckImageViewer.tsx),
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

Lockfile содержит согласованную root-запись и новый package node, но ни commit,
ни release notes не сообщают, какой конкретно командой он был сгенерирован.
Поэтому факт запуска `npm install`/`npm update` не установлен. Источники:
[lockfile raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/package-lock.json),
[release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0).

## 7. API и type contracts

### 7.1 Новые и расширенные контракты

| Область | Изменение | Совместимость и источник |
| --- | --- | --- |
| Admin users list | В union `sort_by` добавлен `subscription_end_date`; UI отправляет его через существующий `GET /cabinet/admin/users`. | Additive query value, но старый Upstream Bot его не знает. [Cabinet source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminUsers.ts), [Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e3713ce9710dfa8d3fbfc1abf10b034378fd8978) |
| Admin subscription deletion | Новый frontend method выполняет `DELETE /cabinet/admin/users/{userId}/subscriptions/{subId}` и добавляет `force=true` для активной платной подписки. | Требует нового Bot route; server commit описывает ownership/IDOR guard и `409` без force. [Cabinet source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminUsers.ts), [Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/56a9959d7738d6b646bcfd001b5de265a683b604) |
| Promocodes | `traffic_gb` добавлен в `PromoCode`, create и update payload; форма валидирует положительное значение и использует `balance_and_days` для набора с traffic. | Требует поля, миграции и начисления на Bot. [Cabinet source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/promocodes.ts), [Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/93f5bff49691847284e8d8bb12650bffaef92084) |
| Guest purchase | В `PurchaseRequest` добавлено необязательное `campaign_slug`; Quick Purchase читает сохранённый slug без consume и отправляет его. | Атрибуция и бонус source-backed подтверждены только с Bot implementation из `v4.1.0`; поведение более раннего Bot здесь не предполагается. [Cabinet source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/landings.ts), [purchase source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/QuickPurchase.tsx), [Bot release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0) |
| Node model | Добавлены `NodeIpStatus`, `NodeIpAddress` и `NodeInfo.ips`; IP используются как варианты исходного route GeoCheck. | Additive response fields. [Cabinet source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminRemnawave.ts), [Bot GeoCheck commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98) |
| GeoCheck start | Новый `POST /cabinet/admin/remnawave/nodes/{uuid}/geocheck`, body `{}`, `{ip}` или `{interface}`, response `{job_id}`. | Требует Bot proxy и Remnawave panel/node 3.3.0+. [Cabinet source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminRemnawave.ts), [Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98) |
| GeoCheck result | Новый `GET /cabinet/admin/remnawave/geocheck/{jobId}` с `is_completed`, `is_failed`, `result`, base64 image и raw report. Frontend polling: 2,5 секунды, ceiling 180 секунд. | Новый Bot contract. [Cabinet API](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminRemnawave.ts), [polling source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/useGeoCheckJob.ts), [Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98) |

Существующие API methods не удалены и не переименованы. Изменения контрактов
аддитивны на уровне TypeScript, но для новых server-dependent функций более
ранний Upstream Bot не имеет source-backed гарантии совместимости. Источники:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa),
[Bot v4.0.0...v4.1.0](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/f553d1896dcd347fd74012f6394fd2277161bdd1...49b05d5ab79dd9bb92f0404bb0066cda8a175649).

### 7.2 Поведение без нового API

Dashboard в multi-tariff режиме теперь делает до трёх существующих запросов
устройств, по одному на видимую карточку, с query key `['devices', sub.id]`.
При полном лимите окно позволяет удалить устройство через существующий
`subscriptionApi.deleteDevice` или перейти к докупке слотов. Это меняет
сетевую нагрузку и UI-поведение, но не вводит новый API route. Источники:
[Dashboard raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Dashboard.tsx),
[DeviceLimitSheet raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/subscription/DeviceLimitSheet.tsx).

Support UI теперь обрабатывает `409` при уже открытом тикете, инвалидирует
список тикетов и показывает backend detail/fallback для остальных ошибок
создания и ответа. Endpoint shapes не менялись. Источники:
[Support raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Support.tsx),
[ticket error helper](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/ticketErrors.ts).

## 8. Browser routes, deep links и URL parameters

Новых React Router paths и callback routes нет: `src/App.tsx` и
`src/AppWithNavigator.tsx` не изменены в exact compare. Изменился только
контракт query-параметра существующего `/buy/:slug`: `?contact=email` или
`?contact=@username` имеет приоритет над ранее сохранённым значением, после
чтения удаляется через `history.replaceState`, остальные query params и hash
сохраняются. Источники:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa),
[contact source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/contactPrefill.ts),
[QuickPurchase source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/QuickPurchase.tsx).

Telegram deep-link формат не изменён: используется
`https://t.me/{bot}?start=webauth_{token}` и `/start webauth_{token}`. Изменён
способ входа в flow: теперь пользователь может выбрать его вручную даже при
рабочем Telegram widget, вернуться к widget и продолжить существующий polling.
Referral link остаётся отдельным только при наличии referral code. Источники:
[auth commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d03b9bdad785ac7710f30527f230eeb793e1089b),
[TelegramLoginButton raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/TelegramLoginButton.tsx).

Новых Telegram `startapp` values, OAuth callback paths или browser route
redirects в диапазоне нет. Источник:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

## 9. Storage и cache keys

Новых persistent storage keys не добавлено. Quick Purchase продолжает
использовать существующий `lp_contact_{slug}` и теперь сначала читает
`contact` из URL. Для кампании используются существующие
`campaign_slug`/`campaign_slug_ttl` с TTL 24 часа; новый purchase flow вызывает
`getPendingCampaignSlug()`, поэтому slug не удаляется и остаётся доступен
последующему auth flow. Источники:
[contact source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/contactPrefill.ts),
[campaign source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/campaign.ts),
[purchase source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/QuickPurchase.tsx).

Telegram auth меняет чтение кэша, а не его schema: SDK может вернуть старое
значение из `tapps/launchParams` в `sessionStorage`, поэтому новый helper
сравнивает SDK value с `window.Telegram.WebApp.initData` по `auth_date` и
выбирает более свежее. API client затем сохраняет выбранное значение прежним
`tokenStorage.setTelegramInitData`. Источники:
[initData helper](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/telegramInitData.ts),
[API client](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/client.ts).

Добавлен временный React Query cache key
`['admin-remnawave-geocheck', jobId]` с `gcTime: 0`; он обслуживает polling и
не является persistent storage. На Dashboard существующий per-subscription
key `['devices', sub.id]` теперь используется сразу для каждой из максимум
трёх видимых подписок. Источники:
[GeoCheck polling source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/useGeoCheckJob.ts),
[Dashboard source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Dashboard.tsx).

Frontend database schema отсутствует, и в Upstream Cabinet диапазоне нет
миграций. Миграции `traffic_gb` и guest purchase campaign принадлежат Upstream
Bot `v4.1.0`, а не Cabinet. Источники:
[Cabinet compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa),
[Bot v4.1.0 release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0).

## 10. WebSocket

WebSocket code, URL construction, message types и event handlers не изменены:
в changed files отсутствуют `src/providers/*`, `src/hooks/useWebSocket.ts` и
`src/components/WebSocketNotifications.tsx`. GeoCheck реализован через HTTP
POST + периодический HTTP GET, не через WebSocket. Источники:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa),
[GeoCheck polling source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/useGeoCheckJob.ts).

Итог для WebSocket: новых событий, payload types, reconnect rules и channel
names не обнаружено. Источник:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

## 11. Payments и guest purchase

Payment gateway selection, payment method IDs, суммы, валюта и redirect по
`payment_url` не менялись. Изменён контекст гостевой покупки: в payload может
добавляться `campaign_slug`, а контакт может прийти через `?contact=`. Это
влияет на campaign attribution и bonus после оплаты, но не на расчёт или
инициацию платежа в frontend. Источники:
[PurchaseRequest source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/landings.ts),
[QuickPurchase source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/QuickPurchase.tsx),
[campaign Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/1c46702cdf18c437c71de6d0129a65cdfa0f4794).

Удаление подписки администратором косвенно относится к payment lifecycle:
server-side реализация Upstream Bot отменяет связанные автоплатежи до удаления
строки и защищает активную платную подписку требованием `force`. Cabinet только
вызывает новый route после двухшагового подтверждения. Источники:
[Cabinet delete source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/AdminUserDetail.tsx),
[Bot delete commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/56a9959d7738d6b646bcfd001b5de265a683b604).

## 12. Telegram-specific changes

1. Ручной deep-link login через бота стал равноправной альтернативой widget;
   automatic fallback при падении widget сохранён. Источники:
   [commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d03b9bdad785ac7710f30527f230eeb793e1089b),
   [source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/TelegramLoginButton.tsx).
2. `initData` читается и из SDK, и из официального bridge, после чего выбирается
   кандидат с максимальным `auth_date`; `main.tsx`, API client и SDK hook
   используют общий helper. Источники:
   [commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f81af401f7f6ca1a28806cbf237a33da7449d893),
   [helper](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/telegramInitData.ts),
   [main](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/main.tsx).
3. GeoCheck в Telegram Mini App не показывает fullscreen и download: fullscreen
   конфликтует с Telegram chrome/safe zones, а browser `download` уводит
   webview на blob URL вместо сохранения. JSON copy и zoom остаются. Источники:
   [fullscreen commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/5db1ffccf6a6659c06a1fbe5b2b703abd0c609bd),
   [download commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/a451a129fe0b211369f336f09f8c8e1abd105173),
   [report source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckReport.tsx).

## 13. Localization

Изменены ровно четыре locale-файла: `en`, `fa`, `ru`, `zh`. Сравнение
flattened scalar keys показывает для каждого locale 52 новых ключа, 0
удалённых и 0 изменённых значений существующих ключей. Категории новых ключей:
3 auth, 8 subscription connect footer, 3 support errors, 29 GeoCheck,
4 promocode traffic, 1 user sort и 4 subscription deletion. Источники:
[locale compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa),
[en raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/locales/en.json),
[fa raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/locales/fa.json),
[ru raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/locales/ru.json),
[zh raw](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/locales/zh.json).

Новых locale codes нет; существующий набор из четырёх языков сохранён.
Источник:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

## 14. Security и privacy

1. `contact` может содержать email или Telegram username. После чтения параметр
   удаляется из URL с сохранением остальных params/hash, чтобы снизить попадание
   PII в последующую аналитику, Referer и browser history. Это не очищает
   начальный HTTP request или уже созданные proxy/access logs; для них нужна
   отдельная server-side redaction policy. Источники:
   [privacy fix commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/acbffa4e17e4549a1068f286e3009b38d30ae6be),
   [source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/contactPrefill.ts).
2. Telegram login reliability/security boundary больше не зависит только от
   потенциально старого SDK cache: frontend выбирает candidate с наиболее
   свежим `auth_date` между SDK и официальным Telegram bridge. Правила
   server-side валидации initData, frontend auth endpoints и header name этим
   диапазоном не менялись. Источники:
   [fix commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/f81af401f7f6ca1a28806cbf237a33da7449d893),
   [helper](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/telegramInitData.ts),
   [API client](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/client.ts).
3. GeoCheck SVG не вставляется как raw markup; он показывается через
   `<img src="data:...">` в изолированном image context. IP/interface проходят
   client validation, а Upstream Bot дополнительно валидирует взаимоисключающие
   поля и защищает start/read permissions как `remnawave:manage` и
   `remnawave:read`. Источники:
   [Cabinet report source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckReport.tsx),
   [route validation](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/geoCheckRoute.ts),
   [Bot GeoCheck commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98).
4. Удаление подписки остаётся под frontend permission
   `users:subscription`, двухшаговым подтверждением и server ownership check;
   активная платная подписка требует явного force. Источники:
   [Cabinet UI source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/userDetail/SubscriptionTab.tsx),
   [Bot route commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/56a9959d7738d6b646bcfd001b5de265a683b604).

Новых CSP rules, auth permissions в Cabinet, cryptographic algorithms или
security dependency upgrades в диапазоне нет. Источник:
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

## 15. Accessibility

GeoCheck modal и новый responsive dialog используют focus trap, Escape,
`role="dialog"`, `aria-modal`, labelled title и минимум 44x44 для close.
Route selector использует `tablist`/`tab`/`aria-selected`, input сообщает
`aria-invalid`, loading states используют `aria-busy`, image имеет
локализованный alt, а toolbar icon buttons имеют `aria-label`. Источники:
[GeoCheck modal](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckModal.tsx),
[GeoCheck setup](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckSetup.tsx),
[GeoCheck report](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckReport.tsx),
[ResponsiveSheet](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/ui/ResponsiveSheet.tsx).

Subscription card больше не является внешней кнопкой с вложенной второй
кнопкой: внешний контейнер стал `div`, а тело и connect footer являются
отдельными button-зонами. Это устраняет невалидную nested-button разметку.
Источник:
[SubscriptionListCard](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/subscription/SubscriptionListCard.tsx).

Длинные URL, keys и base64 в ticket messages получили `break-words` в user,
admin и user-detail views, поэтому текст больше не становится недоступным за
скрытым горизонтальным overflow. Источники:
[commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/2ba6fc0f6f743b8648c0d1e708cd123a465ee77f),
[Support source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Support.tsx).

## 16. Build и deployment

Build impact ограничен новой runtime-зависимостью
`react-zoom-pan-pinch` и version bump package metadata. Scripts, TypeScript
config, Vite config, Dockerfile, compose, nginx и `.github` workflows не
изменены. Источники:
[package.json](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/package.json),
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

Release не содержит бинарных/build assets и не публикует deployment или
migration instructions. Новых environment variables и runtime image
requirements в Cabinet source не обнаружено. Источники:
[release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0),
[exact compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa).

Сборка и тесты этого upstream snapshot в рамках исследования не запускались:
задача требовала source research без интеграции. Наличие test files и заявления
в commit/PR не считаются runtime-доказательством совместимости Release Bundle.

## 17. Возможная минимальная версия Upstream Bot

### 17.1 Source-backed результат

Минимальная **опубликованная версия, которую первичные источники позволяют
назвать для полного набора новых server-dependent функций Cabinet v1.66.0**:

| Component | Version | Exact SHA | Source |
| --- | --- | --- | --- |
| Upstream Bot | `v4.1.0` | `49b05d5ab79dd9bb92f0404bb0066cda8a175649` | [Release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0), [commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/49b05d5ab79dd9bb92f0404bb0066cda8a175649) |

Обоснование не основано на совпадении номеров. Exact compare Upstream Bot
`v4.0.0` SHA `f553d1896dcd347fd74012f6394fd2277161bdd1` → `v4.1.0` SHA
`49b05d5ab79dd9bb92f0404bb0066cda8a175649` содержит все пять новых
server-side contracts, которые использует Cabinet range. Источник:
[Bot exact compare](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/f553d1896dcd347fd74012f6394fd2277161bdd1...49b05d5ab79dd9bb92f0404bb0066cda8a175649).

| Cabinet requirement | Upstream Bot evidence inside `v4.1.0` |
| --- | --- |
| `sort_by=subscription_end_date` | [`e3713ce9710dfa8d3fbfc1abf10b034378fd8978`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/e3713ce9710dfa8d3fbfc1abf10b034378fd8978) |
| Delete concrete user subscription | [`56a9959d7738d6b646bcfd001b5de265a683b604`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/56a9959d7738d6b646bcfd001b5de265a683b604) |
| Promocode `traffic_gb` | [`93f5bff49691847284e8d8bb12650bffaef92084`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/93f5bff49691847284e8d8bb12650bffaef92084) |
| Guest purchase campaign attribution | [`1c46702cdf18c437c71de6d0129a65cdfa0f4794`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/1c46702cdf18c437c71de6d0129a65cdfa0f4794), [v4.1.0 notes](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0) |
| GeoCheck proxy and permissions | [`134d8e4ef828d138bc74a4608af9ee64c15e6e98`](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98) |

Upstream Bot `v4.0.0` не содержит эти commits, потому что они находятся в
exact range `v4.0.0...v4.1.0`; следовательно, `v4.0.0` не поддерживает полный
набор новых server-dependent функций v1.66.0. Источники:
[Bot compare](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/f553d1896dcd347fd74012f6394fd2277161bdd1...49b05d5ab79dd9bb92f0404bb0066cda8a175649),
[v4.0.0 release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.0.0),
[v4.1.0 release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0).

GeoCheck дополнительно требует Remnawave panel и node 3.3.0 или новее; это не
версия Upstream Bot, а отдельная внешняя runtime-граница. Источники:
[Bot GeoCheck commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98),
[Cabinet version gate](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/nodeVersion.ts).

### 17.2 Что нельзя утверждать

Нельзя доказанно назвать более ранний untagged SHA Upstream Bot как общий
minimum: Cabinet release не фиксирует aggregate Bot SHA, а отдельные функции
вливались разными commits. `v4.1.0` является самым ранним проверенным
опубликованным target, для которого в одном exact SHA доказано наличие всего
нужного набора, но это ещё не runtime-сертификация пары. Источники:
[Cabinet release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0),
[Bot release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0),
[Bot compare](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/f553d1896dcd347fd74012f6394fd2277161bdd1...49b05d5ab79dd9bb92f0404bb0066cda8a175649).

## 18. Неизвестные и непроверенные факты

1. Нет upstream compatibility matrix или release statement, который прямо
   объявляет пару Cabinet `v1.66.0` + Bot `v4.1.0`; совместимый минимум выше
   установлен по exact contract commits, а не по официальной матрице.
   Источники:
   [Cabinet release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0),
   [Bot release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0).
2. Более ранний общий untagged Bot SHA не установлен и не должен считаться
   совместимым без отдельной source и runtime-проверки. Источник:
   [Bot compare](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/f553d1896dcd347fd74012f6394fd2277161bdd1...49b05d5ab79dd9bb92f0404bb0066cda8a175649).
3. Неизвестно, какой npm-командой обновлялся lockfile; зафиксирован только его
   итог. Источник:
   [lockfile](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/package-lock.json).
4. Release не содержит build assets, поэтому по нему нельзя проверить bundle
   size, chunking, sourcemaps или содержимое production image. Источник:
   [Cabinet release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0).
5. Source review не доказывает фактическую работу Telegram WebView, payment
   attribution, GeoCheck, permissions и migrations в конкретном deployment;
   для этого потребуется отдельная интеграция и runtime smoke, которые в этой
   задаче намеренно не выполнялись.
6. Нет источника, подтверждающего поддержку GeoCheck на Remnawave ниже 3.3.0;
   source явно ставит границу 3.3.0. Источники:
   [Bot commit](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/commit/134d8e4ef828d138bc74a4608af9ee64c15e6e98),
   [Cabinet gate](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/nodeVersion.ts).

## 19. Матрица затронутых областей

| Область | Итог | Основной источник |
| --- | --- | --- |
| API | Да: 2 GeoCheck routes, admin delete route, новые query/payload fields | [Compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa) |
| Types | Да: GeoCheck, node IPs, sort value, `traffic_gb`, `campaign_slug` | [Raw API sources](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/api/adminRemnawave.ts) |
| Browser routes | Нет новых paths; да: новый `contact` query contract | [Contact source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/contactPrefill.ts) |
| Storage | Нет новых persistent keys; добавлен временный GeoCheck query key, изменено чтение campaign/contact/initData | [Campaign source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/utils/campaign.ts), [GeoCheck polling](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/useGeoCheckJob.ts) |
| WebSocket | Нет изменений | [Compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa) |
| Payment | Да: campaign attribution payload и косвенно безопасное удаление subscription/autopay | [Purchase source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/QuickPurchase.tsx) |
| Telegram | Да: manual deep-link login, свежий initData, GeoCheck platform guards | [Release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| Localization | Да: +52 keys в каждом из `en/fa/ru/zh` | [Compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa) |
| Security/privacy | Да: contact URL cleanup, initData source selection, isolated SVG, guarded admin delete | [Security-related commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/acbffa4e17e4549a1068f286e3009b38d30ae6be) |
| Accessibility | Да: modal semantics/focus/labels, no nested buttons, long-text wrap | [GeoCheck modal](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/components/admin/remnawave/GeoCheckModal.tsx) |
| Build | Да: `react-zoom-pan-pinch` и package version bump | [package.json](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/package.json) |
| Deployment | Нет config/workflow/image changes и нет release assets | [Compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa), [release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| User dashboard | Да: per-subscription connect footer и device-limit flow | [Dashboard source](https://raw.githubusercontent.com/BEDOLAGA-DEV/bedolaga-cabinet/2192484b011068d8cb75c61a6aeaada1d06115aa/src/pages/Dashboard.tsx) |
| Admin UI | Да: GeoCheck, sort, delete subscription, promocode traffic | [Release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0) |
| Support/tickets | Да: surfaced backend errors и long-token wrapping | [Support commit](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/commit/d88928912acaaf9eeee52235ee4e2aace5e245e7) |

## 20. Проверка точности

Перед завершением были сопоставлены:

1. `git ls-remote`, Git object type, `rev-parse`, `rev-list`, `merge-base` и
   `git diff` локального clone upstream.
2. GitHub Release target, Git Ref object, exact Compare commit list и per-file
   stats.
3. Exact raw source target SHA для всех контрактных областей.
4. Upstream Bot releases, exact tag SHAs, compare `v4.0.0...v4.1.0` и commits
   каждой новой backend-зависимости.

Результаты совпали: Cabinet target
`2192484b011068d8cb75c61a6aeaada1d06115aa`, 45 commits, 53 files,
3 554 insertions, 507 deletions; возможный source-backed tagged minimum
Upstream Bot `v4.1.0` exact
`49b05d5ab79dd9bb92f0404bb0066cda8a175649`. Источники:
[Cabinet compare](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/compare/b866bebeeb6032db4baa3869a4917316fe8e0453...2192484b011068d8cb75c61a6aeaada1d06115aa),
[Cabinet release](https://github.com/BEDOLAGA-DEV/bedolaga-cabinet/releases/tag/v1.66.0),
[Bot compare](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/compare/f553d1896dcd347fd74012f6394fd2277161bdd1...49b05d5ab79dd9bb92f0404bb0066cda8a175649),
[Bot release](https://github.com/BEDOLAGA-DEV/remnawave-bedolaga-telegram-bot/releases/tag/v4.1.0).
