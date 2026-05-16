# Frontend Modernization Notes

This document explains the frontend direction after the backend modernization.
The goal was not to turn the app into a complex frontend showcase. The goal was
to make the original React app easier to run, reason about, and present in a
portfolio.

## What Changed

The original frontend was a flat JavaScript React app using class components,
manual API calls, manual form state, and an older Create React App runtime.

The frontend now uses:

- Vite for local development and production builds
- TypeScript and TSX
- function components and hooks
- feature-based folders
- typed Axios API client
- TanStack Query v4 for server state
- React Hook Form and Zod for forms and validation
- React Bootstrap with a polished custom CSS pass
- Vitest and Testing Library for the smoke test

## Current Structure

```txt
react-client/src
|-- app/
|   |-- App.tsx
|   `-- queryClient.ts
|-- api/
|   |-- client.ts
|   `-- types.ts
|-- features/
|   |-- auth/
|   |   |-- LoginPage.tsx
|   |   |-- SignUpPage.tsx
|   |   `-- authSchemas.ts
|   |-- marketing/
|   |   |-- HomePage.tsx
|   |   |-- AboutPage.tsx
|   |   `-- ContactPage.tsx
|   |-- recipes/
|   |   |-- RecipesPage.tsx
|   |   |-- RecipeDetailPage.tsx
|   |   |-- RecipeFormPage.tsx
|   |   |-- recipeFormSchema.ts
|   |   |-- recipeQueries.ts
|   |   `-- components/
|   |       `-- RecipeCard.tsx
|   |-- users/
|   |   |-- ProfilePage.tsx
|   |   `-- userQueries.ts
|-- shared/
|   `-- layout/
|       `-- NavBar.tsx
|-- App.css
|-- Home.css
|-- index.css
`-- index.tsx
```

## Why Vite

The original app used an older Create React App / webpack toolchain that breaks
on modern Node without compatibility flags. Vite gives faster local startup,
simpler configuration, and a current build pipeline while keeping the React app
small.

## Why TypeScript

The backend now has a clear API contract, so the frontend should not treat API
data as untyped objects. The frontend has shared DTO types in `src/api/types.ts`
and a typed API client in `src/api/client.ts`.

This makes contract drift visible during development. The frontend now expects
`id`, `recipes`, and `data` envelopes instead of the old `_id` and legacy
response shapes.

## Why Feature Folders

The original `src` folder had pages, layout, reusable components, and API logic
all sitting next to each other. That is fine for a first project, but it becomes
harder to navigate as the app grows.

The new structure groups code by product area:

- `features/auth`
- `features/recipes`
- `features/users`
- `features/marketing`
- `shared/layout`

This makes it easier to find code by user-facing behavior rather than by
technical category.

## Why TanStack Query

Recipe lists, recipe details, and user profiles are server state. They are not
pure UI state.

Before TanStack Query, each page manually did:

```txt
useEffect -> call API -> put result in local state -> log errors
```

TanStack Query centralizes loading, error, caching, refetching, and invalidation
behavior. The app now has query hooks such as:

- `useRecipesQuery`
- `useRecipeQuery`
- `useUserProfileQuery`
- `useDeleteRecipeMutation`

Create/update/delete flows invalidate affected recipe and profile queries so the
UI does not keep stale cached data.

## Why React Hook Form And Zod

The original forms manually tracked each field in React state and relied on
scattered JSX validation props. That works, but it spreads validation across the
component.

The modernized forms use:

- `authSchemas.ts` for login/signup validation
- `recipeFormSchema.ts` for recipe validation
- `useFieldArray` for dynamic ingredients and method steps

The submit handlers now receive typed, already-validated values.

## Current Tradeoffs

The app still uses:

- React 16
- React Router v5
- React Bootstrap v1

Those were left in place intentionally to keep the modernization incremental.
The next ecosystem upgrade should be React 18+, then React Router v6+.

TanStack Query v4 was chosen because it supports React 16. Newer TanStack Query
versions expect React 18/19.

## What I Would Improve Next

- Upgrade React 16 to React 18+.
- Upgrade React Router v5 to v6+.
- Move auth state from `App.tsx` into an `AuthProvider`.
- Split `api/client.ts` into feature API modules.
- Add tests for form validation and query loading/error states.
- Add real recipe image upload instead of static Unsplash images.
- Add product features such as favorites, comments, or ratings.
