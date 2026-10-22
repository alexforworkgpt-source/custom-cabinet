# Custom Cabinet subscription management / unchanged Upstream Bot — 2026-10-22

Status: PASS_FRONTEND_SOURCE_CONTRACT_SCOPE; full live integrations are not claimed.

- Source 80be79d59791c330dae3fc5eac46d96d2e503357, tree e2ff9b87d26c8980b86f78750b8a967622866c12, tag cabinet-v2026.10.22.1.
- Comparison: Cabinet cc17e371d2db45e8c498dc944923d3b8354892e9 from stable Bundle bundle-v2026.10.18.1.
- Upstream Bot 5bda3c56f0afd9f4813e9c6fa48934948b05ebae, backend contract1, PostgreSQL18/Redis identities unchanged.
- Dedicated subscription pages, compact controls and conditions/badges, scoped device funding and contextual discounts.
- Release review fixed unsupported classic purchase loops, selected trial context and device reselection under fresh limits.
- PR43 review additionally fixed generic multi-tariff catalogue query gating and retryable purchase-options failure.
- [Exact source CI](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/39842860677): Linux Node24/26 each1166 unit tests/182 files, publication guards, lint/format/types/build PASS.
- [CodeQL](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/39842860583) completed. Baseline32/source31 open alert IDs, no new IDs; existing alerts are not claimed resolved.
- [Fresh audit](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/39842860689):15 vulnerabilities (4 moderate,10 high,1 critical), retained under the existing explicitly non-blocking policy. No dependency upgrade or reachability claim.
- Local full unit1166 PASS, full TypeScript/build/Biome PASS;185 affected compiled browser cases PASS on320/375/768/1024/1280 with2 workers,0 retries,0 skips/failures/flaky. Tests use API fixtures, not real charges.
- Earlier broad local1741 PASS/35 configured SKIP/5 FAIL and diagnostic history remain dated facts. Three test-only fixes freeze the active-discount fixture date and synchronize actual44px remount/expired-offer checks;28 scoped repetitions PASS. Geometry tolerance remains4px.
- Independent uncached linux/amd64 build artifact 3b02860e5de08b1f7d6aae56777eeb1b4cb740dc6acfc8460fa449671fdbb8ed. Final exact-artifact browser, public equality/verification and targeted new Bundle smoke are bound separately before stable; they are not declared completed by this record.

The owner authorized this release package, including commits/push/PR/merge/tags,
existing workflows/environment approvals, public-byte verification, disposable
smoke/cleanup and metadata-only stable promotion. The owner separately selected
"Accept limitation" for THIS fixed package: physical Telegram/Android/iOS is
SKIPPED_OWNER_ACCEPTED, not PASS. Historical OPEN/BLOCKED scope remains unchanged;
Upstream Bot is the accepted working basis, with no independent backend/payment/
SDK/RBAC acceptance backlog or backend changes. Current unsupported live/provider/
recurring/response-parity/Panel scenarios are not claimed verified.

LICENSE, exact committed upstream provenance, dependencies, release workflows,
historical records, existing Releases/assets/tags/latest/settings and owner work
are preserved. Production is explicitly excluded. Stable requires actual remaining
publication/public/browser/smoke gates; mock/source proof cannot replace them.
