# Live Check Report: Bot v5 native access policies

Status: **FAIL (two targeted ABAC expectations); full S9 PARTIAL, no live sign-off**<br>
Date: 2026-10-14, Europe/Moscow<br>
Checker: Codex<br>
Release owner: владелец проекта; разрешено продолжение scoped test verification

Формат: [LIVE_CHECK_REPORT_TEMPLATE](../../LIVE_CHECK_REPORT_TEMPLATE.md).

## Source Identity / Environment

Exact unchanged Bot5bda3c56, Installer75c49be, native image and published
reference Cabinet identities:
[ABAC evidence](../compatibility-evidence-v1801-bot-v5-abac-20261014.md).
Ubuntu24.04/PG15/Redis7, прежний transition runtime; свежие owner marker/SSH
fingerprint/health checks PASS. Новый uncommitted Custom Cabinet не развёрнут.
Browser/Telegram builds, themes, locale и palette здесь не проверялись.
Public Bundle не запланирован; production не опрашивался и не менялся.
Rollback reference bundle-v2026.10.10.1 и отдельный native transition proof
сохранены; новых update/rollback не выполнялось.

## Change Scope / Automated Gate

Source не менялся. Native ORM/CRUD создали только owned accounts/roles/policies
и временный DB Email-auth flag. Решения проверены реальными HTTPS запросами.
Прежние frontend/unit/build/browser/schema/lifecycle/transition и99/34 role
suites не повторялись. Их evidence сохранены; три historical full repository
Biome errors остаются FAIL. Новый focused evidence JSON проверяется отдельно.

## Test Accounts and Functional Results

| Alias / area | Result | Scope / limitation |
| --- | --- | --- |
| policy-controller / policy-actor | PASS in scope | Native HTTPS Email/password login; accounts/verified Email/controller role are native ORM fixtures, not new registration/SMTP proof |
| Resource/action/wildcard policy matching | PASS in scope | Matching deny403, unrelated resource/action200; owned policies only |
| Time / IP conditions | PASS in scope | Current UTC window and actual IP match deny403; nonmatching conditions200; IP not published |
| Selected allow/deny behavior | PASS in scope | Native deny remains final; allow cannot grant a missing RBAC permission |
| Expired role policy | FAIL / OPEN L-ABAC-01 | Permission response excludes expired carrier role, but its policy still denies surviving users:read403; assignment removal restores200 |
| Inactive role policy | FAIL / OPEN L-ABAC-02 | Permission response excludes inactive carrier role, but its policy still denies403; policy removal restores200 |
| Full ABAC / global policies / all mutations | NOT_VERIFIED | Scope remains incomplete; globals/other actors not modified |
| Payments / subscriptions / Panel | NOT_RUN / BLOCKED | No business mutations; Remnawave read-only |

31 HTTP checks:29 expected statuses matched,2 differed. Native probe exit0 means
recording and fixture cleanup completed; it is not a successful ABAC gate.

## Platform / Visual / Accessibility

No new browser/device/UI/a11y coverage. Previous compiled-artifact evidence
retains its own scope; HTTP access-policy checks do not replace UI verification.

## Failure / Recovery / Defects

L-ABAC-01 and L-ABAC-02 reproduced on the same native token. Negative controls
restored access without relogin. Source trace: permission aggregation excludes
expired/inactive roles; the separate policy role-ID query does not exclude them.
These limitations remain OPEN at the unchanged Upstream Bot boundary. No
frontend workaround, backend source change or backend implementation task.
Other recovery/network/422/429/500/payment-return cases were not repeated.

## Residual Risks / Staging Decision

Targeted access-policy gate **FAIL**; full S9 **PARTIAL**, full live sign-off
unavailable. Previous selected role checks remain valid for their scope.
Remaining policy/mutation/merchant/device and read-only Panel limits are not
closed. No release-risk acceptance or new public Release authorization inferred.

## Production Smoke / Rollback

Production smoke **NOT_STARTED**, rollback NOT_NEEDED. No public Release,
commit/push, production update or new production baseline.

## Final Sign-off

Scoped fixture cleanup and independent postflight PASS: accounts/roles/policies/
assignments0, original Email-auth flag restored, non-fixture core records,
configuration/image identities preserved, healthy/restart0/OOMfalse.
The earlier test VPS remains running; its cleanup SKIPPED_OWNER_REQUEST persists.
The report contains no tokens, credentials, actual IP or personal account data.
