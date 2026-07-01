# Processes

Processes model multi-step business flows such as request submission, approval,
or delegation.

Rules:
- Processes may orchestrate features and entities.
- Route files should delegate flow UI to process modules.
- Keep side effects behind services and API client boundaries.
