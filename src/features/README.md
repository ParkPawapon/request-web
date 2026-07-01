# Features

Feature modules own business use cases. A feature may contain local UI, hooks,
schemas, services, and types for that use case.

Rules:
- Features may import from `entities`, `widgets`, `processes`, and `shared`
  only when the dependency direction stays acyclic.
- Components must not call `fetch` or `axios` directly. Use feature services
  backed by `shared/api`.
- Keep feature-only constants and validation inside the feature.
