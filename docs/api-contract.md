# API Contract Notes

The current API intentionally preserves the original frontend contract while the
backend internals are being modernized.

## Contract Source

The backend exposes its OpenAPI document at:

```txt
GET /openapi.json
```

This keeps the contract close to the code and makes it easy to wire into
Swagger UI, Redoc, CI validation, or generated clients later.

## Compatibility Decisions

Some response shapes are deliberately legacy-compatible:

- Recipes use `_id` instead of `id`.
- Recipe authors are returned as username strings.
- `POST /recipes` returns the created ID as plain text.
- `GET /logged` returns the current username as plain text.

These are not the shapes I would choose for a brand-new API, but keeping them
for now lets the backend change without forcing a full frontend rewrite in the
same step.

## Current Error Shape

Most structured errors return:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request"
}
```

Some legacy status-only responses still exist, mostly around auth/session
compatibility. Those can be cleaned up once the frontend has a typed API client
and better auth state handling.

## Future v2 Contract

A cleaner future contract would likely change:

- `_id` to `id`
- plain-text responses to JSON objects
- username-only ownership references to richer user summaries
- route casing from `/Recipes` frontend paths to lowercase API conventions only
- auth endpoints to return explicit session/user objects

Example:

```json
{
  "id": "recipe-id",
  "name": "Pizza",
  "author": {
    "id": "user-id",
    "username": "ammar"
  }
}
```

## Senior-Level Migration Strategy

The important choice is sequencing. Backend internals were modernized first,
while the external contract stayed stable. That reduces blast radius and makes
each modernization step reviewable:

1. Improve internals.
2. Document the current contract.
3. Add tests around that contract.
4. Migrate the frontend.
5. Introduce a cleaner API contract deliberately.
