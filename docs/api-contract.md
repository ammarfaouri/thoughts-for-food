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
- `GET /logged` returns the current username as plain text when called with a
  Bearer access token.

These are not the shapes I would choose for a brand-new API, but keeping them
for now lets the backend change without forcing a full frontend rewrite in the
same step.

## Current Error Shape

Most structured errors return:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "requestId": "0f4e7d58-9fd5-4e60-9e88-c68bbadfc67b"
}
```

Validation errors may also include a `details` array with field-level messages.
Every response includes an `x-request-id` header. Clients may provide their own
`x-request-id`; otherwise the API generates one. This makes logs, support
reports, and failed requests easier to correlate.

Some legacy status-only responses still exist. Those can be cleaned up once the
frontend has a typed API client and better auth state handling.

## Auth Contract

The current auth contract uses:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Login/register responses include a short-lived `accessToken` in JSON and set an
HTTP-only `refreshToken` cookie. Protected routes use:

```txt
Authorization: Bearer <accessToken>
```

The refresh token is opaque, hashed before persistence, rotated on every
refresh, and revoked on logout.

## Recipe Search Contract

`GET /recipes` supports optional query params:

```txt
search       case-insensitive match on name or description
difficulty   exact 1-5 difficulty match
maxPrepTime  recipes at or below this prep time in minutes
author       exact author username
tag          exact normalized tag match
limit        page size, default 20, max 50
offset       pagination offset, default 0
```

Example:

```txt
GET /recipes?search=pizza&difficulty=3&maxPrepTime=60&tag=italian&limit=10&offset=0
```

## Future v2 Contract

A cleaner future contract would likely change:

- `_id` to `id`
- plain-text responses to JSON objects
- username-only ownership references to richer user summaries
- route casing from `/Recipes` frontend paths to lowercase API conventions only
- legacy auth aliases to be replaced by the explicit `/auth/*` contract
- old legacy route aliases to be removed after the frontend migrates

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
