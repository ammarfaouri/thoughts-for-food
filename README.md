# 🍽️ Thoughts for Food

> A modernized recipe-sharing application with a production-oriented TypeScript backend, PostgreSQL persistence, JWT authentication, and a legacy-compatible React frontend.

---

## ✨ Overview

**Thoughts for Food** is a full-stack recipe-sharing application where users can:

- 🧑‍🍳 Create an account
- 🔐 Log in securely
- 🔎 Browse and search recipes
- 📝 Publish their own recipes
- ✏️ Edit and delete recipes they own
- 👤 View recipe author profiles

The project began as a first full-stack application and has since been modernized to demonstrate a cleaner, more production-ready backend architecture while preserving compatibility with the original frontend experience.

---

## 🧰 Tech Stack

### 🖥️ Backend

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Server | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Authentication | JWT access tokens + rotating refresh tokens |
| Password Security | bcrypt |
| Testing | Vitest |
| Local Infrastructure | Docker Compose |

### 🎨 Frontend

| Area | Technology |
| --- | --- |
| UI Library | React 16 |
| Build Tool | Vite |
| Routing | React Router v5 |
| Components | React Bootstrap |
| HTTP Client | Axios 1.x |
| Testing | Vitest |

> The frontend is still largely the original React implementation, but the build tooling has been migrated from Create React App to **Vite**, allowing it to run cleanly on modern Node versions.

---

## 🏗️ Backend Architecture

The backend follows a lightweight **hexagonal / clean architecture** style.

```txt
t4f/src
├── domain/           Core recipe and user types plus repository contracts
├── application/      Auth, user profile, and recipe use cases
├── infrastructure/   Prisma client and repository implementations
├── interfaces/http/  Express routes, middleware, validation, serializers
└── config/           Environment parsing
```

### Architectural Boundary

The key design decision is that application services depend on **repository interfaces**, not directly on Express or Prisma.

That means:

- Express is treated as an HTTP adapter.
- Prisma is treated as a persistence adapter.
- Business/application logic stays framework-independent.
- Repository contracts sit at the boundary between the core and infrastructure.

This keeps the backend easier to test, reason about, and evolve.

📚 More detailed backend reasoning is documented in:

- [Backend Modernization Notes](docs/backend-modernization.md)
- [API Contract and Compatibility Notes](docs/api-contract.md)

The live OpenAPI document is exposed by the backend at:

```http
GET /openapi.json
```

---

## 🚀 Running the Backend

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

The API will be available at:

```txt
http://localhost:5000
```

---

## 🧪 Useful Commands

### Backend

```bash
cd t4f
npm test
npm run test:db
npm run build
npm run prisma:generate
```

### Frontend

```bash
cd react-client
npm test
npm run build
npm run dev
```

---

## ✅ Continuous Integration

GitHub Actions runs backend and frontend quality gates on pushes to `master` / `main` and on pull requests.

### Backend CI

The backend workflow:

- 📦 Installs dependencies with `npm ci`
- 🧬 Generates the Prisma client
- 🗄️ Applies migrations to a PostgreSQL service
- ⚡ Runs fast tests
- 🧪 Runs database-backed repository tests
- 🏗️ Builds TypeScript
- 🔍 Audits production dependencies

### Frontend CI

The frontend workflow:

- 📦 Installs dependencies with `npm ci`
- 🧪 Runs the Vitest smoke test
- 🏗️ Builds the Vite app
- 🔍 Audits production dependencies

---

## 🔌 API Compatibility

The backend still exposes the original route surface for compatibility with the legacy frontend.

### Recipes

| Method | Route |
| --- | --- |
| `GET` | `/recipes` |
| `GET` | `/recipes?search=&difficulty=&maxPrepTime=&author=&limit=&offset=` |
| `POST` | `/recipes` |
| `GET` | `/recipes/:id` |
| `PUT` | `/recipes/:id` |
| `DELETE` | `/recipes/:id` |

### Users

| Method | Route |
| --- | --- |
| `POST` | `/users` |
| `GET` | `/users/:username` |

### Auth

| Method | Route |
| --- | --- |
| `POST` | `/auth/register` |
| `POST` | `/auth/login` |
| `POST` | `/auth/refresh` |
| `POST` | `/auth/logout` |
| `GET` | `/auth/me` |

Recipe responses still include legacy-compatible fields such as:

```json
{
  "_id": "recipe-id",
  "author": "username"
}
```

Authentication has moved to `/auth/*` token endpoints, so the current React authentication flow needs a follow-up update.

---

## 🧭 Next Modernization Steps

Planned improvements:

- ⚛️ Replace class components with function components
- 🟦 Convert the React app to TypeScript
- 🔄 Add TanStack Query for server state
- 🧾 Add React Hook Form + Zod for forms
- 🖼️ Add image upload support for recipes
- 🏷️ Add tags, favorites, comments, and advanced search filters
- 🧪 Add end-to-end tests once the frontend is modernized

---

## 📌 Project Status

The backend modernization is the main focus of the current version.

The project now demonstrates:

- Clean backend boundaries
- Typed request validation
- PostgreSQL persistence
- Prisma-backed repositories
- JWT-based authentication
- Rotating refresh tokens
- Database-backed tests
- CI quality gates
- Legacy API compatibility

---

## 🥘 Built with care

**Thoughts for Food** is both a working recipe application and a learning project evolved into a more maintainable full-stack codebase.