# ClawStarter

## Project Overview

ClawStarter is a Next.js application.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Linting:** ESLint with next/core-web-vitals and next/typescript configs
- **Package Manager:** npm

## Project Structure

```
src/
  app/           # App Router pages, layouts, and route handlers
    layout.tsx   # Root layout
    page.tsx     # Home page
    globals.css  # Global styles (Tailwind imports)
public/          # Static assets
```

- Import alias: `@/*` maps to `./src/*`

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Conventions

- Use the App Router (`src/app/`) for all pages and API routes.
- Use Server Components by default; add `"use client"` only when needed.
- Use the `@/` import alias for all project imports.
- Keep components in `src/components/`, utilities in `src/lib/`, and types in `src/types/`.
- Tailwind CSS for all styling — avoid inline styles and CSS modules.
