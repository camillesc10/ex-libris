# Marque-page

> Ta bibliothèque, tes pépites, et les ami·es qui lisent avec toi.

Application web de gestion de bibliothèque personnelle et club de lecture.
Design original réalisé avec Claude Design — stack production : **Next.js 15 · TypeScript · Tailwind CSS v4 · Zustand**.

---

## Démarrage rapide

```bash
npm install
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).
Compte démo : n'importe quel e-mail valide + 4 caractères minimum pour le mot de passe.

---

## Fonctionnalités

- **Mon étagère** — bibliothèque avec étagères par état (En cours / PAL / Déjà lu), filtres par genre et niveau de piment
- **Fiche livre** — piment 🌶 (0–5), note ★ (0–5), genre, tropes, listes, commentaire, plateformes de lecture
- **Ajouter un livre** — recherche via Google Books API avec fallback Open Library
- **Mes listes** — listes prédéfinies (PAL, En cours, Déjà lu, Pépites 2024) et listes personnalisées
- **Messages** — messagerie avec partage de livres entre ami·es
- **Lecture partagée** — notes scellées page par page (anti-spoiler), deux flows : fil chronologique et jalons de chapitre
- **3 thèmes** — Lavande (défaut), Camomille, Sauge
- **PWA-ready** — manifest, meta viewport-fit=cover, tab bar mobile

---

## Stack backend suggérée (production)

| Besoin | Solution |
|--------|----------|
| Auth + base de données | [Supabase](https://supabase.com) |
| Stockage des couvertures | Supabase Storage |
| API livres | Google Books API (clé recommandée en prod) |
| Déploiement | Vercel |

### Variables d'environnement à ajouter

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=    # optionnel, augmente les quotas
```

### Schéma de base de données (Supabase)

```sql
-- Utilisateurs (géré par Supabase Auth)
-- books
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  author text,
  year text,
  genre text default 'Romance',
  lang text default 'FR',
  spice int2 default 0 check (spice between 0 and 5),
  rating int2 default 0 check (rating between 0 and 5),
  pages int4 default 0,
  tropes text[] default '{}',
  lists text[] default '{}',
  resume text default '',
  comment text default '',
  bg text,
  ink text,
  platforms jsonb default '[]',
  created_at timestamptz default now()
);

-- Conversations & messages
create table conversations (
  id uuid primary key default gen_random_uuid(),
  participants uuid[] not null,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id),
  text text,
  book_id uuid references books(id),
  sent_at timestamptz default now()
);

-- Lecture partagée
create table shared_reads (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id),
  participants uuid[] not null,
  flow text default 'fil',
  created_at timestamptz default now()
);

-- Notes scellées (déverrouillage côté serveur obligatoire)
create table page_notes (
  id uuid primary key default gen_random_uuid(),
  shared_read_id uuid references shared_reads(id) on delete cascade,
  author_id uuid references auth.users(id),
  page int4 not null,
  text text not null,
  created_at timestamptz default now()
  -- Pas de colonne "visible" : le serveur filtre selon la progression du lecteur
);

-- Progression par participant
create table read_progress (
  shared_read_id uuid references shared_reads(id) on delete cascade,
  user_id uuid references auth.users(id),
  page int4 default 0,
  primary key (shared_read_id, user_id)
);
```

> ⚠️ Le déverrouillage des notes scellées doit être appliqué **côté serveur** via une Row Level Security policy ou une Edge Function — ne jamais retourner au client les notes dont la page dépasse sa progression déclarée.

---

## Structure du projet

```
src/
├── app/
│   ├── globals.css          # tokens CSS des 3 thèmes
│   ├── layout.tsx           # polices Newsreader + Karla, PWA meta
│   └── page.tsx             # point d'entrée (auth ↔ app)
├── components/
│   ├── AuthPage.tsx          # page de connexion / inscription
│   ├── AppShell.tsx          # shell (sidebar + header + contenu)
│   ├── Sidebar.tsx           # navigation desktop
│   ├── Header.tsx            # header sticky + barre de recherche
│   ├── BottomNav.tsx         # tab bar mobile
│   ├── BookCover.tsx         # couverture typographique (réutilisable)
│   ├── BookSheet.tsx         # panneau de fiche (overlay)
│   ├── Toast.tsx             # toast de notification
│   ├── InstallBanner.tsx     # bandeau PWA mobile
│   └── screens/
│       ├── ShelfScreen.tsx   # étagère + filtres
│       ├── SearchScreen.tsx  # recherche API livres
│       ├── ListsScreen.tsx   # gestion des listes
│       ├── MessagesScreen.tsx # messagerie
│       └── SyncScreen.tsx    # lecture partagée (fil + jalons)
├── store/
│   ├── index.ts              # store Zustand (état global)
│   └── data.ts               # données de démo + constantes
└── types/
    └── index.ts              # types TypeScript
```

---

## Créer le repo GitHub

```bash
cd marque-page
git init
git add .
git commit -m "feat: initial marque-page project"
gh repo create marque-page --public --push --source=.
# ou manuellement sur github.com puis :
git remote add origin https://github.com/<toi>/marque-page.git
git push -u origin main
```
