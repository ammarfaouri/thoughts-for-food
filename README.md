# Thoughts for Food

Thoughts for Food is a full-stack recipe-sharing app that started as a first
coding project and has been modernized into a backend-focused portfolio project.

Users can register, log in, browse recipes, search/filter recipes, publish their
own recipes, edit/delete recipes they own, and view public author profiles.

## Current Focus

The main value of this version is the backend modernization:

- TypeScript Express API
- PostgreSQL persistence with Prisma
- migration-based schema management
- lightweight hexagonal architecture
- JWT access tokens with rotating refresh tokens
- Zod request validation
- structured errors with request IDs
- Pino structured logging
- health/readiness routes
- OpenAPI contract at `/openapi.json`
- unit, HTTP, and database-backed tests
- GitHub Actions CI

The frontend is still intentionally closer to the original app, with Vite
updates added so it can run on modern Node. Its API calls need to be migrated to
the current `/api` backend contract next.

## Tech Stack

### Backend

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Server | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Authentication | JWT access tokens + rotating refresh tokens |
| Password security | bcrypt |
| Logging | Pino / pino-http |
| Testing | Vitest, Supertest |
| Local infrastructure | Docker Compose |

### Frontend

| Area | Technology |
| --- | --- |
| UI library | React 16 |
| Build tool | Vite |
| Routing | React Router v5 |
| Components | React Bootstrap |
| HTTP client | Axios |
| Testing | Vitest |

## Backend Architecture

The backend uses a lightweight hexagonal / clean architecture shape:

```txt
t4f/src
|-- domain/           Core types and repository contracts
|-- application/      Auth, recipe, and profile use cases
|-- infrastructure/   Prisma client, logger, repository implementations
|-- interfaces/http/  Express routes, middleware, validation, serializers
|-- config/           Environment parsing and validation
`-- shared/           Shared application errors
```

The important boundary is dependency direction:

```txt
HTTP -> application -> domain contracts <- infrastructure
```

Application services do not import Express or Prisma. Express is treated as an
HTTP adapter, and Prisma is treated as a persistence adapter.

More backend reasoning:

- [Backend Modernization Notes](docs/backend-modernization.md)
- [API Contract Notes](docs/api-contract.md)
- [Backend Portfolio Notes](docs/backend-portfolio-notes.md)

## Running The Backend

From the backend directory:

```bash
cd t4f
cp .env.example .env
docker compose up -d
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The API runs at:

```txt
http://localhost:5000
```

Useful backend endpoints:

```txt
GET /health
GET /ready
GET /metrics
GET /openapi.json
```

Build a production backend image:

```bash
cd t4f
docker build -t thoughts-for-food-api .
```

## Running The Frontend

From the frontend directory:

```bash
cd react-client
npm install
npm run dev
```

Vite will print the local URL, usually:

```txt
http://localhost:5173
```

## Useful Commands

Backend:

```bash
cd t4f
npm run prisma:generate
npm run format:check
npm run lint
npm run typecheck
npm run build
npm test
npm run test:db
npm audit --omit=dev
npm run auth:cleanup-refresh-tokens
```

Backend commits run a lightweight pre-commit hook through Husky and lint-staged.
It formats and lints staged backend files only; full tests remain manual/CI
checks so local commits stay fast.

Frontend:

```bash
cd react-client
npm test
npm run build
```

## Environment Variables

Backend configuration lives in `t4f/.env`.

```txt
DATABASE_URL
PORT
JWT_ACCESS_SECRET
JWT_ACCESS_TTL
JWT_REFRESH_TTL_DAYS
NODE_ENV
LOG_LEVEL
```

The backend validates configuration at startup. In production,
`DATABASE_URL` and `JWT_ACCESS_SECRET` must be explicitly set.

## API Contract

Product routes live under `/api`. System routes stay unversioned because they
are operational endpoints rather than product resources.

Responses use JSON envelopes:

```json
{
  "data": {
    "id": "recipe-id"
  }
}
```

### Recipes

| Method | Route |
| --- | --- |
| `GET` | `/api/recipes` |
| `GET` | `/api/recipes?search=&difficulty=&maxPrepTime=&author=&tag=&limit=&offset=` |
| `POST` | `/api/recipes` |
| `GET` | `/api/recipes/:id` |
| `PUT` | `/api/recipes/:id` |
| `DELETE` | `/api/recipes/:id` |

### Auth

| Method | Route |
| --- | --- |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/refresh` |
| `POST` | `/api/auth/logout` |
| `GET` | `/api/auth/me` |

### Users

| Method | Route |
| --- | --- |
| `GET` | `/api/users/:username` |

The old legacy route surface was removed because the app is not in production
and does not need backward compatibility yet.

## Authentication Model

The API uses:

- short-lived JWT access tokens returned in JSON
- opaque refresh tokens in HTTP-only cookies
- SHA-256 refresh token hashes stored in PostgreSQL
- refresh token rotation on every refresh
- refresh token family revocation on token reuse

Protected recipe writes use:

```txt
Authorization: Bearer <accessToken>
```

## CI

GitHub Actions runs backend and frontend quality gates on pull requests and
pushes to `master` / `main`.

Backend CI:

- install dependencies with `npm ci`
- generate Prisma client
- apply migrations to PostgreSQL
- run fast tests
- run database-backed tests
- build TypeScript
- audit production dependencies

Frontend CI:

- install dependencies with `npm ci`
- run tests
- build Vite app
- audit production dependencies

## Project Status

Backend modernization is effectively wrapped. The remaining work is mostly
product polish and frontend modernization:

- convert the React app to TypeScript
- replace older class components over time
- add React Hook Form + Zod for forms
- add TanStack Query for server state
- add image uploads or favorites as future product features
- migrate the frontend to the `/api` contract
