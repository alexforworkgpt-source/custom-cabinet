# Live Check Report: `<release candidate>`

Status: `PREPARING | RUNNING | PASS | PASS WITH RISKS | FAIL | BLOCKED`<br>
Date: `YYYY-MM-DD`<br>
Checker: `<name or agent>`<br>
Release owner: `<name>`

## Source Identity

| Item | Exact value |
| --- | --- |
| Custom Cabinet commit | `<40-character SHA>` |
| Custom Cabinet version/tag | `<version or candidate>` |
| Upstream Cabinet tag/SHA | `<tag and 40-character SHA>` |
| Upstream Bot tag/SHA | `<tag and 40-character SHA>` |
| Release Bundle candidate | `<tag or not scheduled>` |
| Staging artifact checksum | `<algorithm:value>` |
| Rollback Release Bundle | `<immutable tag>` |

## Environment

| Item | Value |
| --- | --- |
| Staging URL | `<URL without credentials>` |
| Deploy time | `<ISO timestamp>` |
| Browser builds | `<versions>` |
| Telegram clients | `<platform and versions>` |
| Enabled themes | `<dark/light>` |
| Checked locales | `<list>` |
| Operator palette | `<identifier, no secret>` |

## Change Scope

Кратко описать редизайн, upstream synchronization или исправление. Перечислить
затронутые routes, shared components, contracts и known risks.

## Automated Gate

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | PASS/FAIL | `<notes>` |
| `npm run check` | PASS/FAIL | `<notes>` |
| `npm test` | PASS/FAIL | `<notes>` |
| `npm run type-check` | PASS/FAIL | `<notes>` |
| `npm run build` | PASS/FAIL | `<notes>` |
| Browser automation | PASS/FAIL/NOT AVAILABLE | `<command and notes>` |

## Test Accounts and Data

Не записывать email, IDs или другие персональные данные. Использовать безопасные
alias.

| Alias | State | Result/limitation |
| --- | --- | --- |
| `guest` | Not authenticated | `<notes>` |
| `new-user` | No subscription | `<notes>` |
| `trial-user` | Trial | `<notes>` |
| `active-user` | Active subscription | `<notes>` |
| `expired-user` | Expired/limited | `<notes>` |
| `multi-user` | Multiple subscriptions | `<notes>` |
| `full-admin` | Full permissions | `<notes>` |
| `restricted-admin` | Restricted permissions | `<notes>` |

## Functional Results

| Area | Result | Checked scenarios | Defects/limitations |
| --- | --- | --- | --- |
| Runtime smoke | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Web authentication | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Telegram authentication | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Dashboard | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Subscription/purchase | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Balance/payments | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Connection | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Profile/accounts | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Support/notifications | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |
| Optional features | PASS/FAIL/NOT ENABLED | `<summary>` | `<references>` |
| Admin | PASS/FAIL/BLOCKED | `<summary>` | `<references>` |

## Platform and Visual Results

| Matrix | Result | Coverage | Defects/limitations |
| --- | --- | --- | --- |
| Responsive | PASS/FAIL/PARTIAL | `320/375/768/1024/1280/1440` | `<notes>` |
| Dark theme | PASS/FAIL | `<routes>` | `<notes>` |
| Light theme | PASS/FAIL | `<routes>` | `<notes>` |
| Operator palette | PASS/FAIL | `<palette>` | `<notes>` |
| Russian | PASS/FAIL | `<routes>` | `<notes>` |
| English | PASS/FAIL | `<routes>` | `<notes>` |
| RTL | PASS/FAIL/BLOCKED | `<locale/routes>` | `<notes>` |
| Desktop Chromium | PASS/FAIL | `<version>` | `<notes>` |
| Desktop Firefox | PASS/FAIL | `<version>` | `<notes>` |
| Android Telegram | PASS/FAIL/BLOCKED | `<version>` | `<notes>` |
| iOS Telegram | PASS/FAIL/BLOCKED | `<version>` | `<notes>` |
| Mobile browser | PASS/FAIL | `<browser/version>` | `<notes>` |

## Accessibility Results

| Check | Result | Notes |
| --- | --- | --- |
| Keyboard critical flow | PASS/FAIL | `<notes>` |
| Visible focus/order | PASS/FAIL | `<notes>` |
| Accessible names | PASS/FAIL | `<notes>` |
| Forms/errors | PASS/FAIL | `<notes>` |
| Dialog/Sheet focus | PASS/FAIL | `<notes>` |
| Navigation current state | PASS/FAIL | `<notes>` |
| Zoom 200% | PASS/FAIL | `<notes>` |
| Reduced motion | PASS/FAIL | `<notes>` |
| Non-color status communication | PASS/FAIL | `<notes>` |
| Screen reader smoke | PASS/FAIL/NOT AVAILABLE | `<notes>` |

## Failure and Recovery Results

| Case | Result | Notes |
| --- | --- | --- |
| Backend unavailable | PASS/FAIL | `<notes>` |
| Slow/offline network | PASS/FAIL | `<notes>` |
| 401/403 | PASS/FAIL | `<notes>` |
| 422/429/500 | PASS/FAIL | `<notes>` |
| WebSocket reconnect | PASS/FAIL | `<notes>` |
| Stale chunk after deploy | PASS/FAIL | `<notes>` |
| Double submit protection | PASS/FAIL | `<notes>` |
| Interrupted external return | PASS/FAIL/BLOCKED | `<notes>` |

## Defects

| ID | Severity | Route/platform | Reproduction | Expected | Actual | Release blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `LC-001` | Critical/High/Medium/Low | `<scope>` | `<steps>` | `<expected>` | `<actual>` | Yes/No |

Не включать secrets, tokens, cookies, Telegram init data или personal data.

## Residual Risks

Перечислить непроверенные devices, недоступные providers, отсутствующие test
accounts и все принятые ограничения. Для каждого указать владельца решения.

## Staging Decision

Result: `PASS | PASS WITH RISKS | FAIL | BLOCKED`

Reason:

```text
<краткое обоснование результата>
```

Release owner approval for `PASS WITH RISKS`:

```text
<имя, дата и принятые риски>
```

## Production Smoke

Status: `NOT STARTED | PASS | FAIL | ROLLED BACK`

| Check | Result | Notes |
| --- | --- | --- |
| Health/assets | PASS/FAIL | `<notes>` |
| Telegram Login | PASS/FAIL | `<notes>` |
| Dashboard | PASS/FAIL | `<notes>` |
| Existing subscription | PASS/FAIL | `<notes>` |
| Connection read-only | PASS/FAIL | `<notes>` |
| Balance read-only | PASS/FAIL | `<notes>` |
| Admin read-only | PASS/FAIL | `<notes>` |
| Logs/error rate | PASS/FAIL | `<notes>` |

## Rollback

Rollback required: `Yes/No`<br>
Rollback Release Bundle: `<immutable tag>`<br>
Rollback result: `NOT NEEDED | PASS | FAIL`<br>
Post-rollback health/Login: `<result>`

## Final Sign-off

- [ ] Exact source versions recorded.
- [ ] Automated gate passed.
- [ ] Required staging flows completed.
- [ ] Telegram real-device checks completed or release is blocked.
- [ ] Release blockers resolved.
- [ ] Residual risks explicitly accepted.
- [ ] Rollback source verified.
- [ ] Report contains no secrets or personal data.
- [ ] Production smoke completed or marked `NOT STARTED` before deploy.

Final result: `PASS | PASS WITH RISKS | FAIL | BLOCKED`
