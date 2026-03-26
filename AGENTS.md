# Agents Guide — ClawStarter

## Project Context

ClawStarter is a Next.js 16 app using TypeScript, Tailwind CSS v4, and the App Router.

## Key Constraints

- **App Router only** — All routes live under `src/app/`. Do not create a `pages/` directory.
- **Server Components by default** — Only add `"use client"` when the component needs browser APIs, hooks, or event handlers.
- **TypeScript strict mode** — No `any` types. Define interfaces/types for all data structures.
- **Tailwind CSS** — Use Tailwind utility classes. No CSS modules or inline styles.
- **Import alias** — Use `@/` for all imports from `src/` (e.g., `import { Button } from "@/components/Button"`).

## Directory Conventions

| Directory | Purpose |
|---|---|
| `src/app/` | Pages, layouts, route handlers, loading/error states |
| `src/components/` | Reusable UI components |
| `src/lib/` | Utilities, helpers, shared logic |
| `src/types/` | TypeScript type definitions |
| `public/` | Static files served at root |

## Code Style

- Use named exports for components.
- Colocate component-specific types in the component file.
- Use `async` Server Components for data fetching — no `useEffect` for fetches that can run on the server.
- Validate at system boundaries (API routes, form inputs), trust internal code.

## Commands

- `npm run dev` — Dev server
- `npm run build` — Build (must pass before merging)
- `npm run lint` — Lint (must pass before merging)

## Before Submitting Work

1. `npm run build` passes with no errors.
2. `npm run lint` passes with no warnings.
3. No `any` types introduced.
4. No `"use client"` added unnecessarily.
