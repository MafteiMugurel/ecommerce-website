# IT Shop – e-commerce store for IT products

A full-featured **e-commerce web application** for IT products (PC components, peripherals, audio, gaming, servers, printers, networking, storage), built with **React + TypeScript + Tailwind CSS** on top of **Firebase (Cloud Firestore + Firebase Authentication)**.

**🔗 Live demo: [ecommerce-website-c66da.web.app](https://ecommerce-website-c66da.web.app)** · **📚 Knowledge base: [`docs/`](docs/README.md)** (architecture, database, feature flows, how-to guides – written for non-developers too)

It covers the whole flow of an online store: product catalog, search, cart, checkout, user accounts (email/password and Google), favorites, reviews, order history, **dark/light theme**, **two languages (Romanian / English)** and an **admin dashboard with sales analytics**.

---

## Table of contents

1. [Features](#1-features)
2. [Tech stack and why](#2-tech-stack-and-why)
3. [Quick start](#3-quick-start)
4. [Setting up Firebase from scratch](#4-setting-up-firebase-from-scratch)
5. [npm scripts](#5-npm-scripts)
6. [Routes](#6-routes)
7. [Architecture and folder structure](#7-architecture-and-folder-structure)
8. [Data model (Firestore)](#8-data-model-firestore)
9. [Security: Firestore rules](#9-security-firestore-rules)
10. [Authentication and roles](#10-authentication-and-roles)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [Dark / light theme](#12-dark--light-theme)
13. [Admin dashboard](#13-admin-dashboard)
14. [How the project was built](#14-how-the-project-was-built)
15. [Design decisions and trade-offs](#15-design-decisions-and-trade-offs)
16. [Known limitations and next steps](#16-known-limitations-and-next-steps)
17. [Deployment (Firebase Hosting)](#17-deployment-firebase-hosting)

---

## 1. Features

### Guests (no account)
- **Catalog of 100 IT products** in 8 categories, with brand, price (RON), rating and stock.
- **Product photos loaded from external URLs** (no paid file storage): 27 products use freely licensed photos from Wikimedia Commons with author/license attribution; the rest use local category illustrations. If an external image fails to load, the category illustration is shown instead.
- **Category menu** in a slide-in panel from the left (☰ button).
- **Search** by name, brand, category or description – case-insensitive and **diacritics-insensitive** (`casti` matches `Căști`).
- **Product page** with:
  - stock status (“In stock”, “Limited stock”, “Out of stock”) and quantity picker;
  - full **technical specifications** table and description;
  - **similar products** (same category, closest price);
  - **reviews**: average rating, star distribution, review list.
- **Shopping cart** (slide-in panel from the right): quantities, removal, total; never exceeds available stock.
- **Checkout step** (`/finalizare-comanda`): delivery details (name, phone, email, county, city, address – validated) and a **payment method selector** (online card – simulated, card on delivery, cash on delivery, bank transfer); works with or without an account, followed by an order confirmation page.
- **Favorites** (heart icon) stored in the browser.
- **Contact form** – messages are stored in the database.
- **Language switcher (RO / EN)** and **dark / light theme** toggle in the header.

### Signed-in users
- **Sign up / sign in** with email and password or **with Google**.
- **Favorites stored in the account** (available on any device); favorites added as a guest are merged into the account on sign-in.
- **Order history** (“My orders”) with the status and items of every order.
- **Writing reviews** (only signed-in users can post, as basic anti-spam protection).

### Administrators
- **Admin dashboard** with revenue, orders, average order value, units sold, users, reviews, per-day and per-category charts, top products, low-stock products and contact messages.
- **Orders**: full list with search and status filter; **click an order to see its details** (customer, delivery address, payment method, products) and change its status (Placed → Processing → Shipped → Delivered / Cancelled).
- **Customer statistics** (`/admin/clienti`): registered / new / active / returning customers, conversion rate, average value and orders per customer, sign-ups per day, revenue from registered customers vs guests, customer segments by number of orders (donut charts), top customers and a searchable customer list.
- **Product management**: add and edit products (name, brand, category, price, stock, description, image URL with live preview, image attribution, specifications) and **quick inline stock editing** in the product table, with search, category and low-stock filters.

---

## 2. Tech stack and why

| Technology | Version | Role |
|---|---|---|
| [React](https://react.dev) | 19 | UI library (components, state). |
| [TypeScript](https://www.typescriptlang.org) | 7 | Static types – errors are caught at build time, not by users. |
| [Vite](https://vite.dev) | 8 | Fast dev server and production build. |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling directly in JSX. |
| [React Router](https://reactrouter.com) | 8 | Client-side routing with real URLs (`/produs/p001`, `/cautare?q=...`). |
| [Firebase](https://firebase.google.com) | 13 | **Cloud Firestore** (NoSQL database), **Authentication**, Analytics. |
| [i18next](https://www.i18next.com) + [react-i18next](https://react.i18next.com) | 27 / 18 | Translations, pluralization, language switching. |
| [oxlint](https://oxc.rs) | 1.x | Fast linter (including React Hooks rules). |

**Why Firestore (NoSQL)?** Store data maps naturally to *documents*: a product carries all of its attributes (including a list of specifications that differs from one category to another), and an order carries its own list of items. There is no custom backend: the browser talks directly to Firestore, and **security rules** decide who can read or write what.

---

## 3. Quick start

### Requirements
- **Node.js 20.19+** (developed with Node 26) – includes `npm`.
- **Git**.

### Run it
```bash
git clone https://github.com/MafteiMugurel/ecommerce-website.git
cd ecommerce-website
npm install
npm run dev
```
The app starts at the URL printed in the terminal (usually http://localhost:5173).

> **Windows / PowerShell:** if you get *“running scripts is disabled on this system”*, use `npm.cmd` instead of `npm` (e.g. `npm.cmd run dev`) or run once:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

The repository is already configured for the Firebase project `ecommerce-website-c66da` (see `.env`). To use **your own** Firebase project, follow the next section.

### Production build
```bash
npm run build     # type-checks (tsc) and builds into dist/
npm run preview   # serves the production build locally
```

---

## 4. Setting up Firebase from scratch

These steps recreate the whole backend in a new Firebase project.

### 4.1. Project and web app
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Project settings → Your apps → Web (`</>`)** → register the app.
3. Copy the `firebaseConfig` values into **`.env`** at the project root:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```
   > These values are **not secrets** – they are shipped to the browser anyway. Data is protected by the **Firestore rules** (section 9). That is why `.env` is committed.

### 4.2. Authentication
**Build → Authentication → Get started → Sign-in method** and enable:
- **Email/Password**;
- **Google** (choose a support email and save).

When deploying to your own domain, add it under **Authentication → Settings → Authorized domains** (`localhost` is authorized by default).

### 4.3. Database
**Build → Firestore Database → Create database** (production mode, any location).

### 4.4. Importing the catalog (categories, products, reviews)
The final rules **do not allow** writing to the catalog from the app, so the import uses temporary rules:
1. **Firestore → Rules**: paste the content of [`firestore.seed.rules`](firestore.seed.rules) → **Publish**.
2. Run:
   ```bash
   npm run seed
   ```
   Expected output: `categories: 8`, `products: 100`, `reviews: 390`.
3. **Immediately afterwards**, publish the final rules from [`firestore.rules`](firestore.rules) (clear the editor completely and paste the whole file).

> The script is idempotent: documents have fixed IDs (`p001`, `componente-pc`, `r0001`…), so running it again does not create duplicates.

### 4.5. Test user (optional)
```bash
npm run create-user -- test@example.com YourPassword123 "Test User"
```
Creates the account in Authentication and the profile in the `users` collection. Email and password are passed at runtime, so they never end up in the code.

### 4.6. Administrator
The admin role **cannot be granted from the app** (by design). To make an account an admin:
1. **Authentication → Users** → copy the account’s **User UID**.
2. **Firestore → Data → + Start collection** → Collection ID `admins` → **Document ID = the copied UID** (not Auto-ID) → any field (e.g. `role` = `admin`) → **Save**.
3. Sign out and sign in again: **“Admin panel”** appears in the account menu (top-right avatar), linking to `/admin`.

### 4.7. Demo data (optional)
For a presentation with a populated dashboard and order history:
```bash
npm run seed-demo -- <admin-email> <admin-password> <customers-password>
```
It creates **30 fictitious customers** (real Authentication accounts with `firstname.lastname@example.com` emails, the third argument as their password, addresses across Romanian counties, a few favorites each) and **200+ orders** over the last 90 days (~75% from those customers, the rest from guests) with delivery addresses, varied payment methods and age-based statuses. Re-running it creates no duplicates.

> The admin account used here must sign in with email + password and must **not** have multi-factor authentication enabled.

### 4.8. Product images
Images are referenced **by URL** (`imageUrl`), so no Firebase Storage bucket is needed. To push the image URLs and attributions from `scripts/data/db.json` to an existing database (without touching prices or stock):
```bash
npm run update-images -- <admin-email> <admin-password>
```
Images can also be changed one by one from the admin product form.

---

## 5. npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload. |
| `npm run build` | Type-checks with TypeScript and builds the production bundle into `dist/`. |
| `npm run preview` | Serves the `dist/` build locally. |
| `npm run lint` | Lints the code with oxlint. |
| `npm run check` | Lint + build, without publishing. |
| `npm run test:e2e` | Runs the Playwright end-to-end tests (`test:e2e:ui` for the visual runner, `test:e2e:report` for the last report). |
| `npm run release` | **Full deployment flow:** lint → e2e tests → build → deploy hosting + Firestore rules; stops at the first failure. |
| `npm run deploy:all` | Build + deploy hosting and rules, without tests. |
| `npm run seed` | Imports the catalog from `scripts/data/db.json` into Firestore (see 4.4). |
| `npm run create-user -- <email> <password> "<name>"` | Creates a user + profile (see 4.5). |
| `npm run seed-demo -- <admin> <password> <customers-password>` | Creates fictitious customers and demo orders (see 4.7). |
| `npm run deploy` | Builds and deploys the site to Firebase Hosting (see 17). |
| `npm run deploy:rules` | Deploys `firestore.rules` from the command line (alternative to pasting them in the console). |
| `npm run update-images -- <admin-email> <admin-password>` | Updates only `imageUrl` / `imageCredit` of every product from `scripts/data/db.json` (see 4.8). |

The scripts in `scripts/` are Node.js programs that use **the same Firebase SDK** as the app and read the configuration from `.env`.

---

## 6. Routes

URL paths are in Romanian (the store’s primary market); the UI follows the selected language.

| Path | Page | Access |
|---|---|---|
| `/` | All products | public |
| `/categorie/:categoryId` | Products in a category (e.g. `/categorie/servere`) | public |
| `/produs/:productId` | Product page (e.g. `/produs/p001`) | public |
| `/cautare?q=...` | Search results | public |
| `/favorite` | Favorites | public (stored in the account when signed in) |
| `/contact` | Contact details + form | public |
| `/autentificare` | Sign in (email/password or Google) | public |
| `/cont-nou` | Create account | public |
| `/comanda-finalizata` | Order confirmation | only right after checkout |
| `/comenzile-mele` | Order history | **signed-in users** |
| `/admin` | Admin dashboard | **admins only** |
| `/finalizare-comanda` | Checkout: delivery details + payment method | public (cart not empty) |
| `/admin/comenzi` | All orders, with search and status filter | **admins only** |
| `/admin/comenzi/:orderId` | Order details + status change | **admins only** |
| `/admin/clienti` | Customer statistics and customer list | **admins only** |
| `/admin/produse` | Product list with inline stock editing | **admins only** |
| `/admin/produse/nou` | Add a product | **admins only** |
| `/admin/produse/:productId` | Edit a product | **admins only** |

Protected pages are wrapped in `RequireAuth`: guests are redirected to sign-in and then **brought back** to the page they asked for.

---

## 7. Architecture and folder structure

### Layered design
```
Pages / components (UI)
        │  use
        ▼
Contexts and hooks (global state: cart, favorites, auth, theme) + i18n
        │  call
        ▼
Services (src/services/*) ── the only layer that talks to Firebase
        │
        ▼
Firebase (Firestore + Authentication)
```
**Why it matters:** the first version read data from a JSON mock. Moving to Firebase meant rewriting **only the services** – pages and components stayed almost unchanged. Replacing the database again would only touch `src/services/`.

### Structure
```
ecommerce-website/
├── .env                      # Firebase web config (public by design)
├── firebase.json             # Hosting config (SPA rewrites, cache headers) + rules path
├── .firebaserc               # default Firebase project
├── firestore.rules           # FINAL security rules
├── firestore.seed.rules      # TEMPORARY rules, only for the import
├── index.html                # includes the script that applies the theme before first paint
├── public/images/categories/ # SVG illustration for each category
├── scripts/
│   ├── data/db.json          # seed data: 8 categories, 100 products, 390 reviews
│   ├── seed.mjs              # catalog import into Firestore
│   ├── create-user.mjs       # create user + profile
│   ├── seed-demo.mjs         # demo favorites + orders
│   └── update-images.mjs     # push image URLs + attributions to Firestore
└── src/
    ├── main.tsx              # React entry point (loads i18n first)
    ├── App.tsx               # global providers + route definitions
    ├── index.css             # Tailwind + theme colors (light/dark)
    ├── lib/firebase.ts       # Firebase initialization (app, db, auth, analytics)
    ├── i18n/
    │   ├── index.ts              # i18next setup, language detection, persistence
    │   ├── locales/ro.ts         # Romanian texts (source of truth)
    │   ├── locales/en.ts         # English texts (same keys, enforced by TypeScript)
    │   ├── i18next.d.ts          # typed translation keys
    │   └── useCategoryLabel.ts   # translates category names stored in the database
    ├── types/                # data types: Product, Category, Review, Order, User, CartItem
    ├── services/             # data access (Firestore/Auth)
    │   ├── productService.ts     # catalog (in-memory cache)
    │   ├── categoryService.ts    # categories (in-memory cache)
    │   ├── reviewService.ts      # read/write reviews
    │   ├── orderService.ts       # checkout, history, all orders, status updates
    │   ├── favoritesService.ts   # favorites in the user profile
    │   ├── messageService.ts     # contact messages
    │   ├── authService.ts        # sign up, sign in (email/Google), sign out, error messages
    │   └── adminService.ts       # admin check, server-side counts, messages
    ├── context/              # global state (React Context)
    │   ├── AuthProvider.tsx      # current user + admin role
    │   ├── CartProvider.tsx      # cart (useReducer + localStorage)
    │   ├── FavoritesProvider.tsx # favorites: browser (guest) or Firestore (account)
    │   └── ThemeProvider.tsx     # dark/light theme
    ├── hooks/                # useProducts, useCategories
    ├── utils/                # locale-aware price/date/number formatting, diacritics-insensitive search
    ├── components/           # reusable UI (header, product card, cart, menu, stars, language switcher…)
    │   └── admin/                # admin components (AdminNav tabs, StatTile, ColumnChart, BarList, ChartCard)
    └── pages/                # one file per route
```

### Key flows
- **Cart**: managed with `useReducer` (`add`, `remove`, `setQuantity`, `clear`) and persisted to `localStorage`, so it survives a refresh.
- **Checkout**: `CartDrawer` → `placeOrder()` writes the `orders` document → cart is cleared → navigation to `/comanda-finalizata` with the order data.
- **Catalog** is read **once per session** (cache in `productService`) instead of re-reading 100 documents on every page change (Firestore bills per document read).
- **Reviews** are filtered by `productId` in Firestore and sorted in the app (`where` + `orderBy` on different fields would require a composite index).

---

## 8. Data model (Firestore)

| Collection | Document ID | Main fields | Written by |
|---|---|---|---|
| `categories` | slug (`componente-pc`) | `name`, `order` (menu position) | admin / import script |
| `products` | `p001`, `p002`, … | `name`, `brand`, `description`, `price`, `currency`, `category`, `imageUrl`, `imageCredit?`, `stock`, `rating`, `specs[]`, `createdAt` | admins (product form) / import script |
| `reviews` | auto | `productId`, `userId`, `author`, `rating` (1–5), `comment`, `createdAt` | signed-in users |
| `orders` | auto | `userId` (or `null` for guests), `items[]`, `totalItems`, `totalPrice`, `status`, `shipping` (name, phone, email, county, city, address), `paymentMethod`, `createdAt` | anyone (status `placed`, complete address, known payment method); admins update |
| `messages` | auto | `name`, `email`, `subject`, `message`, `createdAt` | anyone |
| `users` | Firebase UID | `displayName`, `email`, `createdAt`, `favoriteIds[]` | the account owner |
| `admins` | Firebase UID | any field (e.g. `role: "admin"`) | **Firebase console only** |

Design notes:
- **`specs`** is a **list** of `{ name, value }` pairs rather than an object, because Firestore does not guarantee key order in maps and specifications must be displayed in a specific order.
- Order **`items`** are **snapshots** of the products (name, price, image) at checkout time: if a price changes later, the order keeps the price that was paid.
- Order **`status`**: `placed`, `processing`, `shipped`, `delivered`, `cancelled`.
- **`imageCredit`** (`author`, `license`, `licenseUrl`, `sourceUrl`, `sourceName`) is stored for external images whose license requires attribution; the product page displays it under the photo.
- Dates are ISO 8601 strings (`2026-11-13T10:00:00Z`) – easy to sort and to format per locale.

---

## 9. Security: Firestore rules

There is no custom backend, so **all data protection lives in [`firestore.rules`](firestore.rules)**:

| Collection | Read | Write |
|---|---|---|
| `categories` | anyone | admins only |
| `products` | anyone | admins only, and the **whole document is validated**: known fields only, non-empty name/brand/category/description, price > 0, stock integer ≥ 0 (applies to stock-only updates too) |
| `reviews` | anyone | create: signed-in users only, **as themselves** (`userId` = their UID), product must exist, rating 1–5, bounded text length; delete: admins; update: nobody |
| `orders` | admins (all) / customers (their own only) | create: anyone, but **only with status `placed`**, a complete delivery address, a known payment method and no extra fields; update/delete: admins |
| `messages` | admins only | create: anyone, with bounded lengths |
| `users` | owner + admins | owner only, **whitelisted fields only** (users cannot add a role to themselves) |
| `admins` | each user can read their own document | **nobody** from the app |

The rules were verified from outside the app (direct requests to the Firestore REST API), both anonymously and as a regular user: writing to the catalog, posting reviews without an account, listing other people’s orders, self-promotion to admin and reading admin statistics are all **denied**.

> Note: in Firestore, access is granted if **any** rule allows it. That is why the temporary import rules must be **replaced entirely**, not merely extended.

---

## 10. Authentication and roles

- **Firebase Authentication** manages accounts (passwords never reach the app’s database).
- Methods: **email + password** (min. 6 characters) and **Google** (pop-up).
- On sign-up (either method) a profile is created in `users/{uid}`.
- The session is persisted by Firebase: users stay signed in after a refresh. Until Firebase confirms the session, the header shows neither state (no flicker).
- Firebase error codes (`auth/invalid-credential`, `auth/email-already-in-use`, …) are mapped to translated messages in `authService.ts`.
- **Admin role** = the document `admins/{uid}` exists. The app checks it on sign-in (`AuthProvider`) and the rules check it on every request (`isAdmin()`), so hiding the button is **not** the only protection.

---

## 11. Internationalization (i18n)

- Built with **i18next** + **react-i18next**; two languages: **Romanian** (default) and **English**.
- **Language switcher** (globe icon, RO / EN) in the header. The choice is saved in the browser; on the first visit the browser language is used if supported, otherwise Romanian.
- All UI texts live in [`src/i18n/locales/ro.ts`](src/i18n/locales/ro.ts) and [`en.ts`](src/i18n/locales/en.ts) – **287 keys** each, grouped by area (`header`, `product`, `cart`, `auth`, `admin`, …).
- **Type-safe keys:** `i18next.d.ts` registers the Romanian dictionary as the key schema, so `t('product.addToCrat')` (typo) **fails the build**, and `en.ts` is typed against `ro.ts`, so a missing English key is a compile error.
- **Pluralization** uses the language’s CLDR rules: Romanian has three forms (`1 produs`, `2 produse`, `20 de produse`), English two (`1 product`, `2 products`).
- **Formatting** follows the selected language via `Intl` (`ro-RO` / `en-US`): prices (`1.899,00 RON` vs `RON 1,899.00`), dates, numbers, chart labels.
- The `<html lang>` attribute is updated on every change (screen readers, browser translation).
- **Category names** are stored in Romanian in the database; `useCategoryLabel` maps them to translation keys by their stable ID.
- **Scope:** the interface is fully translated; **database content** (product descriptions, specifications, reviews) is displayed as stored (Romanian). Translating content would mean adding per-language fields in Firestore (see section 16).

---

## 12. Dark / light theme

- The moon/sun button toggles the theme; the choice is saved. Without a saved choice, the OS preference is used.
- A tiny inline script in `index.html` applies the theme **before** first paint, avoiding a white flash in dark mode.
- **Implementation:** instead of adding `dark:` variants to every class in every component, `src/index.css` **inverts the gray scale** under the `.dark` class (e.g. `gray-900` becomes light text, `gray-50` becomes a dark background) and introduces a semantic `surface` color for cards and panels. Only accent colors (red, green, indigo, amber) have explicit `dark:` variants.
- Rule for new components: card backgrounds use **`bg-surface`**, not `bg-white`.

---

## 13. Admin dashboard

`/admin` (admins only) contains:

- **Period filter**: 7 / 30 / 90 days (applies to the figures and charts).
- **8 KPIs**: revenue (excluding cancelled orders), orders and share from registered customers, average order value, units sold, registered users, reviews + average rating, products in catalog + out-of-stock count, contact messages.
- **Revenue per day** – column chart with a hover/focus tooltip.
- **Revenue by category** – sorted horizontal bars with direct value labels.
- **Orders by county** and **payment methods** – donut (pie) charts with a legend showing count and share per slice (top 5 counties + “Other counties”).
- Each chart has a **Chart / Table** toggle (accessible alternative with the same data).
- **Top 5 best-selling products**, **orders by status**, **recent orders with inline status change**, **low-stock products (≤ 5)**, **latest contact messages**.

**Product management** (`/admin/produse`, “Products” tab):
- table of all products with search (name, brand, code), category filter and a “low stock only” filter;
- **inline stock editing** per row: −/+ buttons or a typed value, then *Save* (or Enter); low and zero stock are highlighted;
- **add / edit form**: general info, image URL with live preview and attribution fields, dynamic list of specifications; client-side validation mirrors the Firestore rules;
- new products get the next free ID (`p101`, `p102`, …); the catalog cache is invalidated after every change.

Implementation details:
- Charts are built **without a charting library** (HTML + Tailwind), keeping the bundle smaller.
- The chart color (`#2a78d6` light / `#3987e5` dark) was **validated programmatically** for contrast against the actual surfaces and for color-vision-deficiency separation; each chart has a single series, so no legend is needed (the title names it).
- User counts and review statistics are computed **server-side** (`getCountFromServer`, `getAggregateFromServer`) without downloading the documents.
- Sales statistics are computed in the browser from the `orders` collection – appropriate for the current volume (hundreds of orders).

---

## 14. How the project was built

The project was developed incrementally, each step adding one capability:

1. **Initial setup** – Vite (React + TypeScript), Tailwind CSS, a JSON mock shaped like the future Firestore collections, product list page.
2. **Shopping cart** – React context with `useReducer`, slide-in panel, stock limits, `localStorage` persistence.
3. **Checkout** – React Router and the order confirmation page.
4. **IT catalog** – generic products replaced with real IT products (brands, RON prices) and hand-drawn SVG illustrations per category (external image services returned unrelated photos or were down).
5. **Category menu + Contact** – `categories` collection, `/categorie/:id` routes, contact page; the menu later became a left slide-in panel.
6. **Search, favorites, 100 products** – diacritics-insensitive search, favorites, catalog extended to 100 products (12–13 per category).
7. **Product page** – similar products and reviews (390 deterministic seed reviews).
8. **Technical specifications** – 5–9 real specs per product plus warranty (816 in total).
9. **Published to GitHub.**
10. **Dark/light theme and accounts** – first as a mock (passwords hashed with SHA-256 + salt).
11. **Firebase integration** – services rewritten for Firestore and Firebase Authentication, import script, security rules, JSON mock moved out of the app bundle into `scripts/`.
12. **Favorites in the account, order history, admin role and dashboard** – plus the demo data script.
13. **Google sign-in.**
14. **Internationalization** – Romanian / English with a header language switcher, typed keys and locale-aware formatting; README rewritten in English.
15. **External product photos** – images referenced by URL instead of paid storage; freely licensed photos picked from Wikimedia Commons (each one checked to show the exact model) with attribution, plus a fallback to the category illustration.
16. **Admin product management** – add/edit products and inline stock editing, backed by product validation in the Firestore rules.
17. **End-to-end tests** – Playwright suite (desktop + mobile) covering catalog, product page, cart, checkout, preferences and auth guards, without writing to the database.
18. **Checkout step and demo customers** – delivery address + payment method selector, validated by the rules; fictitious customers and orders for realistic statistics; dashboard charts by county and payment method.
19. **Admin order details** – order list with filters and a details page per order.
20. **Knowledge base** – `docs/` folder for non-developers; one-command release flow (`npm run release`).

---

## 15. Design decisions and trade-offs

- **Services as a separate layer** – enabled the JSON → Firebase migration without touching the UI.
- **Firebase config committed in `.env`** – the values are public by nature; anyone cloning the repo can run it immediately. Protection lives in the rules.
- **Guest checkout allowed** – less friction; the rules restrict what a guest can write (only new orders with status `placed`).
- **Reviews require an account** – minimal anti-spam; every review is tied to a `userId`.
- **Admin via an `admins` collection, not a profile field** – users can edit their own profile, so a `role` field there would allow self-promotion.
- **Catalog cache** – fewer Firestore reads (cost) and faster navigation.
- **Typed i18n keys** – translation mistakes are caught at build time, not discovered by users.
- **Long-lived error states store a translation key, not the translated text** (orders and admin pages) – the message follows a language switch even after it is shown. Short-lived form errors are translated when they occur.
- **Images by URL, not uploaded files** – no Storage cost. Photos come from Wikimedia Commons (free licenses, stable URLs, hotlinking allowed) rather than shop or manufacturer sites (copyrighted, often hotlink-protected, URLs change). Only photos showing the exact model were kept; the rest fall back to per-category SVG illustrations.
- **Charts without a library** – less code shipped; sufficient for two chart types.

---

## 16. Known limitations and next steps

**Current limitations**
- **Stock is not decremented** on checkout (would require a Firestore transaction or a server-side Cloud Function).
- **Order price and total are computed in the browser**; the rules validate the order’s shape but do not recompute the total. A real store should validate orders server-side.
- The **cart** stays in the browser (not synced with the account).
- **Database content is Romanian only** (product descriptions, specifications, reviews); the UI is bilingual.
- The rating on the product card is the catalog’s `rating` field, while the reviews section computes the average from reviews – they may differ slightly.
- Specifications and prices are indicative (based on known model values), not individually verified with manufacturers.
- Only 27 of 100 products have a real photo (freely licensed photos of the exact model are not available for all products); the rest show the category illustration. External images depend on the source site staying online (a local fallback is shown otherwise).
- Products cannot be deleted from the admin UI yet (only created and edited).
- The JavaScript bundle is ~1 MB (~300 KB gzipped), mostly the Firebase SDK; it can be reduced with code splitting.
- Multi-factor authentication (MFA) is not supported in the UI.

**Ideas for next steps**
- Product deletion and bulk stock import (CSV) in the admin panel.
- Stock decrement on checkout via Cloud Functions.
- Translated product content (per-language fields in Firestore).
- Cart synced with the account; shipping addresses; payments (e.g. Stripe).
- Sorting, pagination and filters (price, brand) on the product list.
- Automated tests (unit tests for the cart reducer and search; Firestore rules tests with the Firebase emulator).
- Route-level code splitting and a CI pipeline (build + lint + deploy on push).

---

## 17. Deployment (Firebase Hosting)

The app is a static single-page application hosted on **Firebase Hosting** (free tier, CDN, HTTPS):
**https://ecommerce-website-c66da.web.app**

### One-time setup
```bash
npm install -g firebase-tools   # Firebase CLI
firebase login                  # opens the browser to sign in with the Google account that owns the project
```
The project is already linked in `.firebaserc` (`ecommerce-website-c66da`).

### Deploy
```bash
npm run release         # recommended: lint → e2e tests → build → hosting + rules (stops at the first failure)
npm run deploy          # build + hosting only
npm run deploy:rules    # Firestore rules only
```
The full flow, with a diagram and troubleshooting, is in [docs/09-operations-and-deployment.md](docs/09-operations-and-deployment.md#deployment-flow).

### Configuration ([`firebase.json`](firebase.json))
- **`public: dist`** – the Vite production build is what gets uploaded.
- **Rewrite `** → /index.html`** – every URL is served by the React app, so deep links such as `/produs/p001` or `/admin/produse` work on refresh instead of returning 404.
- **Cache headers** – files in `/assets/` have content hashes in their names, so they are cached for a year (`immutable`); `index.html` is never cached, so a new deploy is picked up immediately.
- `*.web.app` and `*.firebaseapp.com` are authorized domains by default, so **Google sign-in works** on the live site without extra setup. A custom domain must be added under *Authentication → Settings → Authorized domains*.
