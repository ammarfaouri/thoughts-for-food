# Thoughts for Food

Thoughts for Food is a full-stack recipe-sharing app that started as a first
coding project and has been modernized into a portfolio-ready application.

Users can register, log in, browse recipes, search/filter recipes, publish their
own recipes, edit/delete recipes they own, and view public author profiles.

## Current State

The project now demonstrates both backend and frontend modernization:

- TypeScript Express API with PostgreSQL and Prisma
- lightweight hexagonal backend architecture
- JWT access tokens with rotating refresh tokens
- clean `/api` contract with OpenAPI documentation
- request validation, structured errors, request IDs, logs, metrics, and health checks
- Vite React frontend with TypeScript and feature folders
- TanStack Query for server state
- React Hook Form and Zod for form handling
- modernized startup-style UI polish
- backend and frontend CI quality gates

## Tech Stack

### Backend

| Area                 | Technology                                  |
| -------------------- | ------------------------------------------- |
| Language             | TypeScript                                  |
| Server               | Express                                     |
| Database             | PostgreSQL                                  |
| ORM                  | Prisma                                      |
| Validation           | Zod                                         |
| Authentication       | JWT access tokens + rotating refresh tokens |
| Password security    | bcrypt                                      |
| Logging              | Pino / pino-http                            |
| Testing              | Vitest, Supertest                           |
| Local infrastructure | Docker Compose                              |

### Frontend

| Area         | Technology              |
| ------------ | ----------------------- |
| Language     | TypeScript              |
| UI library   | React 16                |
| Build tool   | Vite                    |
| Routing      | React Router v5         |
| Components   | React Bootstrap         |
| Server state | TanStack Query v4       |
| Forms        | React Hook Form + Zod   |
| HTTP client  | Axios                   |
| Testing      | Vitest, Testing Library |

React Query v4 is used because the app is still on React 16. Upgrading React is
a future step before moving to newer ecosystem versions.

## Project Structure

```txt
thoughts-for-food
|-- t4f/            Modern TypeScript Express API
|-- react-client/   Vite React frontend
|-- docs/           Architecture and portfolio notes
`-- .github/        CI workflow
```

Backend:

```txt
t4f/src
|-- domain/           Core types and repository contracts
|-- application/      Auth, recipe, and profile use cases
|-- infrastructure/   Prisma client, logger, repository implementations
|-- interfaces/http/  Express routes, middleware, validation, serializers
|-- config/           Environment parsing and validation
`-- shared/           Shared application errors
```

Frontend:

```txt
react-client/src
|-- app/              App shell and query client
|-- api/              Axios API client and DTO types
|-- features/
|   |-- auth/         Login/signup pages and schemas
|   |-- marketing/    Home/about/contact pages
|   |-- recipes/      Recipe pages, query hooks, form schema, card component
|   `-- users/        Public profile page and query hooks
`-- shared/           Shared layout components
```

## Architecture

The backend uses a lightweight hexagonal / clean architecture shape:

```txt
HTTP -> application -> domain contracts <- infrastructure
```

Application services do not import Express or Prisma. Express is treated as an
HTTP adapter, and Prisma is treated as a persistence adapter. This keeps
ownership rules, auth decisions, and recipe behavior testable without tying
business logic to web/database details.

The frontend is organized by feature. Pages call typed API/query hooks instead
of scattering fetch logic through components. Forms use schemas so validation is
defined in one place.

More reasoning:

- [Backend Modernization Notes](docs/backend-modernization.md)
- [Frontend Modernization Notes](docs/frontend-modernization.md)
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
npm start
```

Vite is configured to run on port `3000` and proxy `/api` calls to the backend
at `http://localhost:5000`.

```txt
http://localhost:3000
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

Frontend:

```bash
cd react-client
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Backend commits run a lightweight pre-commit hook through Husky and lint-staged.
It formats and lints staged backend files only; full tests remain manual/CI
checks so local commits stay fast.

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

| Method   | Route                                                                       |
| -------- | --------------------------------------------------------------------------- |
| `GET`    | `/api/recipes`                                                              |
| `GET`    | `/api/recipes?search=&difficulty=&maxPrepTime=&author=&tag=&limit=&offset=` |
| `POST`   | `/api/recipes`                                                              |
| `GET`    | `/api/recipes/:id`                                                          |
| `PUT`    | `/api/recipes/:id`                                                          |
| `DELETE` | `/api/recipes/:id`                                                          |

### Auth

| Method | Route                |
| ------ | -------------------- |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/login`    |
| `POST` | `/api/auth/refresh`  |
| `POST` | `/api/auth/logout`   |
| `GET`  | `/api/auth/me`       |

### Users

| Method | Route                  |
| ------ | ---------------------- |
| `GET`  | `/api/users/:username` |

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
- check formatting
- lint
- typecheck
- apply migrations to PostgreSQL
- run fast tests
- run database-backed tests
- build TypeScript
- audit production dependencies

Frontend CI:

- install dependencies with `npm ci`
- run tests
- typecheck
- build Vite app
- audit production dependencies

## Project Status

The backend foundation is effectively wrapped. The frontend has been modernized
enough to present the project cleanly: TypeScript, Vite, feature folders,
TanStack Query, React Hook Form, Zod, and a polished UI pass are in place.

Good future improvements:

- upgrade React 16 to React 18+
- upgrade React Router v5 to v6+
- move auth state into an `AuthProvider`
- split `api/client.ts` into feature API modules
- add richer frontend tests
- add product features such as recipe image upload, favorites, comments, or ratings
