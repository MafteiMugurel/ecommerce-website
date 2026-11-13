# IT Shop – magazin online de produse IT

Aplicație web de tip **e-commerce** pentru produse IT (componente PC, periferice, audio, gaming, servere, imprimante, rețelistică, stocare), construită cu **React + TypeScript + Tailwind CSS** și bază de date **Firebase (Cloud Firestore + Firebase Authentication)**.

Proiectul a pornit ca exercițiu pentru profilul **informatică economică**: un magazin complet, cu catalog, coș, comenzi, conturi de utilizator, recenzii, favorite și un **panou de administrare cu statistici de vânzări**.

---

## Cuprins

1. [Ce poate face aplicația](#1-ce-poate-face-aplicația)
2. [Tehnologii folosite și de ce](#2-tehnologii-folosite-și-de-ce)
3. [Pornire rapidă](#3-pornire-rapidă)
4. [Configurarea Firebase de la zero](#4-configurarea-firebase-de-la-zero)
5. [Scripturile proiectului](#5-scripturile-proiectului)
6. [Paginile aplicației (rute)](#6-paginile-aplicației-rute)
7. [Arhitectura și structura folderelor](#7-arhitectura-și-structura-folderelor)
8. [Modelul de date (Firestore)](#8-modelul-de-date-firestore)
9. [Securitate: regulile Firestore](#9-securitate-regulile-firestore)
10. [Autentificare și roluri](#10-autentificare-și-roluri)
11. [Tema dark / light](#11-tema-dark--light)
12. [Panoul de administrare](#12-panoul-de-administrare)
13. [Cum a fost construit proiectul (etapele)](#13-cum-a-fost-construit-proiectul-etapele)
14. [Decizii de design și compromisuri](#14-decizii-de-design-și-compromisuri)
15. [Limitări cunoscute și pași următori](#15-limitări-cunoscute-și-pași-următori)

---

## 1. Ce poate face aplicația

### Pentru vizitatori (fără cont)
- **Catalog de 100 de produse IT** în 8 categorii, cu imagine, brand, preț în RON, rating și stoc.
- **Meniu de categorii** într-un panou lateral care se deschide din stânga (butonul ☰).
- **Căutare** după nume, brand, categorie sau descriere – fără diferență între litere mari/mici și **fără diacritice** („casti” găsește „Căști”).
- **Pagină de produs** cu:
  - detalii, stoc („În stoc”, „Stoc limitat”, „Stoc epuizat”), alegerea cantității;
  - **specificații tehnice** complete (tabel), descriere;
  - **produse similare** (aceeași categorie, cel mai apropiat preț);
  - **recenzii**: nota medie, distribuția pe stele, lista recenziilor.
- **Coș de cumpărături** (panou lateral din dreapta): cantități, ștergere, total; nu permite depășirea stocului.
- **Plasarea comenzii** fără cont, urmată de pagina „Felicitări pentru comandă!”.
- **Favorite** (inimioara de pe produs) – salvate în browser.
- **Formular de contact** – mesajele se salvează în baza de date.
- **Tema dark / light**, cu comutator în header; la prima vizită urmează setarea sistemului.

### Pentru utilizatori autentificați
- **Creare cont / autentificare** cu email și parolă sau **cu contul Google**.
- **Favoritele se salvează în cont** (le regăsești pe orice dispozitiv); cele adăugate înainte de logare se mută automat în cont.
- **Istoricul comenzilor** („Comenzile mele”), cu statusul fiecărei comenzi și produsele din ea.
- **Scrierea de recenzii** (doar utilizatorii logați pot scrie, ca protecție anti-spam).

### Pentru administratori
- **Panou admin** cu statistici: venituri, comenzi, valoare medie, produse vândute, utilizatori, recenzii, grafice pe zile și pe categorii, top produse, stocuri reduse, mesaje de contact.
- **Schimbarea statusului comenzilor** (Plasată → În procesare → Expediată → Livrată / Anulată).

---

## 2. Tehnologii folosite și de ce

| Tehnologie | Versiune | Rol în proiect |
|---|---|---|
| [React](https://react.dev) | 19 | Biblioteca de interfață (componente, stare). |
| [TypeScript](https://www.typescriptlang.org) | 7 | Tipuri statice: erorile se văd la compilare, nu la utilizare. |
| [Vite](https://vite.dev) | 8 | Server de dezvoltare rapid și build de producție. |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Stilizare prin clase utilitare direct în JSX. |
| [React Router](https://reactrouter.com) | 8 | Navigarea între pagini (URL-uri reale: `/produs/p001`, `/cautare?q=...`). |
| [Firebase](https://firebase.google.com) | 13 | **Cloud Firestore** (bază de date NoSQL) + **Authentication** (conturi) + Analytics. |
| [oxlint](https://oxc.rs) | 1.x | Linter rapid (inclusiv regulile pentru React Hooks). |

**De ce Firestore (NoSQL)?** Datele unui magazin se potrivesc natural pe *documente*: un produs își poartă toate atributele (inclusiv o listă de specificații variabilă de la o categorie la alta), o comandă își poartă lista de produse. Nu e nevoie de server propriu: browserul vorbește direct cu Firestore, iar **regulile de securitate** decid cine ce poate citi/scrie.

---

## 3. Pornire rapidă

### Cerințe
- **Node.js 20+** (proiectul a fost dezvoltat cu Node 26) – include `npm`.
- **Git**.

### Pași
```bash
git clone https://github.com/MafteiMugurel/ecommerce-website.git
cd ecommerce-website
npm install
npm run dev
```
Aplicația pornește la adresa afișată în terminal (de obicei http://localhost:5173).

> **Windows / PowerShell:** dacă apare eroarea *„running scripts is disabled on this system”*, folosește `npm.cmd` în loc de `npm` (ex. `npm.cmd run dev`) sau rulează o singură dată
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

Proiectul vine deja configurat pentru proiectul Firebase `ecommerce-website-c66da` (fișierul `.env`). Ca să folosești **propriul** proiect Firebase, urmează secțiunea următoare.

### Build de producție
```bash
npm run build     # verifică tipurile (tsc) și generează folderul dist/
npm run preview   # servește local build-ul de producție
```

---

## 4. Configurarea Firebase de la zero

Pașii de mai jos refac întreaga bază de date într-un proiect Firebase nou.

### 4.1. Proiectul și aplicația web
1. Intră pe [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. În proiect: **Project settings → Your apps → Web (`</>`)** → înregistrează aplicația.
3. Copiază valorile din `firebaseConfig` în fișierul **`.env`** din rădăcina proiectului:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```
   > Aceste valori **nu sunt secrete** – ajung oricum în codul trimis browserului. Securitatea vine din **regulile Firestore** (secțiunea 9). De aceea `.env` este inclus în repository.

### 4.2. Autentificarea
**Build → Authentication → Get started → Sign-in method** și activează:
- **Email/Password**;
- **Google** (alege un email de suport și salvează).

Pentru publicarea site-ului pe un domeniu propriu, adaugă domeniul în **Authentication → Settings → Authorized domains** (`localhost` e autorizat implicit).

### 4.3. Baza de date
**Build → Firestore Database → Create database** (mod *production*, orice locație).

### 4.4. Importul catalogului (categorii, produse, recenzii)
Regulile finale **nu permit** scrierea în catalog din aplicație, deci importul se face cu reguli temporare:
1. **Firestore → Rules**: lipește conținutul din [`firestore.seed.rules`](firestore.seed.rules) → **Publish**.
2. Rulează:
   ```bash
   npm run seed
   ```
   Rezultat așteptat: `categories: 8`, `products: 100`, `reviews: 390`.
3. **Imediat după**, publică regulile finale din [`firestore.rules`](firestore.rules) (șterge tot din editor și lipește fișierul întreg).

> Scriptul e idempotent: documentele au id-uri fixe (`p001`, `componente-pc`, `r0001`…), deci o rulare repetată nu creează duplicate.

### 4.5. Utilizator de test
```bash
npm run create-user -- test@exemplu.ro ParolaTa123 "Utilizator Test"
```
Creează contul în Authentication și profilul în colecția `users`. Emailul și parola se dau la rulare, deci nu ajung în cod.

### 4.6. Administrator
Rolul de admin **nu se poate acorda din aplicație** (intenționat). Pentru a face un cont admin:
1. **Authentication → Users** → copiază **User UID** al contului.
2. **Firestore → Data → Start collection** → Collection ID `admins` → Document ID = UID-ul copiat → un câmp oarecare (ex. `role` = `admin`) → **Save**.
3. Reîncarcă aplicația: în meniul contului apare **„Panou admin”**.

### 4.7. Date demo pentru prezentare (opțional)
Ca dashboard-ul și istoricul de comenzi să aibă conținut:
```bash
npm run seed-demo -- <email-admin> <parolă-admin> <email-test> <parolă-test>
```
Scriptul:
- adaugă 6 produse la **favoritele** utilizatorului de test;
- creează **6 comenzi** în istoricul lui (statusuri diferite);
- creează **peste 100 de comenzi de la vizitatori** distribuite pe ultimele 90 de zile.

> Contul de admin folosit aici trebuie să se logheze cu email + parolă și să **nu** aibă autentificare în doi pași (MFA).

---

## 5. Scripturile proiectului

| Comandă | Ce face |
|---|---|
| `npm run dev` | Pornește serverul de dezvoltare (reîncărcare automată la salvare). |
| `npm run build` | Verifică tipurile TypeScript și construiește versiunea de producție în `dist/`. |
| `npm run preview` | Servește local build-ul din `dist/`. |
| `npm run lint` | Verifică codul cu oxlint. |
| `npm run seed` | Importă catalogul din `scripts/data/db.json` în Firestore (vezi 4.4). |
| `npm run create-user -- <email> <parolă> "<nume>"` | Creează un utilizator + profil (vezi 4.5). |
| `npm run seed-demo -- <admin> <parolă> <test> <parolă>` | Generează favorite și comenzi demo (vezi 4.7). |

Scripturile din `scripts/` sunt programe Node.js care folosesc **același SDK Firebase** ca aplicația și citesc configurația din `.env`.

---

## 6. Paginile aplicației (rute)

| Adresă | Pagină | Acces |
|---|---|---|
| `/` | Toate produsele | public |
| `/categorie/:categoryId` | Produsele unei categorii (ex. `/categorie/servere`) | public |
| `/produs/:productId` | Pagina unui produs (ex. `/produs/p001`) | public |
| `/cautare?q=...` | Rezultatele căutării | public |
| `/favorite` | Produsele favorite | public (în cont dacă ești logat) |
| `/contact` | Date de contact + formular | public |
| `/autentificare` | Intră în cont (email/parolă sau Google) | public |
| `/cont-nou` | Creează cont | public |
| `/comanda-finalizata` | Confirmarea comenzii | doar imediat după o comandă |
| `/comenzile-mele` | Istoricul comenzilor | **utilizator logat** |
| `/admin` | Panoul de administrare | **doar admin** |

Paginile protejate folosesc componenta `RequireAuth`: fără cont, utilizatorul e trimis la autentificare și apoi **adus înapoi** pe pagina cerută.

---

## 7. Arhitectura și structura folderelor

### Principiul: straturi separate
```
Pagini / componente (UI)
        │  folosesc
        ▼
Context-uri și hook-uri (stare globală: coș, favorite, cont, temă)
        │  apelează
        ▼
Servicii (src/services/*) ── singurul loc care vorbește cu Firebase
        │
        ▼
Firebase (Firestore + Authentication)
```
**De ce contează:** în prima versiune datele veneau dintr-un fișier JSON (mock-up). Trecerea la Firebase a însemnat rescrierea **doar a serviciilor** – paginile și componentele au rămas aproape neschimbate. La fel, o eventuală schimbare a bazei de date ar afecta doar `src/services/`.

### Structura
```
ecommerce-website/
├── .env                      # configurația Firebase (publică)
├── firestore.rules           # regulile de securitate FINALE
├── firestore.seed.rules      # reguli TEMPORARE, doar pentru import
├── index.html                # include scriptul care aplică tema înainte de afișare
├── public/images/categories/ # imaginile (SVG) pentru fiecare categorie
├── scripts/
│   ├── data/db.json          # datele inițiale: 8 categorii, 100 produse, 390 recenzii
│   ├── seed.mjs              # import catalog în Firestore
│   ├── create-user.mjs       # creare utilizator + profil
│   └── seed-demo.mjs         # favorite + comenzi demo
└── src/
    ├── main.tsx              # punctul de intrare React
    ├── App.tsx               # provider-ele globale + definirea rutelor
    ├── index.css             # Tailwind + tema (culori light/dark)
    ├── lib/firebase.ts       # inițializarea Firebase (app, db, auth, analytics)
    ├── types/                # tipurile de date: Product, Category, Review, Order, User, CartItem
    ├── services/             # accesul la date (Firestore/Auth)
    │   ├── productService.ts     # catalog (cu cache în memorie)
    │   ├── categoryService.ts    # categorii (cu cache)
    │   ├── reviewService.ts      # citire/scriere recenzii
    │   ├── orderService.ts       # plasare comandă, istoric, toate comenzile, schimbare status
    │   ├── favoritesService.ts   # favoritele din contul utilizatorului
    │   ├── messageService.ts     # mesaje de contact
    │   ├── authService.ts        # creare cont, login (email/Google), logout, mesaje de eroare
    │   └── adminService.ts       # verificare rol admin, numărători, mesaje
    ├── context/              # starea globală (React Context)
    │   ├── AuthProvider.tsx      # utilizatorul curent + rolul de admin
    │   ├── CartProvider.tsx      # coșul (useReducer + localStorage)
    │   ├── FavoritesProvider.tsx # favorite: browser (vizitator) sau Firestore (cont)
    │   └── ThemeProvider.tsx     # tema dark/light
    ├── hooks/                # useProducts, useCategories
    ├── utils/                # formatare preț/dată/număr, căutare fără diacritice
    ├── components/           # componente reutilizabile (header, card produs, coș, meniu, stele...)
    │   └── admin/                # componentele dashboard-ului (StatTile, ColumnChart, BarList, ChartCard)
    └── pages/                # câte un fișier pentru fiecare pagină din tabelul de rute
```

### Fluxuri importante
- **Coșul** e gestionat cu `useReducer` (acțiuni `add`, `remove`, `setQuantity`, `clear`) și salvat în `localStorage`, deci rămâne după refresh.
- **Comanda**: `CartDrawer` → `placeOrder()` scrie documentul în `orders` → coșul se golește → navigare la `/comanda-finalizata` cu datele comenzii.
- **Catalogul** se citește **o singură dată pe sesiune** (cache în `productService`), ca să nu se citească cele 100 de documente la fiecare schimbare de pagină (Firestore taxează per document citit).
- **Recenziile** se filtrează în Firestore după `productId` și se sortează în aplicație (o interogare `where` + `orderBy` pe câmpuri diferite ar cere un index compus).

---

## 8. Modelul de date (Firestore)

| Colecție | ID document | Câmpuri principale | Cine scrie |
|---|---|---|---|
| `categories` | slug (`componente-pc`) | `name`, `order` (poziția în meniu) | admin / script import |
| `products` | `p001`…`p100` | `name`, `brand`, `description`, `price`, `currency`, `category`, `imageUrl`, `stock`, `rating`, `specs[]`, `createdAt` | admin / script import |
| `reviews` | automat | `productId`, `userId`, `author`, `rating` (1–5), `comment`, `createdAt` | utilizatori logați |
| `orders` | automat | `userId` (sau `null` pentru vizitatori), `items[]`, `totalItems`, `totalPrice`, `status`, `createdAt` | oricine (status „placed”); adminul modifică |
| `messages` | automat | `name`, `email`, `subject`, `message`, `createdAt` | oricine |
| `users` | UID Firebase | `displayName`, `email`, `createdAt`, `favoriteIds[]` | proprietarul contului |
| `admins` | UID Firebase | orice câmp (ex. `role: "admin"`) | **doar din consolă** |

Detalii de proiectare:
- **`specs`** este o **listă** de perechi `{ name, value }`, nu un obiect, pentru că Firestore nu garantează ordinea cheilor dintr-un obiect, iar specificațiile trebuie afișate într-o ordine anume.
- **`items`** dintr-o comandă sunt **copii** ale produselor (nume, preț, imagine) de la momentul comenzii: dacă prețul unui produs se schimbă ulterior, comanda își păstrează prețul plătit.
- **`status`** al unei comenzi: `placed` (Plasată), `processing` (În procesare), `shipped` (Expediată), `delivered` (Livrată), `cancelled` (Anulată).
- Datele calendaristice sunt șiruri ISO 8601 (`2026-11-13T10:00:00Z`), ușor de sortat și de afișat.

---

## 9. Securitate: regulile Firestore

Aplicația nu are server propriu, deci **toată protecția datelor stă în [`firestore.rules`](firestore.rules)**. Pe scurt:

| Colecție | Citire | Scriere |
|---|---|---|
| `categories`, `products` | oricine | doar adminii |
| `reviews` | oricine | creare: doar utilizator logat, **în numele lui** (`userId` = UID-ul lui), produsul trebuie să existe, nota între 1 și 5, text limitat; ștergere: admin; modificare: nimeni |
| `orders` | adminii (toate) / clientul (doar ale lui) | creare: oricine, dar **doar cu status „placed”** și fără câmpuri în plus; modificare/ștergere: admin |
| `messages` | doar adminii | creare: oricine, cu lungimi limitate |
| `users` | proprietarul + adminii | doar proprietarul, **doar câmpurile permise** (nu își poate adăuga singur un rol) |
| `admins` | fiecare își poate citi propriul document | **nimeni** din aplicație |

Regulile au fost verificate din afara aplicației (cereri directe la API-ul Firestore), atât fără cont cât și ca utilizator obișnuit: scrierea în catalog, recenziile fără cont, listarea comenzilor altora, auto-promovarea la admin și citirea statisticilor de admin sunt toate **refuzate**.

> Important: în Firestore accesul este permis dacă **măcar o regulă** îl permite. De aceea regulile temporare de import trebuie **înlocuite complet**, nu doar completate.

---

## 10. Autentificare și roluri

- **Firebase Authentication** gestionează conturile (parolele nu ajung niciodată în baza de date a aplicației).
- Metode: **email + parolă** (minim 6 caractere) și **Google** (fereastră pop-up).
- La creare cont (oricare metodă) se creează și profilul `users/{uid}`.
- Sesiunea e păstrată de Firebase: utilizatorul rămâne logat după refresh. Până când Firebase confirmă sesiunea, header-ul nu afișează nici „logat”, nici „nelogat” (evită „clipirea”).
- Mesajele de eroare Firebase (`auth/invalid-credential`, `auth/email-already-in-use` etc.) sunt traduse în română în `authService.ts`.
- **Rolul de admin** = existența documentului `admins/{uid}`. Aplicația îl verifică la logare (`AuthProvider`), iar regulile îl verifică la fiecare cerere (`isAdmin()`), deci ascunderea butonului din interfață **nu** e singura protecție.

---

## 11. Tema dark / light

- Butonul lună/soare din header comută tema; alegerea se salvează în browser. Fără alegere salvată, se folosește tema sistemului de operare.
- Un mic script în `index.html` aplică tema **înainte** de afișarea paginii, ca să nu apară un „flash” alb în dark mode.
- **Cum e implementată:** în loc să adăugăm variante `dark:` pe fiecare clasă din fiecare componentă, în `src/index.css` **inversăm scara de gri** sub clasa `.dark` (ex. `gray-900` devine text deschis, `gray-50` devine fundal închis) și folosim o culoare semantică `surface` pentru carduri și panouri. Doar culorile de accent (roșu, verde, indigo, chihlimbar) au variante `dark:` explicite.
- Regula pentru componente noi: fundalurile de card folosesc **`bg-surface`**, nu `bg-white`.

---

## 12. Panoul de administrare

Pagina `/admin` (doar pentru admini) conține:

- **Filtru de perioadă**: 7 / 30 / 90 de zile (se aplică cifrelor și graficelor).
- **8 cifre-cheie**: venituri (fără comenzile anulate), număr de comenzi și procentul celor de la clienți cu cont, valoare medie a comenzii, bucăți vândute, utilizatori înregistrați, recenzii + nota medie, produse în catalog + câte au stoc epuizat, mesaje de contact.
- **Venituri pe zi** – grafic cu coloane, cu tooltip la trecerea mouse-ului (sau la focus cu tastatura).
- **Venituri pe categorie** – bare orizontale sortate, cu valorile scrise direct.
- Fiecare grafic are comutator **Grafic / Tabel** (alternativă accesibilă, aceleași date).
- **Top 5 produse vândute**, **comenzi pe status**, **comenzi recente cu schimbarea statusului**, **produse cu stoc redus (≤ 5)**, **ultimele mesaje de contact**.

Detalii de implementare:
- Graficele sunt făcute **fără bibliotecă externă** (HTML + Tailwind), ca să nu crească dimensiunea aplicației.
- Culoarea graficelor (`#2a78d6` în light, `#3987e5` în dark) a fost **validată automat** pentru contrast față de fundal și pentru separabilitate la daltonism; fiecare grafic are o singură serie, deci nu e nevoie de legendă (titlul o numește).
- Numărul de utilizatori și statisticile recenziilor sunt calculate **pe server** (`getCountFromServer`, `getAggregateFromServer`), fără a descărca documentele.
- Statisticile de vânzări se calculează în browser din colecția `orders` – potrivit pentru volumul actual (sute de comenzi).

---

## 13. Cum a fost construit proiectul (etapele)

Proiectul a fost dezvoltat incremental, fiecare etapă adăugând o funcționalitate:

1. **Structura inițială** – proiect Vite (React + TypeScript), Tailwind CSS, datele într-un fișier JSON organizat ca viitoarele colecții Firestore, pagina cu lista de produse.
2. **Coșul de cumpărături** – context React cu `useReducer`, panou lateral, limitare la stoc, salvare în `localStorage`.
3. **Finalizarea comenzii** – introducerea React Router și a paginii „Felicitări pentru comandă!”.
4. **Catalog IT** – înlocuirea produselor generice cu produse IT reale (branduri, prețuri în RON) și imagini SVG desenate pentru fiecare categorie (serviciile externe de imagini nu dădeau poze relevante sau nu funcționau).
5. **Meniul pe categorii + Contact** – colecția `categories`, rute `/categorie/:id`, pagina de contact. Meniul a devenit ulterior un panou care se deschide din stânga.
6. **Căutare, favorite, 100 de produse** – căutare fără diacritice, favorite, extinderea catalogului la 100 de produse (12–13 pe categorie).
7. **Pagina de produs** – produse similare și secțiunea de recenzii (390 de recenzii de test generate determinist).
8. **Specificații tehnice** – 5–9 specificații reale pentru fiecare produs, plus garanția.
9. **Publicare pe GitHub.**
10. **Tema dark/light și conturi** – întâi conturi simulate (mock), cu parolele transformate cu SHA-256 și salt.
11. **Conectarea la Firebase** – serviciile rescrise pentru Firestore și Firebase Authentication, script de import, regulile de securitate, mutarea datelor JSON din aplicație în `scripts/`.
12. **Utilizator de test, favorite în cont, istoric comenzi, rol de admin și dashboard** – plus scriptul de date demo.
13. **Logarea cu Google.**

---

## 14. Decizii de design și compromisuri

- **Servicii ca strat separat** – a permis trecerea de la JSON la Firebase fără a rescrie interfața.
- **Configurația Firebase în `.env` inclus în repository** – valorile sunt publice prin natura lor; oricine clonează proiectul îl poate rula imediat. Protecția e în reguli.
- **Comenzi permise și fără cont** – reduce fricțiunea la cumpărare; regulile limitează ce poate scrie un vizitator (doar comenzi noi cu status „placed”).
- **Recenzii doar cu cont** – protecție minimă anti-spam, fiecare recenzie e legată de un `userId`.
- **Admin prin colecția `admins`, nu prin câmp în profil** – utilizatorul își poate modifica propriul profil, deci un câmp `role` acolo ar fi permis auto-promovarea.
- **Cache pentru catalog** – mai puține citiri Firestore (cost) și navigare mai rapidă.
- **Imagini SVG per categorie** – fără dependență de servicii externe; toate produsele dintr-o categorie au aceeași imagine.
- **Grafice fără bibliotecă** – mai puțin cod descărcat; suficient pentru două tipuri de grafic.

---

## 15. Limitări cunoscute și pași următori

**Limitări actuale**
- **Stocul nu scade** când se plasează o comandă (ar necesita o tranzacție Firestore sau o funcție pe server – Cloud Functions).
- **Prețul și totalul comenzii sunt calculate în browser**; regulile verifică forma comenzii, dar nu recalculează totalul. Într-un magazin real, comanda ar trebui validată pe server.
- **Coșul** rămâne în browser (nu e sincronizat cu contul).
- Rating-ul afișat pe cardul produsului este câmpul `rating` din catalog, iar media din secțiunea de recenzii se calculează din recenzii – pot diferi ușor.
- Specificațiile și prețurile sunt orientative (după valori cunoscute ale modelelor), nu verificate individual cu producătorii.
- Imaginile sunt ilustrații pe categorie, nu fotografii reale ale produselor.
- Pachetul JavaScript are ~900 KB (din cauza SDK-ului Firebase); se poate reduce prin încărcare la cerere (code splitting).
- Autentificarea în doi pași (MFA) nu e suportată în interfață.

**Idei pentru continuare**
- Administrarea produselor din panoul admin (adăugare / editare / ștergere, încărcare imagini în Firebase Storage).
- Scăderea stocului la comandă, cu Cloud Functions.
- Coș sincronizat cu contul; adrese de livrare; plată (ex. Stripe).
- Sortare și paginare în lista de produse; filtre după preț și brand.
- Teste automate (unitare pentru reducer-ul coșului și căutare; teste pentru regulile Firestore cu emulatorul Firebase).
- Publicarea site-ului (ex. Firebase Hosting).
