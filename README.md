# Ex-Libris

> Ta bibliothèque personnelle, tes pépites, et les ami·es qui lisent avec toi.

Application web PWA de gestion de bibliothèque personnelle et club de lecture.

Stack : **Next.js 15 · TypeScript · Tailwind CSS v4 · Zustand · NextAuth v5 · Drizzle ORM · Neon PostgreSQL**

---

## Démarrage rapide

```bash
npm install
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

Variables d'environnement requises dans `.env.local` :

```env
DATABASE_URL=          # Neon PostgreSQL connection string
AUTH_SECRET=           # Secret NextAuth (openssl rand -base64 32)
```

---

## Fonctionnalités

### Bibliothèque
- **Mon Étagère** — bibliothèque avec 7 étagères (En cours, PAL, Déjà lu, En pause, À relire, Abandonné, Liste de souhaits), filtres par genre / piment / trope / texte, tri (note, pages, date, alpha), mode vague PAL, drag-and-drop, regroupement saga
- **Fiche livre** — piment 🌶 (0–5), note ★ (0–5), tropes, listes, commentaire, notes par page, pour/contre, citation, DNF, plateformes, 4 sources de couverture, extraction de palette
- **Ajouter** — recherche titre/auteur (Google Books + Open Library), ISBN manuel, scan caméra (BarcodeDetector), import CSV Goodreads, import surlignages Kindle
- **Mes Listes** — listes personnalisées, partage par code court, aperçu mini-couvertures

### Analyse
- **Chronologie** — lecture mois par mois, statistiques annuelles, objectif de livres
- **Auteurs** — groupement par auteur·e, note moyenne, mini-couvertures
- **Journal** — sessions de lecture quotidiennes (pages lues + note), mise à jour automatique de la progression du livre

### Social
- **Ensemble** — lecture partagée, progression comparée, notes scellées anti-spoiler déverrouillées page par page
- **Club** — propositions de lecture depuis la PAL, système de vote (≥ 3 votes = livre sélectionné)
- **Messages** — messagerie de recommandations, ajout direct à la PAL

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15.5 (App Router) |
| Langage | TypeScript |
| Style | Tailwind CSS v4 |
| État client | Zustand v5 |
| Auth | NextAuth v5 / Auth.js (JWT) |
| ORM | Drizzle ORM |
| Base de données | Neon Serverless PostgreSQL |
| PWA | Web App Manifest + icons 192/512px |
| API livres | Google Books API + Open Library (fallback) |
| Déploiement | Vercel |

---

## Schéma de base de données (Drizzle / Neon)

Deux tables principales :

```
books        — données éditoriales (titre, auteur, genre, pages, couverture…)
user_books   — données personnelles (note, piment, listes, page en cours, commentaire…)
```

Migrations dans `src/db/schema.ts`.

---

## Structure du projet

```
src/
├── app/
│   ├── api/              # Routes API (books, lists, journal, club, notes…)
│   ├── globals.css       # tokens CSS des thèmes
│   ├── layout.tsx        # polices Cinzel + DM Sans, PWA meta
│   └── page.tsx          # point d'entrée
├── components/
│   ├── AppShell.tsx      # shell (sidebar + header + contenu)
│   ├── BookSheet.tsx     # panneau fiche livre (overlay)
│   ├── BottomNav.tsx     # navigation mobile
│   ├── GoodreadsImport.tsx
│   ├── IsbnScanner.tsx   # BarcodeDetector + fallback texte
│   ├── Sidebar.tsx       # navigation desktop
│   └── screens/          # un fichier par écran
│       ├── ShelfScreen.tsx
│       ├── SearchScreen.tsx
│       ├── ListsScreen.tsx
│       ├── SyncScreen.tsx
│       ├── JournalScreen.tsx
│       ├── TimelineScreen.tsx
│       ├── AuthorsScreen.tsx
│       └── ClubScreen.tsx
├── db/
│   └── schema.ts         # schéma Drizzle
├── store/
│   ├── index.ts          # store Zustand
│   └── data.ts           # données de démo + constantes
└── types/
    └── index.ts          # types TypeScript
```
