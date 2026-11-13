# 01 – Overview

## What is IT Shop?

IT Shop is an **online store for IT products**: PC components, peripherals, audio, gaming, servers, printers, networking and storage. It works like any familiar online shop:

1. a visitor **browses the catalog** (100 products in 8 categories), searches, reads specifications and reviews;
2. puts products **in the cart** and **checks out** (delivery address + payment method);
3. can **create an account** (email and password, or a Google account) to see their **order history**, keep **favorites** and write **reviews**;
4. **administrators** get an **admin panel** with sales statistics and can **add/edit products and stock**.

The interface is available in **Romanian and English** and has a **light / dark theme**.

## Who uses the app?

| Role | What they can do |
|---|---|
| **Visitor** (no account) | browse, search, add to cart, place orders, save favorites in the browser, send contact messages |
| **Customer** (signed in) | everything a visitor can + favorites stored in the account, order history, reviews |
| **Administrator** | everything a customer can + statistics dashboard, order status changes, add/edit products and stock |

## What is “under the hood”, in short

- The **website** (what you see in the browser) is a **React** application written in **TypeScript** and styled with **Tailwind CSS**.
- The **data** (products, orders, reviews, accounts) lives in **Firebase**, a Google service: the database is **Cloud Firestore**, accounts are handled by **Firebase Authentication**.
- The site is **published** on **Firebase Hosting**.
- **Automated tests** with **Playwright** open a real browser and use the site like a person to check that everything works.

All of this is explained in detail in [02 – Technologies](02-technologies.md).

## Glossary

| Term | Plain explanation |
|---|---|
| **Web app / site** | a program that runs in the browser (Chrome, Edge…). |
| **Frontend** | the part the user sees (pages, buttons). Here: everything in `src/`. |
| **Backend** | the part “behind the scenes” that keeps the data. Here it is replaced by Firebase – there is no custom server. |
| **Database** | where data is stored permanently (products, orders…). |
| **Collection / document** (Firestore) | a collection is like a folder (e.g. “products”); a document is a card in that folder (e.g. one product). |
| **Field** | one piece of information in a document (e.g. `price`). |
| **Component** (React) | a reusable piece of interface (e.g. the product card). |
| **Page / route** | an address in the site (e.g. `/produs/p001`) and what is shown there. |
| **Service** (in this project) | a file that talks to the database (e.g. `orderService.ts`). |
| **Context** (React) | the app’s “shared memory”, used by several pages (e.g. the cart, the signed-in user). |
| **Authentication** | checking who you are (signing in). |
| **Authorization / role** | what you are allowed to do once signed in (e.g. admin). |
| **Security rules** | Firestore’s rules deciding who may read/write each piece of data. |
| **i18n** | short for *internationalization* – translating the interface into several languages. |
| **Build** | turning source code into the optimised files the browser loads (the `dist/` folder). |
| **Deploy** | publishing the build to the internet. |
| **E2E test** (end-to-end) | an automated test that uses the app from start to finish, like a real user. |
| **Seed** | filling the database with initial data (catalog, demo data). |
| **localStorage** | a small storage area in the browser where the site keeps the cart, theme and language. |
| **URL** | the address of a page or image on the internet. |
| **Repository (repo)** | the project folder tracked with Git and published on GitHub. |
