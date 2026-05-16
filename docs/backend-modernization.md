# Backend Modernization Notes

This document explains the backend direction and the reasoning behind the
changes. The goal is not to make the code look complicated. The goal is to make
the project easier to reason about, test, and extend.

## What Changed

The original backend was a single Express file backed by MongoDB/Mongoose. That
worked for a first project, but the business rules, HTTP behavior, persistence,
authentication, and configuration all lived in the same place.

The backend now uses:

- TypeScript
- Express
- PostgreSQL
- Prisma
- Zod validation
- JWT access tokens with rotating PostgreSQL-backed refresh tokens
- Domain/application/infrastructure/http boundaries
- Unit and HTTP integration tests

## Why PostgreSQL

Recipes are relational enough to benefit from SQL:

- A user owns many recipes.
- A recipe has ordered ingredients.
- A recipe has ordered method steps.
- Future features like tags, favorites, reviews, and comments are naturally
  relational.

MongoDB was fine for a first CRUD implementation, but PostgreSQL lets the
project demonstrate constraints, migrations, relations, indexes, and ownership
queries more clearly.

## Why Prisma

Prisma was chosen because it gives a strong TypeScript developer experience and
keeps the data model readable in one schema file. It also provides migrations
and generated types without adding much ORM ceremony.

The main tradeoff is that Prisma abstracts SQL more than a query builder like
Drizzle or Knex. For this project that is acceptable because the value is in
clear modeling, ownership, validation, and testable application code.

## Architecture Boundary

The backend follows a lightweight hexagonal structure:

```txt
domain          Types and repository contracts
application     Use cases and business decisions
infrastructure  Prisma implementations
interfaces/http Express routes, middleware, serializers
```

The important rule is dependency direction:

```txt
HTTP -> application -> domain contracts <- infrastructure
```

Application services do not import Express or Prisma. That makes them easy to
unit test and keeps business rules from depending on web/database details.

## Ownership Rule

The original app trusted `author` from the client request body when editing or
deleting recipes. That is not safe because a client can send any author value.

The modernized backend reads the authenticated user from a verified JWT access
token and checks ownership server-side before updates/deletes. The frontend may
still send an `author` field for compatibility, but the backend no longer trusts
it.

## Auth Model

The API now uses:

- Short-lived JWT access tokens returned in JSON.
- Opaque refresh tokens stored in an HTTP-only cookie.
- SHA-256 refresh token hashes stored in PostgreSQL.
- Refresh token rotation on every `POST /auth/refresh`.
- Refresh token family revocation when a revoked token is reused.

This avoids storing raw refresh tokens in the database and avoids putting the
long-lived credential in browser JavaScript.

## API Compatibility

The current frontend still expects Mongo-style `_id` fields and plain `author`
usernames. The backend keeps that API shape through serializers while using
PostgreSQL IDs and relations internally.

That is an intentional migration strategy:

1. Modernize internals.
2. Preserve existing external behavior.
3. Migrate frontend/API contract later when there is time.

## Testing Strategy

Current tests cover two layers:

- Unit tests for application services.
- HTTP integration tests using Express, routes, middleware, and in-memory
  repositories.
- Database-backed repository tests using Prisma against PostgreSQL.

This keeps the fast suite quick while still proving that the real repository
adapters, migrations, constraints, nested writes, and cascade behavior work
against PostgreSQL.

The database-backed suite is explicit:

```bash
cd t4f
npm run test:db
```

## Production Hardening Added

- `GET /health` for basic process health.
- `GET /ready` for database readiness.
- Structured `404` responses.
- Centralized error handling.
- Login rate limiting.
- HTTP-only refresh token cookie defaults.
- Hidden public profile email.
- OpenAPI contract exposed at `/openapi.json`.
- CI pipeline for backend and frontend checks.
- Database-backed repository tests.
- Search/filtering with tag support.
- Request IDs are returned in `x-request-id`, included in error responses, and
  attached to HTTP logs.
- Environment configuration is validated at startup, with production checks for
  required secrets.
- Logs are structured with Pino and redact auth/cookie headers.
- ESLint, Prettier, lint-staged, and Husky keep backend commits consistent.

## Remaining Backend Work

The backend foundation is now in a good stopping point. The remaining backend
work is optional product/deployment work rather than modernization foundation:

- Add favorites if the app needs a small user-specific product feature.
- Add file/image upload flow if recipe photos become part of the core UX.
- Add deployment configuration when choosing a real hosting target.
- Remove legacy response shapes only after the frontend is ready for a v2 API.

## Senior-Level Framing

The main decision was to avoid a rewrite-for-rewrite's-sake. The backend was
modernized behind the existing API contract first. That reduced risk and gave a
stable path for the frontend to continue working.

The shape is intentionally boring:

- Keep business rules in services.
- Keep persistence behind repositories.
- Keep HTTP concerns in routes and middleware.
- Use SQL where the data is relational.
- Add tests around ownership and authentication before adding features.

That is the kind of structure that lets a small app grow without turning every
new feature into a cross-file guessing exercise.
