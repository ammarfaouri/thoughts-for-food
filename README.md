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
- Session authentication with PostgreSQL-backed sessions
- bcrypt password hashing
- Vitest unit tests
- Docker Compose for local PostgreSQL

### Frontend

- React 16
- Create React App
- React Router v5
- React Bootstrap
- Axios

The frontend is still the original client. The backend keeps the old API
contract so the current React app can continue to work while the backend is
modernized first.

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
npm run build
npm run prisma:generate
```

## API Compatibility

The backend still exposes the original routes:

- `GET /recipes`
- `POST /recipes`
- `GET /recipes/:id`
- `PUT /recipes/:id`
- `DELETE /recipes/:id`
- `POST /users`
- `GET /users/:username`
- `POST /login`
- `GET /logged`
- `GET /logout`

Recipe responses still include `_id` and `author` fields so the current React
components do not need to be rewritten immediately.

## Next Modernization Steps

- Convert the React app to Vite + React + TypeScript.
- Replace class components with function components.
- Add TanStack Query for server state.
- Add React Hook Form + Zod for forms.
- Add image upload support for recipes.
- Add tags, favorites, comments, and search filters.
- Add end-to-end tests once the frontend is modernized.
