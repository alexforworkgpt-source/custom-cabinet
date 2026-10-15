# Live Check Report: final compiled Custom Cabinet browser matrix

Status: **BLOCKED (full live/Release); local browser matrix PASS**<br>
Date:2026-10-15<br>
Checker:OpenCode<br>
Owner scope:continue remaining Custom Cabinet checks; preserve completed payments

Format: [report template](../../LIVE_CHECK_REPORT_TEMPLATE.md).
[Canonical evidence and machine JSON](../compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.md).

## Source identity and environment

Custom Cabinet HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df` plus uncommitted work;
Upstream Cabinet `a693d30ca6084b9a54b45a72294b99237841ef13`, intended unchanged
Upstream Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`.
Final284-file manifest `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
Node24.19.0, Playwright1.63.0, Chrome155.0.8059.40, Windows, two workers/no retries.
Local compiled Vite preview, API fixtures, no staging deployment or native API call.
No new Release Bundle or production transition; production smoke NOT_STARTED.

## Findings and changes

Initial full matrix:1115 PASS/35 SKIP/26 FAIL, retained. Five test files still used
old Dashboard labels/layout, dev-only locale interception or incomplete renewal
options. Test-contract corrections preserve retry/return, visible selection,
money-mutation denial and exact prices. They exposed a genuine19–23px loading
shift of balance. SubscriptionCardSkeleton and its Dashboard caller now reserve
the progress/metric/action heights, conditional on known unlimited traffic.
Limited/unlimited geometry red8 FAIL/2 PASS → green10 PASS; original4px allowance.
No financial/auth/backend behavior or global styling changed.

## Automated and browser results

| Check | Result |
| --- | --- |
| Build / both TS configurations | PASS |
| Focused Biome / diff whitespace check | PASS |
| Ordinary `npm test` | FAIL:1076 PASS/8 FAIL in six unchanged files; timeouts and later duplicate DOM |
| Unit with explicit2 workers/10s | PASS:1084 tests/176 files; not default-policy PASS |
| Final full compiled browser07:51:28–08:03:00 UTC | PASS:1146 passed/35 configured skips/0 failed/0 flaky |
| Limited/unlimited loading and session recovery |10+10 browser cases PASS on final artifact |

The five projects are320/375/768/1024/1280; inherited individual test overrides
remain (loading geometry390/1440). Existing RU/EN/FA/locale-specific and theme,
keyboard, navigation, payment-state and admin fixtures are exercised according to
their tests, not a Cartesian guarantee for every route/state/locale.35 skipped
cases retain their original conditions and are not PASS. Local activity-event
proxy errors173 remain logged; no zero-console/network-error claim.

## Decision, preservation and remaining scope

This closes the missing **local full compiled browser matrix** for this exact
artifact. It does not close full S9, default source gates, physical Telegram,
screen-reader/native recovery, remaining merchant/provider/concurrency or Panel
coverage. Previous native proofs retain dated inputs; not rerun on this artifact.

Previous artifact archived and verified before rebuilding; final artifact/input
hashes stayed fixed throughout the last run. Preview stopped,4173 listener absent.
Original owner HEAD/unrelated files preserved. Backend/Installer/site, closed
merchant success/cancellation proofs and previous lifecycle/roles untouched.
No SSH, payment, DB/Panel write, commit, Release or production action.
