# Entities

Entities hold reusable domain models and UI fragments shared across features,
such as user, request, department, approval, or attachment.

Rules:
- Entities may import from `shared`.
- Entities must not import from `features`, `widgets`, `processes`, or `app`.
- Keep domain naming stable during migration from the legacy application.
