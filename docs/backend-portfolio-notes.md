# Backend Portfolio Notes

This document summarizes how to talk about the backend modernization in a
portfolio, interview, or project walkthrough.

## Project Summary

Thoughts for Food is a recipe-sharing app that was originally built as a first
full-stack project. The modernization focused on turning the backend into a
maintainable TypeScript API with production-style boundaries, SQL persistence,
token authentication, tests, and operational basics.

## Main Backend Story

The original app worked, but too many concerns lived together: routes, database
logic, authentication, ownership rules, and response shaping. The modernization
separated those concerns without overengineering the app.

The backend now has:

- domain types and repository contracts
- application services for use cases
- Prisma repositories as infrastructure adapters
- Express routes and middleware as HTTP adapters
- PostgreSQL migrations and constraints
- token-based auth with refresh token rotation
- request validation, structured errors, request IDs, and structured logs
- clean `/api` JSON routes without legacy aliases

## Architecture Decision

The architecture is intentionally lightweight. It borrows from hexagonal
architecture, but it does not try to make every file abstract.

The important rule is:

```txt
HTTP -> application -> domain contracts <- infrastructure
```

That means recipe ownership checks, auth decisions, and profile behavior live
in application services. Express and Prisma are implementation details around
those services.

## Database Decision

PostgreSQL replaced the original document-style persistence because the app is
naturally relational:

- users own recipes
- recipes have ordered ingredients
- recipes have ordered steps
- recipes can have many tags
- future favorites/comments/reviews would be relational too

Prisma was chosen to keep the schema readable, migrations explicit, and the
TypeScript developer experience strong.

## Auth Decision

The app moved away from sessions to:

- JWT access tokens for API authorization
- opaque refresh tokens in HTTP-only cookies
- hashed refresh tokens in PostgreSQL
- refresh token rotation
- family revocation when reuse is detected

This keeps long-lived credentials out of browser JavaScript and avoids storing
raw refresh tokens server-side.

## Production-Style Additions

The backend now includes practical operational basics:

- `/health` for process health
- `/ready` for database readiness
- `x-request-id` correlation
- structured Pino logs
- redaction for auth/cookie headers
- startup config validation
- OpenAPI documentation
- CI with database-backed tests
- Prometheus-style HTTP metrics
- production Docker image support
- refresh token cleanup command

These are intentionally small additions, but they show production judgment.

## What I Would Improve Next

The backend foundation is good enough to stop adding infrastructure. The
frontend has also been modernized into a presentable TypeScript/Vite app. The
next best improvements are product, deployment, or ecosystem upgrades:

- image upload flow for recipe photos
- favorites or comments as user engagement features
- React 18+ and React Router v6+ upgrades
- richer frontend tests
- deployment configuration and environment-specific setup

I would avoid adding RBAC, queues, caching, or microservices until the product
actually needs them.
