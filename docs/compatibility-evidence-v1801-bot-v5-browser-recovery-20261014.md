# Custom Cabinet: compiled browser session recovery — 2026-10-14

Status: **PASS_IN_SCOPE**, seven final native-API browser stages and two mocked
regression tests PASS. Full S9 **PARTIAL**, full live/Release sign-off **BLOCKED**.
[JSON evidence](compatibility-evidence-v1801-bot-v5-browser-recovery-20261014.json)
and [live report](releases/LIVE_CHECK_REPORT_2026.10.14_BROWSER_RECOVERY.md).

## Exact inputs / environment

Uncommitted Custom Cabinet HEAD `1169e3cb964caec9a9500ace89bbb53b7e5a89df`,
Upstream Cabinet `a693d30ca6084b9a54b45a72294b99237841ef13`, unchanged Upstream
Bot `5bda3c56f0afd9f4813e9c6fa48934948b05ebae`, Installer
`75c49bec9c2a764e123fc0ef675f8c45fc22a1ab`, Ubuntu24.04/PG15/Redis7/schema0131.
Native Bot image remains
`sha256:bf27d5f0e1b9ec0b46979be6536877ced98b00c822b32d1e03a80a4677da6205`.

The original 284-file compiled manifest
`4aa5d6ba362760ebdd4f34f18f3a8f91f1de400b5736d1e74948c2d1579b2130` was checked
against its saved byte manifest and preserved in a private ZIP before build.
Final 284-file manifest SHA256:
`024382a677dc952f64364425698eb8766260ebc5cdbb0360c1592170874c8df9`.
Final manifest uses ascending Unicode relative paths and `SHA256  path\n` lines;
all final files were independently rechecked after the native browser stage.

Chrome155.0.8059.40,1280×800,Russian. The real compiled artifact was served
unchanged from loopback HTTP; API requests were forwarded over verified TLS to
the native test VPS. This is a **local compiled frontend + actual HTTPS API**
proof, not a new Installer/public Bundle/deployed-staging-domain gate.
The VPS Cabinet remains the published reference bundle-v2026.10.10.1.
Proxy Host/Origin rewriting and a TLS WS tunnel are local test infrastructure;
no runtime source instrumentation, API response mocking, Caddy/UFW change or Bot
restart in the native gate. The Telegram widget reports `Bot domain invalid`
on the local origin; Telegram authentication was not exercised.

Two new native ORM Email accounts had fixture verified flags and zero business
balances. The actor entered actual credentials through the compiled Login UI;
JWTs were issued by native HTTPS auth. The original disabled Email-auth gate was
temporarily enabled via one owned DB flag, then restored. The separate mocked
regression tests use existing frontend API fixtures and do not prove live auth.

## Findings and source fixes

Owner authorized frontend fixes and the browser recovery seam after the failure.

1. **F-RECOVERY-01:** after transport failed during startup, the refresh key
   survived and native requests recovered, but the UI remained on Login.
   Public API replies had marked backend reachability, so the unavailable screen
   merely lifted its overlay while auth initialization remained incomplete.
   `src/components/blocking/ServiceUnavailableScreen.tsx` now distinguishes an
   incomplete preserved session and reopens its saved same-origin route. The
   existing loaded-session overlay/refetch branch is retained.
2. **F-RECOVERY-02:** Login's submit handler and authenticated-state effect could
   consume the stored destination twice. When router state took priority, the
   fallback could remain for a later ordinary Login entry.
   `src/pages/Login.tsx` now caches the destination for that attempt and consumes
   the fallback once. No route, style, account or backend contract was replaced.

`tests/e2e/session-recovery.spec.ts` exercises the observable browser scenarios.
The meaningful red results were `/profile` expected versus `/login` received for
startup recovery, and `/profile` expected versus home received for stored Login
return. Final two cases PASS. Earlier fixture/runner setup failures are retained
as setup failures, not reclassified as valid regression proof. A protected-route
logout intentionally saves that route again; the ordinary-login regression uses
a later direct Login entry with a rejected old session instead of asserting a
different logout contract.

## Final real-browser gate

Each stage ran once on the final artifact, with native API responses unmocked:

| Stage | Result | Observed behavior |
| --- | --- | --- |
| Setup UI password login | PASS | Native login and profile show the owned identity |
| Native401 recovery | PASS | Corrupt only an issued access signature; native401 → refresh200 → retried identity200; key retained |
| Refresh-only startup | PASS | Missing browser access token is recovered automatically without password |
| Transport loss / auto-recovery | PASS | Local API/health connections interrupted; unavailable screen appears, refresh survives, profile recovers without user click/reload |
| UI logout | PASS | Native logout200; browser keys and persisted user cleared; Login shown |
| Reopen with revoked key | PASS | Native refresh401; compiled UI clears rejected key and saves protected return |
| UI relogin / return | PASS | Fresh native login restores profile; old key is not reused and return fallback is consumed |

No uncaught browser exceptions. Console errors are **not zero**: intentional
transport `ERR_EMPTY_RESPONSE` and native401 negative controls are recorded.
No full WS, physical-device, accessibility, responsive or loaded-unsaved-form
recovery claim. Native VPS stayed healthy throughout local transport injection.

## Source verification and limits

The two runtime files and one E2E file are the source scope. Changes invalidated
affected source/artifact evidence and justified new checks; unrelated Installer,
RBAC/ABAC and payment suites were not repeated.

| Gate | Final fact |
| --- | --- |
| Unit |1084 tests /176 files PASS with `npm test -- --maxWorkers=2 --testTimeout=10000` |
| Default5s unit runs | FAIL: unchanged audience tests timed out; late work then affected a following test. Runs and logs retained; default policy gate not declared PASS |
| TypeScript/build | `npm run build` PASS on explicit Node24.19.0, both TS configurations and Vite |
| Focused Biome | PASS for both changed runtime files and the new E2E file |
| Mocked regression | Two cases PASS on the final compiled artifact |
| Native final compiled browser | Seven stages PASS, scope above |
| Historical398 cases /14 skips | Not rerun; original artifact scope only, cannot prove the new artifact |
| Full repository Biome | Not rerun; three historical JSON formatting errors retained |

No unit assertion, timeout configuration file, audience source, dependency or
lockfile was changed. The10s budget is an explicit runner condition, not a claim
that the default5s publication gate passed. No full new browser matrix or Release
readiness is inferred from this targeted proof.

## Cleanup / preservation

New fixture accounts and their refresh rows were removed; the temporary Email
flag was removed and real HTTPS Login again returned403 / `email_auth_disabled`.
Balances/transactions/subscriptions were zero before deletion. The local bridge
was stopped and browser storage cleared.

Independent postflight **2026-10-14T18:19:51.920806+00:00** (21:19:51 Moscow)
confirmed original core/refresh projections, five configuration hashes and image
identities preserved; three healthy services/restart0/OOMfalse, known SSH key and
local server.env unchanged. This is not byte equality of all DB/logs/counters.
The previous transition VPS stays running; whole cleanup remains
**SKIPPED_OWNER_REQUEST**. No Panel/provider/subscription mutations, backend edit,
commit, Release or production operation.

Raw stage/runner receipts, old failures and original artifact remain in workspace
`.scratch/bedolaga-v5-browser-recovery-20261014/` and its private subdirectory.
Do not rerun the completed final seven-stage gate without changed inputs or a
specific unresolved concern. Financial/device/ABAC/default-publication limits
remain as recorded in [Compatibility Matrix](../COMPATIBILITY.md).
