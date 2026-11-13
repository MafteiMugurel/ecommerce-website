# 06 – Security (Firestore rules)

## Why rules are needed

The app has no custom server: **the browser talks directly to the database**. The Firebase configuration in `.env` is public (every Firebase site sends it to the browser). So the **only protection for the data** is the **security rules** in `firestore.rules`, enforced by Google on every read and write.

**Comparison:** the database is a building whose door is in plain sight; the rules are the guard at every door, checking your badge and what you are carrying.

## What the rules allow, in plain words

| Data | Who can read | Who can write |
|---|---|---|
| **Categories** | anyone | admins only |
| **Products** | anyone | admins only – and only **valid** products: name/brand/category/description filled in, price > 0, stock a whole number ≥ 0, no unknown fields |
| **Reviews** | anyone | signed-in users only, **as themselves**, for an existing product, rating 1–5, text up to 1000 characters; delete: admins; edit: nobody |
| **Orders** | admins – all; customers – only their own | anyone can place a **new** order, only with status “placed”, a complete address and a known payment method; edit/delete: admins |
| **Contact messages** | admins only | anyone (send only, with length limits) |
| **Profiles (`users`)** | the owner + admins | the owner only, and only the fields `displayName`, `email`, `createdAt`, `favoriteIds` |
| **Admins (`admins`)** | each user can see only their own document | **nobody** from the app (console only) |

## Examples of blocked attacks

- A visitor tries to change a product’s price → **denied** (not an admin).
- A customer adds `role: "admin"` to their own profile → **denied** (field not allowed).
- A customer creates `admins/{uid}` → **denied** (nobody writes there).
- Someone places an order with status “delivered” → **denied** (only “placed”).
- A customer reads another customer’s orders → **denied**.
- An admin accidentally saves a negative stock → **denied** (product validation).

All of these were verified with direct requests to Firestore from outside the app.

## How to publish the rules

Option 1 – console: **Firestore Database → Rules** → delete all text → paste the content of `firestore.rules` → **Publish**.
Option 2 – terminal: `npm run deploy:rules` (requires `firebase login`).

> **Important:** Firestore grants access if **any** rule allows it. That is why the temporary import rules (`firestore.seed.rules`) must be **replaced completely**, not just extended.

## Known limitations

- The order total is computed in the browser; the rules check the order’s shape but do not recompute prices. A real store would validate orders on a server (e.g. Firebase Cloud Functions).
- Stock is not decremented automatically when an order is placed (would also need a server-side function).
