# 07 – How to change things

Step-by-step recipes. For each: **what** to change, **where**, and **how to check**.

Legend: 🟢 no code (console or admin panel) · 🟡 a simple edit in one file · 🔴 needs programming knowledge

> After any code change: check locally with `npm run dev`, run `npm run build` (catches mistakes) and `npm run test:e2e`, then publish with `npm run deploy`.

---

## Products and stock

### 🟢 Change a product’s stock
1. Sign in with an admin account → account menu → **Admin panel** → **Products** tab.
2. Find the product (search or the “Low stock only” filter).
3. Change the stock with **−/+** or type the number → **Save** (or press Enter).

### 🟢 Change the price, description, photo or specifications
Admin panel → **Products** → **Edit** on the product → change → **Save product**.

### 🟢 Add a new product
Admin panel → **Products** → **+ Add product** → fill in (category, price > 0 and stock are required) → **Save product**. It automatically gets the next code (e.g. `p101`).

### 🟢 Change a product photo
In the edit form, **Image URL**: paste the direct address of an image (ideally from [Wikimedia Commons](https://commons.wikimedia.org): open the image → “Use this file” → direct link). Fill in the **attribution** (author, licence, source page). Tick “Illustrative image” if the photo does not show the exact model. The preview updates immediately.

### 🟢 Delete a product
Not from the panel yet. From the console: **Firestore → Data → products → the document → ⋮ → Delete document**.

---

## Orders

### 🟢 See every detail of an order
Admin panel → **Orders** tab → click the order (search by number, name, city or email, or filter by status). The page shows the customer, delivery address, payment method and every product. See [Admin orders](features/admin-orders.md).

### 🟢 Change an order’s status
On the order’s details page → **Order status** dropdown (saved immediately). Also available in the dashboard’s **Recent orders** table.

---

## Users and administrators

### Make someone an administrator
🟢
1. Firebase console → **Authentication → Users** → copy the person’s **User UID**.
2. **Firestore Database → Data** → the `admins` collection (if it does not exist: **+ Start collection** → ID `admins`).
3. **Add document** → **Document ID** = the copied UID (not “Auto-ID”) → field `role` (string) = `admin` → **Save**.
4. The person signs out and back in → **Admin panel** appears.

### 🟢 Remove the admin role
Delete the `admins/{UID}` document in the console.

### 🟢 Disable or delete an account
Console → **Authentication → Users** → ⋮ on the user → **Disable account** / **Delete account**. (The profile in `users` is deleted separately, from Firestore.)

---

## Texts and translations

### 🟡 Change a UI text (e.g. “Add to cart”)
1. Open `src/i18n/locales/en.ts` (English) – and `ro.ts` for Romanian.
2. Find the text (Ctrl+F), e.g. `addToCart: 'Add to cart'`.
3. Change **only the text between the quotes**, not the key on the left.
4. Keep placeholders such as `{{count}}` or `{{name}}` – that is where the app inserts a number or a name.

### 🟡 Add a new text
Add the same key to **both** files (`ro.ts` and `en.ts`). If it is missing from `en.ts`, `npm run build` fails – on purpose, so translations are never forgotten.

### 🟡 Change the contact details (address, phone, opening hours)
`src/i18n/locales/ro.ts` and `en.ts` → the `contact` section (`addressValue`, `hoursValue`). Phone and email are in `src/pages/ContactPage.tsx` (search for `0700 000 000` and `contact@itshop.example`).

### 🟡 Change the store name (“IT Shop”)
`src/components/Header.tsx` (logo) and `index.html` (`<title>`).

---

## Categories

### 🟢🟡 Add a new category
1. 🟢 Console → `categories` → **Add document**: ID = slug without diacritics (e.g. `laptopuri`), fields `name` (string, e.g. `Laptopuri`) and `order` (number, e.g. `9`).
2. 🟡 Translate the name: add it to `src/i18n/locales/ro.ts` and `en.ts`, `categories` section, e.g. `laptopuri: 'Laptopuri'` / `laptopuri: 'Laptops'`. (Without this step the category shows its database name in both languages.)
3. 🟡 Optional fallback illustration: an SVG file in `public/images/categories/` and one line in `src/utils/productImage.ts`.

### 🟢 Change the menu order
Change the categories’ `order` field in the console.

---

## Look and feel

### 🟡 Change the main colour (indigo)
The colour appears as `indigo-600` / `indigo-700` in components. For a global change, find-and-replace in `src/` (e.g. `indigo` → `emerald`), then check both themes.

### 🟡 Change the dark theme colours
`src/index.css` → the `.dark { … }` block (gray shades and `--color-surface`).

### 🟡 Change the dashboard chart colours
`src/index.css` → `--color-series-1` (bar charts) and `--color-series-1…5`, `--color-series-other` (donut charts), in the light block and inside `.dark`. Keep the order: it was chosen so neighbouring slices stay distinguishable for colour-blind readers.

---

## Delivery and payment

### 🟡 Add / remove a payment method
1. `src/types/order.ts` → the `PAYMENT_METHODS` list.
2. Texts: `src/i18n/locales/ro.ts` and `en.ts` → the `payment` section (the name and its `…Hint`).
3. `firestore.rules` → the list in the orders rule (`paymentMethod in [...]`), then publish the rules.

### 🟡 County list
`src/data/romania.ts`.

---

## 🔴 Changes that need programming
- new features (e.g. discount coupons, delivery fees) – see [03 – Architecture](03-architecture.md) for where each layer goes;
- changing the database structure – update together: `src/types/`, the matching service in `src/services/`, `firestore.rules` and [04 – Database](04-database.md).
