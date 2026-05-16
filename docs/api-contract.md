# API Contract Notes

The backend now exposes one clean product API under `/api`. Legacy routes were
removed because the app is not in production and does not need backward
compatibility yet.

## Contract Source

The backend exposes its OpenAPI document at:

```txt
GET /openapi.json
```

System endpoints stay unversioned:

```txt
GET /health
GET /ready
GET /metrics
GET /openapi.json
```

Product endpoints live under `/api`:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id

GET /api/users/:username
```

## Response Shape

Successful API responses use a `data` envelope:

```json
{
  "data": {
    "id": "recipe-id",
    "name": "Pizza"
  }
}
```

The API uses `id`, not Mongo-style `_id`.

Deletes and logout return `204 No Content`.

## Error Shape

Structured errors return:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "requestId": "0f4e7d58-9fd5-4e60-9e88-c68bbadfc67b"
}
```

Validation errors may also include a `details` array with field-level messages.
Every response includes an `x-request-id` header. Clients may provide their own
`x-request-id`; otherwise the API generates one.

## Auth Contract

Login/register responses include a short-lived `accessToken` in JSON and set an
HTTP-only `refreshToken` cookie. Protected routes use:

```txt
Authorization: Bearer <accessToken>
```

The refresh token is opaque, hashed before persistence, rotated on every
refresh, and revoked on logout.

## Recipe Search Contract

`GET /api/recipes` supports optional query params:

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
GET /api/recipes?search=pizza&difficulty=3&maxPrepTime=60&tag=italian&limit=10&offset=0
```

## Frontend Contract Status

The frontend now consumes the clean `/api/*` contract through a typed Axios
client. It unwraps `data` envelopes, uses `id` fields, treats delete/logout as
`204 No Content`, and sends bearer access tokens for protected recipe writes.
