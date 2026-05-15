# Thoughts for Food

Thoughts for Food is a recipe-sharing application. Users can create accounts,
log in, browse recipes, publish their own recipes, edit/delete their own
recipes, and view recipe authors' profiles.

This started as a first full-stack project and has been modernized to show a
more production-oriented backend design.

## Current Stack

### Backend

- TypeScript
- Express
- PostgreSQL
- Prisma
- Zod request validation
- JWT access tokens with rotating PostgreSQL-backed refresh tokens
- bcrypt password hashing
- Vitest unit tests
- Docker Compose for local PostgreSQL

### Frontend

- React 16
- Vite
- React Router v5
- React Bootstrap
- Axios 1.x
- Vitest

The frontend is still largely the original React implementation, but the build
tooling has been moved from Create React App to Vite so it runs cleanly on
modern Node versions.

## Backend Architecture

The backend is organized around a lightweight hexagonal/clean architecture:

```txt
t4f/src
  domain/          Core recipe and user types plus repository contracts
  application/     Auth, user profile, and recipe use cases
  infrastructure/  Prisma client and repository implementations
  interfaces/http  Express routes, middleware, validation, serializers
  config/          Environment parsing
```

The important boundary is that application services depend on repository
interfaces, not directly on Express or Prisma. Express and Prisma are adapters
around the core use cases.

More detailed backend reasoning is documented in
[docs/backend-modernization.md](docs/backend-modernization.md).

The current API contract and legacy compatibility choices are documented in
[docs/api-contract.md](docs/api-contract.md). The live OpenAPI document is
available from the backend at `GET /openapi.json`.

## Running the Backend

```bash
cd t4f
cp .env.example .env
docker compose up -d
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The API runs on `http://localhost:5000`.

## Useful Commands

```bash
cd t4f
npm test
npm run test:db
npm run build
npm run prisma:generate
```

```bash
cd react-client
npm test
npm run build
npm run dev
```

## Continuous Integration

GitHub Actions runs the backend and frontend quality gates on pushes to
`master`/`main` and on pull requests.

Backend CI:

- installs dependencies with `npm ci`
- generates the Prisma client
- applies migrations to a PostgreSQL service
- runs fast tests
- runs database-backed repository tests
- builds TypeScript
- audits production dependencies

Frontend CI:

- installs dependencies with `npm ci`
- runs the Vitest smoke test
- builds the Vite app
- audits production dependencies

## API Compatibility

The backend still exposes the original routes:

- `GET /recipes`
- `POST /recipes`
- `GET /recipes/:id`
- `PUT /recipes/:id`
- `DELETE /recipes/:id`
- `POST /users`
- `GET /users/:username`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Recipe responses still include `_id` and `author` fields for compatibility.
Authentication has moved to `/auth/*` token endpoints, so the current React auth
flow needs a follow-up update.

## Next Modernization Steps

- Replace class components with function components.
- Convert the React app to TypeScript.
- Add TanStack Query for server state.
- Add React Hook Form + Zod for forms.
- Add image upload support for recipes.
- Add tags, favorites, comments, and search filters.
- Add end-to-end tests once the frontend is modernized.
