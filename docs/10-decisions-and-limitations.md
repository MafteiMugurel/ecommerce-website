# 10 – Decisions and limitations

## Decisions (and why)

| Decision | Reason | Trade-off |
|---|---|---|
| **Firebase instead of a custom server** | no server to maintain, free tier, ready-made authentication | “sensitive” logic (prices, stock) is not checked on a server |
| **Firestore (NoSQL)** | products have different specifications per category; an order carries its own list of items | complex queries (e.g. reports) run in the browser |
| **Services as a separate layer** | moving from JSON data to Firebase only changed `src/services/` | one more layer of code |
| **Public Firebase config in `.env`** | it is public in the browser anyway; anyone cloning the repo can run it | GitHub may show a false “secret” alert |
| **Admin via the `admins` collection** | users edit their own profile – a `role` field there would allow self-promotion | admins are added manually in the console |
| **Guest checkout** | less friction when buying | the address is entered every time |
| **Reviews require an account** | basic anti-spam | guests cannot post reviews |
| **Catalog cache** | fewer Firestore reads (cost) and faster navigation | another admin’s changes appear after a page reload |
| **Photos by URL (Wikimedia Commons)** | no storage cost; free licences; stable links | only 31 photos show the exact model; the rest are representative and labelled as such |
| **Translation keys checked by TypeScript** | a missing translation stops the build | every new text must be added to two files |
| **Charts without a library** | smaller app | only two chart types |
| **E2E tests that never write to the database** | do not pollute real data | actually placing an order is not tested automatically |

## Known limitations

- **Stock is not decremented** automatically when an order is placed.
- The **order total** is computed in the browser; a real store would validate it on a server.
- **Card payment is simulated** – there is no payment processor.
- **Delivery is free**; there are no shipping fees or coupons.
- The **cart** stays in the browser, not linked to the account.
- **Database content** (descriptions, specifications, reviews) is Romanian only; the interface is bilingual.
- **Products cannot be deleted** from the admin panel (only from the console).
- **Multi-factor authentication (MFA)** is not supported in the UI.
- Prices and specifications are indicative.

## Ideas for next steps

- Cloud Functions: decrement stock and validate the total when an order is placed; confirmation email.
- Real payments (e.g. Stripe), delivery fees, coupons.
- Cart synced with the account; saved addresses in the profile.
- Product deletion and CSV stock import in the admin panel.
- Sorting, pagination and filters (price, brand) on the product list.
- Translated content (per-language fields in Firestore).
- Firestore rules tests with the Firebase emulator; a CI pipeline (build + lint + tests + deploy on every push).
