# Legacy Runtime Blockers

## Status

Blocked for this hardening pass.

## Evidence

The legacy `../request` package runs frontend and backend together through:

```text
concurrently "npm run dev --prefix backend" "vite"
```

The workspace also contains local environment files for frontend/backend runtime.
Starting the legacy monolith would couple visual capture to backend secrets and
local database state. This hardening pass therefore used source/asset inspection
instead of executing the legacy runtime.

## Impact

- Visual parity is source-reviewed but not screenshot-diff verified.
- Behavior parity is covered by route/API/auth source tracing and frontend
  tests, but full legacy-vs-new click-through requires an isolated backend seed.

## Remediation

1. Provide a sanitized legacy `.env` and seeded local database.
2. Run legacy Vite and backend in an isolated network namespace or disposable
   local environment.
3. Capture desktop and mobile screenshots for each route in
   `docs/migration/route-parity-matrix.md`.
4. Compare against `request-web` screenshots with stable test data.
