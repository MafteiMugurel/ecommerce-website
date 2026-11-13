# CLAUDE.md – working notes for this repository

IT Shop: e-commerce SPA for IT products. React 19 + TypeScript + Vite + Tailwind CSS v4, React Router 8, i18next (ro/en), Firebase (Cloud Firestore, Authentication email/password + Google, Hosting, Analytics), Playwright e2e.
Live: https://ecommerce-website-c66da.web.app · Firebase project: `ecommerce-website-c66da` · Repo: github.com/MafteiMugurel/ecommerce-website

**Full knowledge base: [`docs/`](docs/README.md)** – architecture, database schema, security rules, feature flows, how-to recipes. Read the relevant doc before changing a feature, and update it in the same change.

## Commands

```bash
npm run dev            # local dev server (http://localhost:5173)
npm run check          # lint + build (tsc type-check incl. translation keys) – run after every change
npm run test:e2e       # Playwright suite (starts dev server itself); must stay green
npm run release        # lint → e2e → build → firebase deploy hosting + firestore rules
npm run deploy         # build + hosting only · deploy:rules – rules only · deploy:all – both, no tests
```
- On this Windows machine PowerShell blocks `npm.ps1`: use `npm.cmd` in PowerShell (bash is fine with `npm`).
- Data scripts (Node, use the same Firebase SDK + `.env`): `seed`, `create-user`, `update-images`, `seed-demo`. Those needing admin rights take the admin email/password as CLI args – **never write credentials into files**.

## Architecture rules

- Layers: `pages/` → `components/` → `context/` + `hooks/` → `services/` → Firebase. **Only `src/services/` imports Firebase** (`src/lib/firebase.ts`).
- Data shapes live in `src/types/`. A schema change must update together: the type, the service, `firestore.rules`, `scripts/data/db.json` (if seeded) and `docs/04-database.md`.
- Catalog is cached in memory (`productService`); call `invalidateProductsCache()` after writes.
- Protected routes: wrap in `<RequireAuth>` / `<RequireAuth admin>` in `src/App.tsx`.
- Admin role = existence of `admins/{uid}` (created only in the Firebase console). Never add a role field to `users`.
- Orders store item **snapshots**; orders need `shipping` + `paymentMethod` (`PAYMENT_METHODS` in `src/types/order.ts`).

## Conventions

- **i18n:** every UI string goes through `t('…')`. Add keys to **both** `src/i18n/locales/ro.ts` and `en.ts` (en is typed against ro – a missing key fails the build). Plurals: `_one/_few/_other` in ro, mirror `_few` in en. Category names are stored in Romanian; display via `useCategoryLabel()`.
- Prices/dates/numbers: use `src/utils/format.ts` (locale-aware). Store error **keys** in long-lived state, not translated text.
- **Theme:** card/panel backgrounds use `bg-surface`, never `bg-white`. Dark mode works by inverting the gray scale in `src/index.css`; accent colours need explicit `dark:` variants (e.g. `text-red-600 dark:text-red-400`).
- Charts: no chart library; colours are `--color-series-1..5` / `--color-series-other` in `src/index.css` (validated categorical palette, fixed order – do not reorder or add hues). Every chart sits in `ChartCard` (chart/table toggle).
- Product images are external URLs (Wikimedia Commons) with `imageCredit` attribution; `representative: true` when not the exact model. Always render via `<ProductImage>` (falls back to the category SVG).
- Code comments are in Romanian; README and `docs/` are in English. The user communicates in Romanian.
- Lint (oxlint) runs React Hooks rules: no `setState` synchronously in effects, no impure calls (`Date.now`) during render.

## Firestore rules

`firestore.rules` is the only data protection (config in `.env` is public by design). After editing it, publish with `npm run deploy:rules` (or the console) and verify. Firestore ORs rules – temporary `firestore.seed.rules` must be fully replaced after a seed.

## Testing

- E2E tests run in Romanian (fixture sets `language=ro`, `theme=light`, clears storage) – import `test/expect` from `e2e/fixtures.ts`.
- Tests must **not write** to the production database (no placing orders, posting reviews or creating accounts); stop before the final submit.
- Prefer role/label selectors; labels that include helper/error text need prefix regexes (e.g. `getByLabel(/^Parolă/)`).
- Optional signed-in test: `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` env vars.

## Gotchas

- In bash, avoid `node -e "…"` / `sed` with backticks or template literals – write a temporary `.mjs` file instead.
- `README.md` documents scripts, routes and the data model – keep it in sync when they change.
