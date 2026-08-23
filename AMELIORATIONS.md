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
| 21 | [x] | **Suppression de listes** | Bouton × sur les listes personnalisées dans ListsScreen ; cascade sur les livres via API |
| 22 | [ ] | **Vue "Auteurs"** | Regrouper la bibliothèque par auteur avec photo, mini-bio OpenLibrary et liste de ses œuvres |
| 23 | [ ] | **Tri de l'étagère** | Trier par note, pages, date d'ajout, ordre alphabétique — menu déroulant au-dessus des filtres |
| 24 | [ ] | **Random book** | Bouton "inspire-moi" qui tire un livre de la PAL au hasard et ouvre sa fiche |
| 25 | [ ] | **Filtrer par année de lecture** | Retrouver tous les livres finishedAt en 2024, 2025… via un chip année dans l'étagère |
| 26 | [ ] | **Commentaire structuré** | Points forts / bémols / citation mémorable en trois champs séparés plutôt qu'un seul bloc texte |
| 27 | [ ] | **Badges et trophées** | "Lu 10 sagas complètes", "100 livres cette année", "Noctambule" (fini à 2h du mat)… |
| 28 | [ ] | **Journal de lecture** | Entrée libre par jour de lecture sur une timeline verticale, avec pages lues ce jour-là |
| 29 | [ ] | **Nuage de tropes** | Visualisation en word-cloud des tropes les plus fréquents dans ta bibliothèque |
| 30 | [ ] | **Import StoryGraph** | Upload du CSV StoryGraph → import et mapping vers les champs Ex-Libris |
| 31 | [ ] | **Recherche avancée** | Filtrer simultanément par année, langue, nb de pages min/max, note minimale |
| 32 | [ ] | **Rappel de reprise** | Alerte configurable (dans N jours) pour reprendre un livre "En pause" |
| 33 | [ ] | **Profil public** | Page `/u/[pseudo]` avec stats, genres favoris, derniers livres lus — sans compte requis |
| 34 | [ ] | **Liste collaborative** | Liste partagée entre amies où chaque membre peut ajouter/retirer des livres |
| 35 | [ ] | **Liens entre livres** | "Si tu as aimé X, tu aimeras Y" — lien manuel entre fiches |
| 36 | [ ] | **Palettes de couvertures** | Générer plusieurs options de couleurs de couverture et choisir sa préférée |
| 37 | [ ] | **Stickers visuels** | Apposer un emoji sticker sur une couverture — visible sur la mini-cover (💕 🔥 🏆…) |
| 38 | [ ] | **Mode blind date** | Masquer titres et couvertures, ne montrer que le résumé pour choisir sans biais |
| 39 | [ ] | **Budget livres** | Champ prix d'achat par livre, total dépensé par mois/an, ratio plaisir/prix |
| 40 | [ ] | **Tropes suggérés** | Proposer des tropes automatiquement depuis le résumé ou le genre via un mini LLM |
| 41 | [ ] | **Vue carte** | Cartographier les livres par pays d'origine de l'auteur ou de l'action du roman |
| 42 | [ ] | **Alerte nouveau tome** | Notification push quand le prochain tome d'une saga suivie est annoncé ou disponible |
| 43 | [ ] | **Lecture audio** | Champ "livre audio" avec heures écoutées ; comptabilisé séparément des pages |
| 44 | [ ] | **Géolocalisation** | Mémoriser où on a lu un livre — café, plage, train — visible sur la fiche |
| 45 | [ ] | **Résumé auto** | Pré-remplir le résumé depuis Google Books si le champ est vide à l'ajout |
| 46 | [ ] | **Historique des notes** | Voir qu'une note est passée de 3★ à 5★ avec la date du changement |
| 47 | [ ] | **Mode duo** | Deux profils sur le même appareil, switch rapide sans reconnexion complète |
| 48 | [ ] | **Export Notion** | Générer une page Notion formatée avec toute la bibliothèque ou une liste choisie |
| 49 | [ ] | **Minuterie de lecture** | Timer intégré pour tracker le temps de lecture du jour par séance |
| 50 | [ ] | **Sauvegarde automatique** | Export hebdomadaire auto en JSON vers une URL webhook (Notion, Google Drive…) |
| 51 | [ ] | **Intégration Babelio** | Chercher et importer des fiches directement depuis Babelio |
| 52 | [ ] | **Code couleur des étagères** | Choisir la couleur du bois de chaque étagère dans les préférences |
| 53 | [ ] | **Pagination de la PAL** | Organiser la PAL en "vagues" de N livres à lire prochainement — les autres masqués |
| 54 | [ ] | **Regrouper par éditeur** | Vue dédiée listant les livres par maison d'édition |
| 55 | [ ] | **Tag #DNF avec raison** | Marquer "abandonné" avec une raison choisie : trop lent, personnages, traduction… |
| 56 | [ ] | **Highlight du livre en cours** | Pin visible dans le header/sidebar montrant titre + page du livre actuellement lu |
| 57 | [ ] | **Palette personnalisée** | Choisir manuellement la couleur de fond et d'encre d'une couverture |
| 58 | [ ] | **Partage d'étagère** | URL publique `/etagere/[pseudo]` pour partager toute une étagère (pas juste un livre) |
| 59 | [ ] | **Story Instagram** | Card auto-générée "En train de lire X — page N" à copier pour les stories |
| 60 | [ ] | **Connexion Kindle** | Importer les surlignages Kindle (My Clippings.txt) dans les notes d'un livre |
| 61 | [ ] | **Vue timeline** | Calendrier annuel avec les livres finis positionnés sur les mois correspondants |
| 62 | [ ] | **Résumé audio** | Lire le résumé à voix haute via l'API Web Speech Synthesis |
| 63 | [ ] | **Tropes par ami·e** | Voir quels tropes une amie préfère d'après ses lectures 5 étoiles |
| 64 | [ ] | **Annuaire de librairies** | Mémoriser ses librairies favorites et les livres achetés dans chacune |
| 65 | [ ] | **Suggestions selon l'heure** | Matin : roman doux ; soir : thriller — recommandations contextuelles par plage horaire |
| 66 | [ ] | **Drag & drop dans les listes** | Réordonner manuellement les livres d'une liste par glisser-déposer |
| 67 | [ ] | **Notes de lecture par page** | Bloc-notes libre par livre ancré à une page précise (pas seulement le commentaire global) |
| 68 | [ ] | **Recommandations automatiques** | Suggérer des livres de la PAL selon les tropes et genres des 5 étoiles |
| 69 | [ ] | **Mode hors-ligne** | Service Worker + cache API — consulter et noter sans connexion, sync au retour |
| 70 | [ ] | **Thème "Encre sépia"** | Troisième thème — tons orangé-brun chauds pour les soirées d'automne |

---

## Journal des décisions

_(À compléter au fil des sessions — noter ici toute idée refusée pour ne pas la re-proposer)_

| Date | # | Décision | Raison |
|------|---|----------|--------|
| 2026-08-23 | 1, 5, 6, 8, 9, 10, 17, 19 | ✅ Acceptées et implémentées | — |
| 2026-08-23 | 21 | ✅ Acceptée et implémentée | — |
