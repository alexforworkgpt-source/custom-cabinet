# Domain Documentation

Custom Cabinet uses a single-context domain-document layout.

Read these documents before planning product or architectural changes:

1. `CONTEXT.md` for product boundaries, actors and canonical terminology.
2. `CUSTOMIZATION_MAP.md` for Upstream-owned, Custom-owned and Hybrid areas.
3. `INTERFACE_MAP.md` for the current route and navigation model.
4. `REDESIGN_RULES.md` for the mandatory redesign contract.
5. `UPSTREAM_SYNC.md` before integrating Upstream Cabinet changes.
6. `LIVE_CHECK.md` before staging or production verification.

Future architectural decisions belong under `docs/adr/`. An ADR should record a
decision that future Upstream Cabinet synchronization or redesign work must not
silently reverse.

Update `CONTEXT.md` when actors, product boundaries or canonical terms change.
Update `INTERFACE_MAP.md` when routes, navigation, deep links or route-local
state change.
