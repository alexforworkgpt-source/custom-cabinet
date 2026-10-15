# Custom Cabinet: full compiled browser matrix — 2026-10-15

Result: **PASS_IN_SCOPE** — final local browser matrix **1146 PASS / 35 configured
SKIP / 0 FAIL**, no retries. Full S9 **PARTIAL**, full live/Release gate **BLOCKED**.
[Machine evidence](compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.json)
and [live-check record](releases/LIVE_CHECK_REPORT_2026.10.15_BROWSER_MATRIX.md).

## Exact inputs and environment

- Custom Cabinet HEAD remains `1169e3cb964caec9a9500ace89bbb53b7e5a89df` plus
  preserved owner work and uncommitted adaptations/fixes.
- Upstream Cabinet target `v1.80.1` / `a693d30ca6084b9a54b45a72294b99237841ef13`.
- Intended unchanged Upstream Bot `v5.0.0` /
  `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`; no native VPS/API operation in this run.
- Initial284-file manifest matched the final14 October recovery artifact exactly:
  `024382a677dc952f64364425698eb8766260ebc5cdbb0360c1592170874c8df9`.
- New284-file final compiled manifest after the loading-height fix:
  `0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
  Manifest format: Unicode ascending relative paths, `SHA256  path` lines with LF.
- Windows, Node24.19.0, installed Playwright1.63.0, Chrome155.0.8059.40.
  Existing five viewport projects, two workers, zero retries. Original project
  filters/conditional skips and assertion timeouts retained.
- Vite **preview** serves compiled `dist` on `http://localhost:4173`; browser
  fixtures intercept API requests. This is a local frontend gate, not authenticated
  staging, native API parity, physical Telegram, or a public Release Bundle proof.

## Initial result and diagnosis

The full initial matrix ran07:20:23–07:35:32 UTC:1115 PASS /35 SKIP /26 FAIL.
All five failing test files predated the14 October recovery changes, verified
against the saved source inventory. The initial failure is retained, not waived.

| Initial failing mechanism | Cases | Observation |
| --- | ---: | --- |
| Old Dashboard traffic headings/region |20| Current card is `Subscription active`, loading placeholder is `Your Subscription`; snapshots contain traffic and working retry/navigation |
| Dev-only locale interception |4| Test waited for `/src/locales/en.json`, while captured requests load `/assets/en-DsIlB7vB.js`; the delay was never applied |
| Incomplete renewal fixture |2| Mock purchase-options omitted `sales_mode`; the UI correctly displayed a payment-options error |

After fixing those test contracts, later assertions were allowed to run:

1. Renewal also used old text-only best-value and2px/inset selection assumptions.
   The current compact marker has accessible image name `Выгодно`. The test now
   checks that marker, exact2700.00 RUB/450 RUB-per-month labels, actual selection
   and changing visible border, with no money mutation before/after choosing.
2. The loading test then exposed a **real frontend geometry defect**: the balance
   moved19–23px when limited-subscription details replaced the placeholder. The
   placeholder omitted the8px progress bar plus margin and mismatched responsive
   metric/action heights. Expanded limited/unlimited regression:8 FAIL /2 PASS
   on the old artifact;10 PASS after the fix, retaining the original4px allowance.

## Changes

Runtime scope is only `src/components/dashboard/SubscriptionCardSkeleton.tsx`
and its caller in `src/pages/Dashboard.tsx`. Existing Skeleton/spacing utilities
reserve the progress row, desktop metric height and action height. A display-only
boolean derived from the already loaded selected subscription summary avoids
reserving a traffic progress row for unlimited subscriptions. No new API call,
query key, financial calculation, global style or dependency was added.

Test scope: `tests/e2e/button-accents.spec.ts`, `dashboard-loading.spec.ts`,
`i18n-startup.spec.ts`, `issue04-tariff-pricing.spec.ts`, `navigation.spec.ts`.
Touch-target/non-overlap/overflow, retry/return, exact pricing/no-mutation and
delayed-dictionary checks are retained with current UI/compiled-file contracts.
The loading test adds unlimited coverage; its inherited geometry viewports
override mobile320→390 and desktop1280→1440. Other tests retain the five project
viewports; geometry PASS is not a claim for every width/locale/subscription state.

## Final browser gate

One final full run on the rebuilt artifact, **07:51:28–08:03:00 UTC**:

| Project | PASS | Configured SKIP | FAIL |
| --- | ---: | ---: | ---: |
| mobile-320 |271|1|0|
| mobile-375 |207|1|0|
| tablet-768 |188|9|0|
| desktop-1024 |186|11|0|
| desktop-1280 |294|13|0|
| Total |1146|35|0|

1181 collected cases, zero flaky results/retries/global runner errors. All10
limited/unlimited loading cases and10 session-recovery cases pass on the final
artifact.35 skips remain unexecuted cases: admin-geocheck1, cabinet-flows3,
info-navigation11, issue06-device-limits-mobile12, navigation2,
referral-withdrawal-visibility6. Their original conditional annotations are saved.
This full-suite scope is larger than the historical15-file398-case affected gate.

No zero-console/network-error claim: the fixture setup leaves activity-event
requests outside interception;173 local proxy `ECONNREFUSED` log entries target
unavailable localhost8080. No live Upstream Bot outage is inferred from them.

## Required source checks and remaining limit

| Gate | Result |
| --- | --- |
| `npm run build` | PASS, both TypeScript configurations and Vite |
| Focused Biome on seven changed source/test files | PASS after one test-format correction |
| `git diff --check` | PASS |
| `npm test` | **FAIL**,1076 PASS /8 FAIL in six unchanged test files |
| `npm test -- --maxWorkers=2 --testTimeout=10000` | PASS,1084 tests /176 files |

Default unit failures: `adminBroadcastCreateAudience.test.tsx`,
`adminTicketUserLink.test.tsx`, `adminUsers.test.tsx`, `loadingStates.test.tsx`,
`referralDayRewards.test.tsx`, `referralWithdrawalVisibility.test.tsx`, all under
`src/pages/`. Logs show5s timeouts and later duplicate-DOM assertions. The files
are byte-identical to session start; a full causal diagnosis/fix of default-run
behavior is not claimed. Bounded success does not replace default-policy PASS.
Full repository Biome was not rerun; prior historical JSON errors retain scope.

## Preservation and boundaries

Original final14 October artifact was archived and verified before rebuilding.
Final compiled bytes and all1265 inventoried inputs remained unchanged during
the final gate. Preview server stopped; localhost4173 absent afterward. Only the
seven named runtime/test files and current evidence/context documentation changed.
Owner HEAD/other existing work and Installer files are preserved.

No SSH, provider/merchant request, DB change, Panel write, backend/SDK modification,
commit, publication or production operation. Previously completed merchant
success/cancellation, roles and Installer proofs were not repeated. Previous
native recovery results retain their dated input scope, not a new native-API
proof for this rebuilt artifact.

Local raw receipts/configs/logs, initial failures, old ZIP and final manifests:
workspace `.scratch/bedolaga-v5-browser-matrix-20261015/`. Final report SHA256:
`06c4d6a283b94a4a76d4a49221508092aacc34738e4285bb5de441122ebd374f`.
Full S9/live/publication remain incomplete: physical Telegram/device scenarios,
remaining merchant/capture/refund/recurring/Cashera/initial-paid-concurrency,
default source gates and recorded OPEN limitations. Backend remains the unchanged
working foundation; no backend implementation is a completion condition.
