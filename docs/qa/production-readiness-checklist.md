# Production Readiness Checklist

| Checked item | Status | Evidence | Remediation / remaining risk |
| --- | --- | --- | --- |
| Scope limited to `request-web` | Pass | Changes are contained in this repository branch | Do not edit sibling repos during frontend release |
| No secrets committed | Pass | `.env.example` is the only env template | Re-run secret scan before release |
| API `/v1` readiness | Pass | `src/shared/api/endpoints`, `docs/migration/api-contract-mapping.md` | Backend `/v1` live validation pending |
| API error safety | Pass | `src/shared/api/errors`, shared API client | Keep raw backend errors out of UI |
| Open redirect protection | Pass | `src/shared/navigation/safe-redirect.ts` | Use helper for future redirect values |
| Security headers | Pass | `next.config.ts` | Tighten CSP when nonce/hash setup is available |
| Accessibility source audit | Pass | `docs/qa/accessibility-report.md` | Automated axe pending |
| Performance source audit | Pass | `docs/qa/performance-report.md` | Bundle analysis pending if bundle grows |
| Visual parity | Blocked | `docs/qa/visual-regression-report.md` | Legacy runtime screenshot capture blocked |
| Behavior parity | Pass with live-e2e risk | `docs/qa/behavior-regression-report.md` | Backend `/v1` e2e pending |
| CI gates | Pass | `.github/workflows/request-web-ci.yml` | Required status checks can be enforced after first run |
| Branch protection | Needs GitHub verification | GitHub API check during release | Configure required checks after workflow is present on default branch |
