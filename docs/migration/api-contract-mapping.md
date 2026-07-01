# API Contract Mapping

The frontend contract uses `NEXT_PUBLIC_API_BASE_URL` plus centralized
`/v1/...` endpoint constants. Legacy `/api/v1/...` paths are accepted only as
incoming payload values that must be normalized by the shared API layer.

| Legacy frontend action | Legacy API path | New API v1 path | HTTP method | Request DTO | Response DTO | Auth required | Used by route/feature | Migration status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Load current user | `/api/v1/auth/me` | `/v1/auth/me` | GET | None | `SessionUser` | Cookie session | Auth guard/session | Migrated | Centralized in session entity |
| Fetch CSRF token | `/api/v1/auth/csrf` | `/v1/auth/csrf` | GET | None | `{ csrfToken: string }` | Cookie session | Login, mutations | Migrated | Required before mutating calls |
| Dev login | `/api/v1/auth/dev/login` | `/v1/auth/dev/login` | POST | `DevLoginRequest` | `LoginResponse` | CSRF | Login | Migrated | Redirect sanitized before routing |
| SSO login URL | `/api/v1/auth/sso/login` | `/v1/auth/sso/login` | GET | None | Redirect URL | No | Login | Migrated | Navigation still initiated by browser |
| Logout | `/api/v1/auth/logout` | `/v1/auth/logout` | POST | CSRF request | Success | Cookie session | Session/logout | Migrated | Clears client session state |
| Student list | `/api/v1/petitions/my` | `/v1/petitions/my` | GET | Query params | `PetitionSummary[]` | Student | `/student` | Migrated | No direct component fetch |
| Student create | `/api/v1/petitions` | `/v1/petitions` | POST | `CreatePetitionRequest`/FormData | `PetitionDetail` | Student + CSRF | `/student-request` | Migrated | Upload validation remains frontend + backend responsibility |
| Student detail | `/api/v1/petitions/:id` | `/v1/petitions/:id` | GET | `id` | `PetitionDetail` | Student | `/student/request/[id]` | Migrated | DTO in request entity |
| Student attachments | `/api/v1/petitions/:id/attachments` | `/v1/petitions/:id/attachments` | GET/POST | `id`, FormData on POST | `PetitionAttachment[]` | Student + CSRF for POST | Request detail/submit | Migrated | Download path normalized |
| Lecturer list | `/api/v1/petitionsLecturers/my` | `/v1/petitionsLecturers/my` | GET | Query params | `PetitionSummary[]` | Lecturer | `/lecturer` | Migrated | Uses same list feature |
| Lecturer create | `/api/v1/petitionsLecturers` | `/v1/petitionsLecturers` | POST | `CreatePetitionRequest`/FormData | `PetitionDetail` | Lecturer + CSRF | `/lecturer-request` | Migrated | Endpoint constant centralized |
| Lecturer detail | `/api/v1/petitionsLecturers/:id` | `/v1/petitionsLecturers/:id` | GET | `id` | `PetitionDetail` | Lecturer | `/lecturer/request/[id]` | Migrated | DTO in request entity |
| Staff dashboard | `/api/v1/staff-dashboard/requests` | `/v1/staff-dashboard/requests` | GET | Dashboard query DTO | Staff dashboard DTO | Staff | `/staff` | Migrated | Query params built in entity API |
| Staff request list | `/api/v1/staff/requests` | `/v1/staff/requests` | GET | Staff list query DTO | `PetitionSummary[]` | Staff | Staff status routes | Migrated | Status route filters are centralized |
| Staff detail | `/api/v1/staff/requests/:id` | `/v1/staff/requests/:id` | GET | `id` | `PetitionDetail` | Staff | `/staff/request/[id]` | Migrated | No component fetch |
| Staff attachments | `/api/v1/staff/requests/:id/attachments` | `/v1/staff/requests/:id/attachments` | GET/POST | `id`, FormData on POST | `PetitionAttachment[]` | Staff + CSRF for POST | Staff detail | Migrated | Download path normalized |
| Petition types | `/api/v1/petition-types` | `/v1/petition-types` | GET | None | Petition type list | Auth required by backend | Request submission | Migrated | Shared between student and lecturer |
