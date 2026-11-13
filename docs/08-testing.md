# 08 – Testing (Playwright)

## What an end-to-end (e2e) test is

An e2e test is a **scenario written once** that the computer runs by itself in a **real browser**: it opens pages, clicks buttons, fills in forms and checks what appears on screen. If something is not right, the test “fails” and says exactly where.

**Playwright** (by Microsoft) is the tool that does this. Tests run in Chromium (the engine behind Chrome/Edge), on a desktop screen and on a phone screen (Pixel 7).

## Running the tests

```bash
npm run test:e2e          # runs all tests (starts the local site automatically)
npm run test:e2e:ui       # visual mode: watch each test step by step
npm run test:e2e:report   # opens the last run’s report (with screenshots of failures)
```

First time on a new computer: `npx playwright install chromium` (downloads the test browser).

To test the **published site** instead of the local one:
```bash
E2E_BASE_URL=https://ecommerce-website-c66da.web.app npm run test:e2e
```
(PowerShell: `$env:E2E_BASE_URL="https://ecommerce-website-c66da.web.app"; npm.cmd run test:e2e`)

## What the tests cover

| File | Scenarios |
|---|---|
| `e2e/catalog.spec.ts` | product list; category filter from the menu; unknown category; diacritics-insensitive search (“casti” → “Căști”); search with no results |
| `e2e/product.spec.ts` | product page: specifications, 4 similar products, reviews; unknown product; out-of-stock product (button disabled) |
| `e2e/cart.spec.ts` | add with quantity, change, remove; cart survives a refresh; confirmation page cannot open without an order |
| `e2e/checkout.spec.ts` | delivery & payment step: field validation, payment selector, summary; checkout with an empty cart |
| `e2e/preferences.spec.ts` | guest favorites; language switch (texts + price format) and persistence; dark theme |
| `e2e/auth.spec.ts` | protected pages redirect to sign-in; sign-up validation; wrong password; sign-in + orders + sign-out (optional, see below) |
| `e2e/responsive.spec.ts` | on a phone: no horizontal scroll, search, side menu |

**What the tests deliberately do NOT do:** place orders, post reviews or create accounts – that would add fake data to the real database. They stop right before the final submit.

The tests run in Romanian (the default language), so they look for Romanian labels such as “Adaugă în coș”.

### The sign-in test (optional)
Runs only when you provide a test account through environment variables (never stored in the code):
```bash
E2E_USER_EMAIL=test@example.com E2E_USER_PASSWORD=Password123 npm run test:e2e
```

## What a test looks like

```ts
test('search ignores diacritics', async ({ page }) => {
  await page.goto('/')                                   // open the home page
  await searchInput(page).fill('casti')                  // type in the search box
  await searchInput(page).press('Enter')                 // press Enter
  await expect(page).toHaveURL(/\/cautare\?q=casti/)     // check the address
  await expect(page.getByRole('article').first())        // the first result…
    .toContainText(/căști/i)                             // …contains “Căști”
})
```

Tests find elements by **what the user sees** (role and text: “the *Add to cart* button”), not by technical details – so they keep working when the look changes.

## Adding a test
1. Create `e2e/something.spec.ts` (or add to an existing file).
2. Import `test` and `expect` from `./fixtures` – every test then starts in Romanian, with the light theme and an empty cart.
3. Run only your test: `npx playwright test e2e/something.spec.ts`.
4. To find selectors easily: `npx playwright codegen http://localhost:5173` – opens a browser that writes the test code as you click.

## Other automatic checks
- `npm run build` – type-checks the code and **checks that every text exists in both languages**.
- `npm run lint` – code quality (oxlint).
