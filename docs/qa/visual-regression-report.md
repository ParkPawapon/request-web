# Visual Regression Report

| Route group | Status | Evidence | Remediation / remaining risk |
| --- | --- | --- | --- |
| Login | Source-reviewed | Legacy source and assets inspected; new route preserves wording, orange visual hierarchy, and SSO/dev login structure | Screenshot diff blocked by legacy runtime coupling |
| Student list/form/detail | Source-reviewed | Route parity matrix maps all student paths and feature ownership | Capture desktop/mobile screenshots with seeded data |
| Lecturer list/form/detail | Source-reviewed | Route parity matrix maps lecturer paths and status text behavior | Capture desktop/mobile screenshots with seeded data |
| Staff dashboard/status/detail | Source-reviewed | Staff routes preserve status buckets and dashboard density | Capture desktop/mobile screenshots with seeded data |
| Assets | Pass | `dpit.png` and `dpitx65yrs.png` are in `public/assets/images` | Add only assets that are used by migrated UI |

## Blocker

Legacy screenshot capture was not run in this hardening pass. The legacy dev
script starts Vite and Express together and depends on local backend environment
files. See `docs/migration/legacy-runtime-blockers.md`.
