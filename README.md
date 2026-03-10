# FleetCommand Logistics Dashboard

This repository powers the FleetCommand logistics operations dashboard — a premium interface for managing companies, fleets, drivers, and runway-ready placeholder modules for contracts, orders, tracking, and payments.

## Getting started

### Requirements
- Node.js 18+ (or newer with npm 9+)
- `npm` / `pnpm`

### Quick start
```sh
# Install dependencies
npm install

# Run in development mode (HMR enabled)
npm run dev

# Build for production
npm run build

# Run tests / lint (if configured)
npm run test
```

## Project layout
- `src/` — React pages, features, shared components, and UI primitives
- `public/` — favicons, the placeholder illustration, and static assets
- `vite.config.ts` — Vite config + aliases
- `package.json` — scripts and dependency declarations

## Deployment
Build with `npm run build` and deploy the `dist/` folder to any static host (Vercel, Netlify, AWS Amplify, etc.).

## Integrations
- The frontend talks to `https://fleet-management-kzif.onrender.com/api/v1/...`
- Add the API token to localStorage under `fleet_token` before hitting protected routes if needed

## Need to update metadata or assets?
- `index.html` controls the document title / OG metadata
- `public/placeholder.svg` is the default preview illustration and can be swapped with your own.
