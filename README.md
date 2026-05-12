# fleet-command-center-21

FleetCommand is a Vite + React single-page app for fleet operations.

## Deployment notes

This app uses React Router with browser history. Static hosts must serve
`dist/index.html` for every application route (for example `/login`,
`/dashboard`, and `/pay-order`) so the client-side router can take over.

The included `vercel.json` configures Vercel to:

- install dependencies with `pnpm install --frozen-lockfile`
- build with `pnpm build`
- publish the `dist` directory
- rewrite all route requests back to `/index.html`

If you deploy to a different static host, add the equivalent SPA fallback rule.
