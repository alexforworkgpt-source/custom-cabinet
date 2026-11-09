# Аватарка в профиле Custom Cabinet — 2026-10-28

## Согласованное поведение

Владелец подтвердил размещение внутри первой карточки `/profile` и три browser
seams: фото/единственная подпись пользователя, отсутствие/ошибка фото и поздняя
загрузка со стабильной адаптивной геометрией.

- Круглая аватарка56px на мобильном,64px с breakpoint sm.
- Рядом одно имя и необязательный `@username`; прежние дублирующие строки удалены.
- Telegram ID, email/их действия Connect, дата регистрации, Connected Accounts,
  preferences и остальные разделы профиля сохранены.
- Без доступного фото — инициалы реального имени; без имени — UserIcon.
  Читаемая подпись сохраняет существующий `displayName` fallback.
- Инициалы/иконка остаются до фактического onLoad изображения, а не только до
  получения его URL. При ошибке остаётся заглушка. Размер слота не меняется.
- Фото только отображается: нет кнопки редактирования, загрузки или нового flow.

## Точка сравнения и владельцы

Исходная точка — текущая owner working tree после mobile-navigation задачи,
HEAD `0d04a822`, не чистый HEAD и не production. Снимок926source/test identities
и исходный Profile сохранены в `.scratch/profile-avatar-20261028/before.json`
и `Profile.before.tsx`. Предыдущие owner changes сохранены.

`Profile.tsx` вызывает существующий `useUserAvatar(user)` и передаёт результат
в небольшой read-only `components/profile/ProfileIdentity.tsx`. Новый компонент
владеет только представлением, инициалами и состоянием загруженной картинки.
`useUserAvatar`, существующий `/cabinet/auth/me/avatar`, приоритет Telegram
initData/API, key `my-avatar` с user ID, hour staleTime и retry:false не менялись.
Email-only пользователь не запрашивает Telegram avatar endpoint.

Использованы текущие Card/md, UserIcon, displayName/uiLocale, цветовые токены,
utility-классы и общий вход Profile. Новых CSS-классов, inline styles, global CSS,
зависимостей или изменений Upstream Bot/API/БД нет. Accessible label аватара
добавлен в существующие4locale JSON; внутренняя картинка имеет декоративный alt,
чтобы имя пользователя не объявлялось повторно.

## TDD

1. **RED photo:** на готовом Profile отсутствует `Profile picture`.
   **GREEN:** полный контейнер фото, имя/username по одному экземпляру,
   существующие данные и переход к аккаунтам сохранены.
2. **RED initials:** отсутствие photo_url даёт иконку вместо ожидаемыхDI.
   **GREEN:** инициалы при null/ошибке API/ошибке загрузки картинки; для пользователя
   без реального имени остаётся иконка. Email-only не делает avatar GET.
3. **RED late image:** после получения URL инициалы исчезают до прихода image bytes.
   **GREEN:** локальное `loadedSrc` держит placeholder до onLoad; avatar/name/email
   сохраняют свои ширины, высоты и Y с допуском1px при поздних данных и картинке.

Это browser tests настоящей страницы с существующим API harness; не подменяются
React-компоненты или внутренние функции. Фото — локальная SVG fixture, не
реальные пользовательские данные и не новый production asset.

`tests/e2e/profile-avatar.spec.ts`:7сценариев. Первый также проверяет дату,
возврат из Connected Accounts и отсутствие повторного avatar GET в пределах
существующего fresh cache. `profile-avatar-layout.spec.ts`:4варианта длинного
имени/username, photo/initials и light/dark. Вместе33выполненных checks на3ширинах.

В harness добавлен известный существующий avatar endpoint с нейтральным null
response; overrides тестов фото остаются явными. Проверки unexpected API не
ослаблены. Один первый fallback probe исправлен с ошибочного `Link Telegram ID`
на фактическое существующее `Connect Telegram ID`, без изменения подписи продукта.

## Финальная проверка

- `npm run build`: **PASS**, оба TypeScript-проекта.
- `npm test -- --maxWorkers=1`: **1167PASS/182files**. Первый полный run:
  1166PASS/1timeout на прежнем холодном импорте Referral в loadingStates.
  Отдельный repeat48PASS и полный repeat1167PASS выполнены без изменения
  этого теста, unit timeout или конфигурации. Неуспешный лог сохранён.
- Biome: **10затронутых TS/TSX/JSON PASS**, без warnings; diff check PASS.
- Chromium153, exact `dist/`,320×720/375×812/1280×800:
  **200PASS/1configuredSKIP/0FAIL/0flaky**, retries0,201scenarios.
  Все33новых проверки выполнены. Остальные167PASS покрывают существующие
  profile/account actions/back, dialogs, mobile navigation, reduced motion и
  обычную navigation suite. Единственный skip — прежний viewport-specific guard.
- Просмотрены снимки320light/photo,375dark/initials,1280dark/photo с длинным именем.
  Фото/placeholder имеют56/64px, тексты переносятся, горизонтального overflow нет.

Существующие5unit tests `useUserAvatar` входят в полный gate и сохраняют проверку
Telegram initData/API fallback. Это не физическая проверка Telegram/Android/iOS
и не новая приёмка backend. Production не подключался, реальных платежей нет.
Работающий helper-мокап владельца не использовался для browser automation.

## Exact evidence

`.scratch/profile-avatar-20261028/`:

- `artifact.sha256`:286files, manifest SHA256
  `8d404411f863f4389939fdd64881e44938d73ac6c04e05fbdd4ed2f6157095fd`.
- `tested-source.json`:928source/test files, SHA256
  `2b578c4f738721180c5f42651400a31aca441ba49bb138800396b8e5b2398b37`.
- `red-*.log`, `green-*.log`, `unit.log`, `unit-loading-repeat.log`,
  `final-unit.log`, `build.log`, `final-biome.log`, `final-browser.log`,
  `final-browser-results.json`, screenshots и configs.

После gate `identity.mjs --verify` подтвердил неизменность compiled bytes и всех
source/test inputs. `final-validation.json` отдельно подтвердил33новых PASS без
retries, сохранность useUserAvatar,4locale labels и документации. Мокап5173
отвечает200, собственный preview4173 завершён.

Изменения локальные, без commit/публикации/нового Release Bundle/production-перехода.

Рекомендуемый уровень рассуждения для следующей задачи: средний — компонент небольшой, основные состояния фото и адаптивность покрыты browser tests.
