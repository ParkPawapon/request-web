# Security Audit Report

| Checked item | Status | Evidence | Remediation / remaining risk |
| --- | --- | --- | --- |
| Secrets committed | Pass | `.env.example` only; no `.env` intended for commit | Re-run secret scan before every release |
| Public env boundary | Pass | Browser config uses `NEXT_PUBLIC_API_BASE_URL` via validated env module | Keep server-only secrets outside frontend |
| API URL centralization | Pass | `src/shared/api/endpoints`, `src/shared/api/client` | Do not concatenate URLs in components |
| `/v1` readiness | Pass | Endpoint constants use `/v1/...`; legacy `/api/v1` payload paths normalize centrally | Backend `/v1` live contract still needs e2e |
| Open redirect | Pass | `normalizeInternalRedirect` used for dev-login redirect | Apply helper to future redirect flows |
| Raw backend errors | Pass | `normalizeApiError` maps unsafe errors before UI | Do not display `developerMessage` in production |
| `dangerouslySetInnerHTML` | Pass | No production usage found in source audit | Re-audit when rich text is introduced |
| Browser security headers | Pass | `next.config.ts` sets CSP, frame, nosniff, referrer, permissions policy | Tighten CSP by replacing unsafe inline style/script when framework setup supports nonces/hashes |
| Force push/history rewrite | Pass | No force push used | Keep branch protection disallowing force push |

## Notes

The CSP is intentionally conservative but still allows inline styles/scripts
needed by the current Next.js/MUI setup. It blocks framing, object embeds,
unexpected connect targets, and browser capabilities that are not used by the
application.
