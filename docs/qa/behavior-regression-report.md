# Behavior Regression Report

| Behavior area | Status | Evidence | Remediation / remaining risk |
| --- | --- | --- | --- |
| Route mapping | Pass | `docs/migration/route-parity-matrix.md`; `src/app/migrated-routes.test.tsx` | Add browser e2e after CI workflow exists on default branch |
| Auth guard roles | Pass | Route smoke tests verify student/lecturer/staff guard composition | Live session cookie behavior pending backend `/v1` |
| Login redirect | Pass | `normalizeInternalRedirect` rejects external redirects | Apply helper to future OAuth callback handling |
| API error normalization | Pass | Shared API client normalizes response/network/timeout errors | Add integration tests with real backend errors |
| Attachment download | Pass | Legacy `/api/v1` payload paths normalize to `/v1` in shared API layer | Live file download e2e pending backend `/v1` |
| Form submission | Source-reviewed | Request submission remains feature-owned and CSRF-protected | Browser e2e pending seeded backend |
| Empty/loading states | Source-reviewed | Existing feature components preserve skeleton/error/empty branches | Visual screenshots pending |
| Permission bypass | Pass | No code path bypasses `ProtectedRoute` for migrated protected routes | Backend authorization still required |

## Summary

Behavior parity is ready for frontend CI gates. Full production parity still
needs live backend `/v1` e2e coverage and legacy/new screenshot comparison.
