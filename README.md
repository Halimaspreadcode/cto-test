# Next.js 14 Starter: i18n (FR/EN), Tailwind, shadcn/ui, Themes, CI

This repository scaffolds a modern Next.js 14 App Router project with:

- TypeScript, ESLint, Prettier
- Tailwind CSS with shadcn-style design tokens and primitives
- Dark/Light theme toggle using `next-themes`
- Internationalization via `next-intl` with locale-prefixed routing (default: French)
- Raleway and Poppins fonts via `next/font`
- Zustand example store
- Husky + lint-staged pre-commit formatting and linting
- GitHub Actions CI to lint, type-check and build
- Vercel-ready configuration

## Getting started

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 to see the app. Routes are locale-prefixed, e.g. `/fr` and `/en`.

## Internationalization (next-intl)

- Supported locales: `fr` (default), `en`
- Locale-based routing is enabled via `middleware.ts`
- Messages live in `src/messages/{locale}.json`
- Use `useTranslations('Namespace')` in components/pages

## Theming

- Dark mode is class-based (`dark`) via `next-themes`
- Theme tokens are defined in `src/styles/globals.css` using CSS variables
- Tailwind reads these tokens in `tailwind.config.ts`

## UI primitives (shadcn-style)

- `Button` component: `src/components/ui/button.tsx`
- Utility `cn` function: `src/lib/utils.ts`

## Fonts

- Poppins (sans) and Raleway (heading) via `next/font` are configured in `src/app/[locale]/layout.tsx`

## Zustand example

- Simple counter store in `src/stores/counter.ts`
- `Counter` component in `src/components/counter.tsx`

## Code quality

- Run lint: `npm run lint`
- Type-check: `npm run type-check`
- Format: `npm run format`

## Husky & lint-staged

Husky is set up with a pre-commit hook to run ESLint and Prettier on staged files. On first install, Husky hooks are enabled via `npm install` (runs `npm run prepare`).

## CI

GitHub Actions workflow runs on push/PR to main branches and will:
- Install dependencies
- Lint (`npm run lint`)
- Type-check (`npm run type-check`)
- Build (`npm run build`)

## Deployment (Vercel)

- The project is Vercel-ready. Import the repo in Vercel and it will detect Next.js automatically.
- Default Node version is 20 (see `package.json` engines).
- Environment variables can be configured in Vercel dashboard. See `.env.example` for references.

## Project structure

```
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
  components/
    ui/button.tsx
    language-switcher.tsx
    site-header.tsx
    theme-provider.tsx
    theme-toggle.tsx
    counter.tsx
  config/
    site.ts
  i18n/
    request.ts
  lib/
    utils.ts
  messages/
    en.json
    fr.json
  styles/
    globals.css
```
