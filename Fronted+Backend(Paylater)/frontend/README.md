# PayLater Frontend

React + TypeScript + Vite application for the PayLater microservices platform.

## Development

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to the API Gateway at `http://localhost:9090`.

## Scripts

- `npm run dev` — start development server
- `npm run build` — typecheck and production build
- `npm run typecheck` — TypeScript project references check
- `npm run preview` — preview production build

## Environment

Copy `.env.example` to `.env`. See `.env.example` for `VITE_API_BASE_URL`.

Never put `INTERNAL_SERVICE_TOKEN` or other secrets in frontend env files.
