# Compatibility evidence for the Bedolaga v1.82.0 adaptation

The Custom Cabinet source is `8244ab830add751ef51ba8b5943eed3691bd197f`. Its canonical base remains Upstream Cabinet `v1.79.0`, with selected behavior from Upstream Cabinet `v1.82.0` adapted into the existing UI. The release target is Upstream Bot `v5.2.0` at `0fb7453a1f606c51e4ad92fa155436eb06e04081`, backend contract 1.

- GitHub Actions CI passed on Node 24 and 26. The Git tree archive matched all 1252 files in the locally tested snapshot. [CI run](https://github.com/alexforworkgpt-source/custom-cabinet/actions/runs/42582327204)
- Two independent Docker builds against the target Bot SHA produced an identical Cabinet archive, SHA256 `4c57b257130c90142f2e62ee9e56f928168ea03e3c3d5f6723e73b97fb836580`. Chromium passed 10 cases against that build and 24 cases against a build for the previous Bot SHA with simulated API responses.
- The earlier target-contract snapshot used a real local v5.2.0 API for email sign-in, session recovery, device quotes, tariff-switch preview, managed traffic, balance and the subscription link. The subsequent release source adds Docker and SHA selection plus its test. The completed Installer lifecycle used the exact release archive and target Bot on disposable Ubuntu 24.04. [Installer source PR](https://github.com/alexforworkgpt-source/installer/pull/14)

Physical Telegram and merchant sandbox coverage remain unverified. Classic auto-purchase retains manual confirmation after top-up. No live payment was initiated.
