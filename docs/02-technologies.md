# 02 – Technologies

For each technology: **what it is**, **a real-life comparison**, **why it was chosen** and **where to find it in the project**.

---

## Language and interface

### TypeScript
- **What it is:** the language the code is written in. It is JavaScript (the language of browsers) plus **types**: every piece of data has a declared “shape” (a price is a number, a name is text).
- **Comparison:** a form with fixed boxes – you cannot write letters in the “age” box.
- **Why:** mistakes (e.g. a misspelled field) are caught **before** publishing, at build time, not by users.
- **Where:** every `.ts` / `.tsx` file in `src/`. Data shapes are in `src/types/`.

### React
- **What it is:** the library (created by Meta) used to build the interface out of **components** – reusable pieces (header, product card, cart).
- **Comparison:** LEGO bricks – build the “product card” once and reuse it 100 times.
- **Why:** the most widely used UI library; the interface updates itself when data changes (e.g. the number on the cart icon).
- **Where:** `src/components/` (pieces), `src/pages/` (pages), `src/App.tsx` (assembly).

### Tailwind CSS
- **What it is:** the **styling** system (colours, spacing, sizes). Instead of separate style files, the look is written directly on elements with short classes, e.g. `text-lg font-bold text-indigo-600` = “large, bold, indigo text”.
- **Comparison:** style labels stuck directly on each object.
- **Why:** fast, consistent, and the final file only contains the styles actually used.
- **Where:** in the `className` attributes of components; theme colours (light/dark) in `src/index.css`.

### Vite
- **What it is:** the tool that **runs the site locally** during development (`npm run dev`) and produces the **build** for publishing (`npm run build`).
- **Comparison:** the workshop (dev) and the packaging line (build).
- **Where:** `vite.config.ts`, `index.html`.

### React Router
- **What it is:** the library that maps **addresses** in the browser bar to **pages** (e.g. `/produs/p001` → the page for product p001).
- **Where:** the list of all routes is in `src/App.tsx`.

### i18next (translations)
- **What it is:** the library for **multiple languages**. Each UI text has a “key” (e.g. `product.addToCart`) and each language has a dictionary with the translation.
- **Comparison:** a bilingual dictionary – the app looks the word up in the chosen language.
- **Where:** `src/i18n/locales/ro.ts` (Romanian) and `src/i18n/locales/en.ts` (English). See [Language and theme](features/language-and-theme.md).

---

## Firebase (the Google services behind the app)

**Firebase** is a Google platform that provides, as ready-made services, what would otherwise require your own server: a database, user accounts, hosting. The Firebase project is `ecommerce-website-c66da` and is managed from the [Firebase console](https://console.firebase.google.com).

### Cloud Firestore (the database)
- **What it is:** a **NoSQL** cloud database. Data is not stored in tables with fixed columns (like Excel) but in **collections** of **documents**. A document is a card with fields, e.g. a product: `name`, `price`, `stock`…
- **Comparison:** a filing cabinet with folders (collections) and cards (documents). A card can also hold lists (e.g. the list of specifications).
- **Why:** no server to run, scales automatically, generous free tier, and the browser can talk to it directly – protected by **security rules**.
- **Where:** full structure in [04 – Database](04-database.md); the code using it in `src/services/`; the rules in `firestore.rules`.

### Firebase Authentication (accounts)
- **What it is:** the service that manages **accounts** and **sign-in**. Passwords never reach our database – Google stores them securely.
- **Enabled methods:**
  - **Email + password** – the user creates an account with an email address and a password (at least 6 characters).
  - **Google** – the user clicks “Continue with Google”, picks a Google account, and Firebase receives Google’s confirmation of who they are (the app never sees the Google password).
- **Where:** `src/services/authService.ts`, `src/context/AuthProvider.tsx`. See [05 – Authentication and roles](05-authentication-and-roles.md).

### Firebase Hosting (publishing the site)
- **What it is:** Google’s servers that send the site’s files to anyone opening `ecommerce-website-c66da.web.app`. Includes HTTPS and a global CDN.
- **Where:** `firebase.json`, `.firebaserc`; the command `npm run deploy`. See [09 – Operations and deployment](09-operations-and-deployment.md).

### Firebase Analytics
- Anonymous visit statistics (number of visits, countries). Started in `src/lib/firebase.ts`; visible in the Firebase console.

---

## Images

### Wikimedia Commons
- **What it is:** Wikipedia’s archive of **freely licensed** images.
- **Why:** product photos are **linked by address (URL)** instead of being uploaded to paid storage (Firebase Storage). Wikimedia allows its images to be shown on other sites as long as the author and licence are credited – shown under each photo.
- See [Product images](features/product-images.md).

---

## Testing and code quality

### Playwright (end-to-end tests)
- **What it is:** a tool (by Microsoft) that **opens a real browser** and **uses the site like a person**: clicks buttons, fills in forms, checks what appears on screen.
- **Comparison:** a tester who runs the same checklist, every time, in a few seconds.
- **Why:** after any change, run the tests and find out immediately whether something broke (e.g. the cart no longer adds products).
- **Where:** tests in `e2e/`, configuration in `playwright.config.ts`. See [08 – Testing](08-testing.md).

### oxlint
- **What it is:** an automatic code “proofreader” (like a spell-checker) that flags mistakes and risky patterns. Runs with `npm run lint`.

---

## Working tools

| Tool | Role |
|---|---|
| **Node.js + npm** | Node runs JavaScript tools on your computer; **npm** installs the libraries (listed in `package.json`) and runs the project commands (`npm run …`). |
| **Git + GitHub** | Git keeps the history of every change; GitHub is where the code is published online. |
| **Firebase CLI** | the `firebase` terminal program, used to deploy and publish rules. |
| **VS Code** | the recommended code editor. |

## Libraries (from `package.json`)

| Library | Used for |
|---|---|
| `react`, `react-dom` | the interface |
| `react-router` | page navigation |
| `firebase` | Firestore, Authentication, Analytics |
| `i18next`, `react-i18next` | translations |
| `tailwindcss`, `@tailwindcss/vite` | styling |
| `vite`, `@vitejs/plugin-react` | dev server and build |
| `typescript` | type checking |
| `@playwright/test` | end-to-end tests |
| `oxlint` | code quality checks |
