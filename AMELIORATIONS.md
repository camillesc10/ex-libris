# Propositions d'amélioration — Ex-Libris

Format : `[ ]` proposée · `[x]` acceptée · `[-]` refusée · `[~]` en cours

---

## Proposées

| # | Statut | Idée | Détail |
|---|--------|------|--------|
| 1 | [x] | **Authentification réelle** | NextAuth v5 CredentialsProvider + table `users` Neon + bcrypt ; route `/api/register` |
| 2 | [ ] | **Couvertures réelles depuis Google Books** | Stocker l'URL thumbnail lors de l'ajout via recherche, l'afficher à la place de la cover générée |
| 3 | [ ] | **Statistiques de lecture** | Pages lues par mois, genres dominants, vitesse moyenne, streak de jours de lecture |
| 4 | [ ] | **Objectif annuel** | "50 livres en 2025" — barre de progression dans la sidebar, recap en fin d'année |
| 5 | [x] | **Scan ISBN** | `IsbnScanner.tsx` — BarcodeDetector API nativement dans Chrome/Android, overlay caméra |
| 6 | [x] | **Import Goodreads** | `GoodreadsImport.tsx` — upload CSV → parse → détection séries → import + sync Neon |
| 7 | [ ] | **Export bibliothèque** | Télécharger ses livres en CSV ou JSON (sauvegarde personnelle) |
| 8 | [x] | **Recherche dans sa bibliothèque** | Barre de recherche filtrante titre / auteur / trope dans ShelfScreen |
| 9 | [x] | **Filtre par trope** | Chips de tropes au-dessus de l'étagère, même mécanique que le filtre genre |
| 10 | [x] | **Historique de lecture** | Champs `startedAt` / `finishedAt` auto-remplis ; sélecteurs de date dans la fiche |
| 11 | [ ] | **Notes de lecture par page** | Bloc-notes libre par livre (pas seulement le commentaire global) — ancré à une page |
| 12 | [ ] | **Partage de fiche** | URL publique `/livre/[id]` pour partager une fiche avec quelqu'un sans compte |
| 13 | [ ] | **Drag & drop dans les listes** | Réordonner manuellement les livres d'une liste par glisser-déposer |
| 14 | [ ] | **Recommandations automatiques** | Suggérer des livres de la PAL selon les tropes et genres des 5 étoiles |
| 15 | [ ] | **Mode hors-ligne** | Service Worker + cache API — consulter et noter sans connexion, sync au retour |
| 16 | [ ] | **Thème "Encre sépia"** | Troisième thème — tons orangé-brun chauds pour les soirées d'automne |
| 17 | [x] | **Animation "coup de cœur"** | 6 ✦ en burst CSS depuis le centre de la card note quand la 5e étoile est cliquée |
| 18 | [ ] | **Notifications de lecture partagée** | Push notification quand une amie passe un cap de page dans le même livre |
| 19 | [x] | **Séries et sagas** | Champs `series` / `seriesNum` ; groupage par saga sur l'étagère avec label doré |
| 20 | [ ] | **Widget PWA** | Tuile écran d'accueil iOS/Android avec titre + page du livre en cours, tap → ouvre l'app |

---

## Journal des décisions

_(À compléter au fil des sessions — noter ici toute idée refusée pour ne pas la re-proposer)_

| Date | # | Décision | Raison |
|------|---|----------|--------|
| 2026-08-23 | 1, 5, 6, 8, 9, 10, 17, 19 | ✅ Acceptées et implémentées | — |
