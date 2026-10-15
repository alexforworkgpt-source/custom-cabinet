# Custom Cabinet: ordinary unit command recovered — 2026-10-15

Result: **PASS_IN_SCOPE** — ordinary `npm test`, without CLI worker/timeout
overrides or diagnostic reporters, passed **1084 tests /176 files**. This closes
the local ordinary-unit gap for the current configuration on Windows/Node24.
Full S9 **PARTIAL**, full live/Release/publication readiness remains **BLOCKED**.
[Machine evidence](compatibility-evidence-v1801-bot-v5-unit-default-20261015.json).

## Exact scope

Custom Cabinet HEAD remains `1169e3cb964caec9a9500ace89bbb53b7e5a89df` plus preserved
owner work. Upstream Cabinet target `a693d30ca6084b9a54b45a72294b99237841ef13`;
intended unchanged Upstream Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`.
Only `vitest.config.ts` changed: add `test.maxWorkers:2` and an explanatory comment.
Test assertions/files, timeouts, isolation, pool and application code are unchanged.
The existing CI workflow already invokes tests with `--maxWorkers=2`; that file
was read as the reference and was not modified.

Environment: Windows, Node24.19.0, Vitest4.1.11,16 available logical processors.
The configured pool remains `forks`, isolation true, testTimeout5000ms and
hookTimeout10000ms. Earlier failures with the old automatic concurrency remain
historical failures; no old receipt is renamed PASS.

## Diagnosis and one-variable experiment

Earlier ordinary runs showed timeouts on first page imports and later duplicate
DOM assertions. The latest saved pre-task result was1076 PASS/8 FAIL in six files.
Three hypotheses: excessive concurrent jsdom/import work; late continuation after
a timed-out test; independent assertion/cleanup defects in individual tests.

A scratch-only reporter recorded overlapping module execution, resolved settings
and outcomes. It changes neither test source nor application behavior. Baseline
and control use the same source inventory and reporter; **only maxWorkers differs**.

| Run on unmodified source/config | Concurrency | Test timeout | Result |
| --- | --- | --- | --- |
| Fresh baseline08:25:36–08:26:02 UTC | Automatic;13 overlapping module-execution intervals observed |5000ms|1082 PASS/2 FAIL, exit1 |
| Worker-only control08:26:12–08:27:42 UTC | Explicit2; observed overlap2 |5000ms|1084 PASS/0 FAIL, exit0 |

The baseline failure is the first `AdminBroadcastCreateAudience` partial-send
case timing out, followed by a duplicate send-button assertion in its next case.
The render helper awaits a dynamic component import before mounting. These facts
support resource contention as the actionable trigger and late continuation as
the explanation consistent with the duplicate DOM. This is not a claim of a
general Vitest cancellation defect or a complete guarantee under arbitrary load.

No timeout increase was needed. Matching the existing CI two-worker policy in
the project config makes the ordinary local command use the tested concurrency.
Tradeoff: approximately89 seconds for the final ordinary command versus26 seconds
for the failing diagnostic baseline on this machine.

## Final required checks

| Gate | Result |
| --- | --- |
| **`npm test`**, no additional arguments/reporters | **PASS**,1084 tests/176 files,08:28:49–08:30:18 UTC |
| `npm run build` | PASS, both TypeScript configurations including `vitest.config.ts`,08:30:18–08:30:54 UTC |
| Biome on `vitest.config.ts` | PASS |
| `git diff --check` | PASS |

All test assertions remain unchanged; no skip, retry, timeout or ignore-errors
setting was added. Only the saved failing condition and its controlled fix were
tested; completed live payment/roles/Installer/physical scenarios were not rerun.
Node26/Linux CI and publication workflows were not executed in this local task.
The historical full-repository Biome errors remain; no all-publication-gates PASS.

## Exact compiled artifact and preservation

Rebuilding reproduced **all284 files byte for byte**, manifest
`0aa20cd0f035ec41fd4f0270a1b4e94f04a0bd03075d92e3493334728bd170d0`.
This is the exact artifact that passed1146 browser cases with35 configured skips
in the [completed browser matrix](compatibility-evidence-v1801-bot-v5-browser-matrix-20261015.md).
Application and E2E source are unchanged, so that browser evidence is retained
without another browser run. The old ordinary-unit FAIL in that dated report
describes its earlier config; this follow-up supersedes that current local gap.

Initial inventory:1268 existing files. Only the test config and evidence/context
documents changed; other owner files/HEAD and Installer were preserved. No remote,
provider/merchant, DB/Panel, backend/SDK, commit, Release or production operation.
All diagnostics/reporters remain in workspace ignored local
`.scratch/bedolaga-v5-unit-default-20261015/`; no instrumentation added to tests.

Remaining work: full live integration and physical Telegram/device/accessibility
coverage, remaining merchant/capture/refund/recurring/Cashera/initial-paid
concurrency and recorded OPEN limits. Upstream Bot remains the unchanged working
foundation; no backend implementation is required by this frontend check.
