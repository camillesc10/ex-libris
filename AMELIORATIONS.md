# Propositions d'amélioration — Ex-Libris

Format : `[ ]` proposée · `[x]` acceptée · `[-]` refusée · `[~]` en cours

---

## Proposées

| # | Statut | Idée | Détail |
|---|--------|------|--------|
| 1 | [ ] | **Authentification réelle** | NextAuth.js (Google + magic link email) — remplace le faux login actuel, permet plusieurs utilisateurs |
| 2 | [ ] | **Couvertures réelles depuis Google Books** | Stocker l'URL thumbnail lors de l'ajout via recherche, l'afficher à la place de la cover générée |
| 3 | [ ] | **Statistiques de lecture** | Pages lues par mois, genres dominants, vitesse moyenne, streak de jours de lecture |
| 4 | [ ] | **Objectif annuel** | "50 livres en 2025" — barre de progression dans la sidebar, recap en fin d'année |
| 5 | [ ] | **Scan ISBN** | Ajouter un livre en scannant le code-barres via la caméra (API `BarcodeDetector` ou ZXing) |
| 6 | [ ] | **Import Goodreads** | Importer sa bibliothèque via le CSV export Goodreads — mapper statuts et notes |
| 7 | [ ] | **Export bibliothèque** | Télécharger ses livres en CSV ou JSON (sauvegarde personnelle) |
| 8 | [ ] | **Recherche dans sa bibliothèque** | Barre de recherche filtrante par titre / auteur / trope dans l'onglet Étagère |
| 9 | [ ] | **Filtre par trope** | Filtrer l'étagère par trope, comme on filtre déjà par genre et piment |
| 10 | [ ] | **Historique de lecture** | Date de début et date de fin par livre, affichées sur la fiche et dans les stats |
| 11 | [ ] | **Notes de lecture par page** | Bloc-notes libre par livre (pas seulement le commentaire global) — ancré à une page |
| 12 | [ ] | **Partage de fiche** | URL publique `/livre/[id]` pour partager une fiche avec quelqu'un sans compte |
| 13 | [ ] | **Drag & drop dans les listes** | Réordonner manuellement les livres d'une liste par glisser-déposer |
| 14 | [ ] | **Recommandations automatiques** | Suggérer des livres de la PAL selon les tropes et genres des 5 étoiles |
| 15 | [ ] | **Mode hors-ligne** | Service Worker + cache API — consulter et noter sans connexion, sync au retour |
| 16 | [ ] | **Thème "Encre sépia"** | Troisième thème — tons orangé-brun chauds pour les soirées d'automne |
| 17 | [ ] | **Animation "coup de cœur"** | Étoiles filantes au clic sur la 5e étoile — récompense visuelle pour les chefs-d'œuvre |
| 18 | [ ] | **Notifications de lecture partagée** | Push notification quand une amie passe un cap de page dans le même livre |
| 19 | [ ] | **Séries et sagas** | Regrouper des livres sous une saga (ex. ACOTAR), afficher la progression tome par tome |
| 20 | [ ] | **Widget PWA** | Tuile écran d'accueil iOS/Android avec titre + page du livre en cours, tap → ouvre l'app |

---

## Journal des décisions

_(À compléter au fil des sessions — noter ici toute idée refusée pour ne pas la re-proposer)_

| Date | # | Décision | Raison |
|------|---|----------|--------|
| — | — | — | — |
