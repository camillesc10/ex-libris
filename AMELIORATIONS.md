# Propositions d'amélioration — Ex-Libris

Format : `[ ]` proposée · `[x]` acceptée · `[-]` refusée · `[~]` en cours

---

## Proposées

| # | Statut | Idée | Détail |
|---|--------|------|--------|
| 1 | [x] | **Authentification réelle** | NextAuth v5 CredentialsProvider + table `users` Neon + bcrypt ; route `/api/register` |
| 2 | [ ] | **Couvertures réelles depuis Google Books** | Stocker l'URL thumbnail lors de l'ajout via recherche, l'afficher à la place de la cover générée |
| 3 | [ ] | **Statistiques de lecture** | Pages lues par mois, genres dominants, vitesse moyenne, streak de jours de lecture |
| 4 | [x] | **Objectif annuel** | "50 livres en 2025" — barre de progression dans la sidebar, recap en fin d'année |
| 5 | [x] | **Scan ISBN** | `IsbnScanner.tsx` — BarcodeDetector API nativement dans Chrome/Android, overlay caméra |
| 6 | [x] | **Import Goodreads** | `GoodreadsImport.tsx` — upload CSV → parse → détection séries → import + sync Neon |
| 7 | [ ] | **Export bibliothèque** | Télécharger ses livres en CSV ou JSON (sauvegarde personnelle) |
| 8 | [x] | **Recherche dans sa bibliothèque** | Barre de recherche filtrante titre / auteur / trope dans ShelfScreen |
| 9 | [x] | **Filtre par trope** | Chips de tropes au-dessus de l'étagère, même mécanique que le filtre genre |
| 10 | [x] | **Historique de lecture** | Champs `startedAt` / `finishedAt` auto-remplis ; sélecteurs de date dans la fiche |
| 11 | [x] | **Notes de lecture par page** | Bloc-notes libre par livre (pas seulement le commentaire global) — ancré à une page |
| 12 | [ ] | **Partage de fiche** | URL publique `/livre/[id]` pour partager une fiche avec quelqu'un sans compte |
| 13 | [x] | **Drag & drop dans les listes** | Réordonner manuellement les livres d'une liste par glisser-déposer |
| 14 | [ ] | **Recommandations automatiques** | Suggérer des livres de la PAL selon les tropes et genres des 5 étoiles |
| 15 | [ ] | **Mode hors-ligne** | Service Worker + cache API — consulter et noter sans connexion, sync au retour |
| 16 | [ ] | **Thème "Encre sépia"** | Troisième thème — tons orangé-brun chauds pour les soirées d'automne |
| 17 | [x] | **Animation "coup de cœur"** | 6 ✦ en burst CSS depuis le centre de la card note quand la 5e étoile est cliquée |
| 18 | [x] | **Notifications de lecture partagée** | Push notification quand une amie passe un cap de page dans le même livre |
| 19 | [x] | **Séries et sagas** | Champs `series` / `seriesNum` ; groupage par saga sur l'étagère avec label doré |
| 20 | [ ] | **Widget PWA** | Tuile écran d'accueil iOS/Android avec titre + page du livre en cours, tap → ouvre l'app |
| 21 | [x] | **Suppression de listes** | Bouton × sur les listes personnalisées dans ListsScreen ; cascade sur les livres via API |
| 22 | [x] | **Vue "Auteurs"** | Regrouper la bibliothèque par auteur avec photo, mini-bio OpenLibrary et liste de ses œuvres |
| 23 | [x] | **Tri de l'étagère** | Trier par note, pages, date d'ajout, ordre alphabétique — menu déroulant au-dessus des filtres |
| 24 | [ ] | **Random book** | Bouton "inspire-moi" qui tire un livre de la PAL au hasard et ouvre sa fiche |
| 25 | [ ] | **Filtrer par année de lecture** | Retrouver tous les livres finishedAt en 2024, 2025… via un chip année dans l'étagère |
| 26 | [x] | **Commentaire structuré** | Points forts / bémols / citation mémorable en trois champs séparés plutôt qu'un seul bloc texte |
| 27 | [ ] | **Badges et trophées** | "Lu 10 sagas complètes", "100 livres cette année", "Noctambule" (fini à 2h du mat)… |
| 28 | [x] | **Journal de lecture** | Entrée libre par jour de lecture sur une timeline verticale, avec pages lues ce jour-là |
| 29 | [ ] | **Nuage de tropes** | Visualisation en word-cloud des tropes les plus fréquents dans ta bibliothèque |
| 30 | [ ] | **Import StoryGraph** | Upload du CSV StoryGraph → import et mapping vers les champs Ex-Libris |
| 31 | [x] | **Recherche avancée** | Filtrer simultanément par année, langue, nb de pages min/max, note minimale |
| 32 | [x] | **Rappel de reprise** | Alerte configurable (dans N jours) pour reprendre un livre "En pause" |
| 33 | [ ] | **Profil public** | Page `/u/[pseudo]` avec stats, genres favoris, derniers livres lus — sans compte requis |
| 34 | [x] | **Liste collaborative** | Liste partagée entre amies où chaque membre peut ajouter/retirer des livres |
| 35 | [x] | **Liens entre livres** | "Si tu as aimé X, tu aimeras Y" — lien manuel entre fiches |
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
| 52 | [x] | **Code couleur des étagères** | Choisir la couleur du bois de chaque étagère dans les préférences |
| 53 | [x] | **Pagination de la PAL** | Organiser la PAL en "vagues" de N livres à lire prochainement — les autres masqués |
| 54 | [ ] | **Regrouper par éditeur** | Vue dédiée listant les livres par maison d'édition |
| 55 | [x] | **Tag #DNF avec raison** | Marquer "abandonné" avec une raison choisie : trop lent, personnages, traduction… |
| 56 | [x] | **Highlight du livre en cours** | Pin visible dans le header/sidebar montrant titre + page du livre actuellement lu |
| 57 | [ ] | **Palette personnalisée** | Choisir manuellement la couleur de fond et d'encre d'une couverture |
| 58 | [x] | **Partage d'étagère** | URL publique `/etagere/[pseudo]` pour partager toute une étagère (pas juste un livre) |
| 59 | [ ] | **Story Instagram** | Card auto-générée "En train de lire X — page N" à copier pour les stories |
| 60 | [x] | **Connexion Kindle** | Importer les surlignages Kindle (My Clippings.txt) dans les notes d'un livre |
| 61 | [x] | **Vue timeline** | Calendrier annuel avec les livres finis positionnés sur les mois correspondants |
| 62 | [ ] | **Résumé audio** | Lire le résumé à voix haute via l'API Web Speech Synthesis |
| 63 | [ ] | **Tropes par ami·e** | Voir quels tropes une amie préfère d'après ses lectures 5 étoiles |
| 64 | [ ] | **Annuaire de librairies** | Mémoriser ses librairies favorites et les livres achetés dans chacune |
| 65 | [ ] | **Suggestions selon l'heure** | Matin : roman doux ; soir : thriller — recommandations contextuelles par plage horaire |
| 66 | [x] | **Drag & drop dans les listes** | Réordonner manuellement les livres d'une liste par glisser-déposer |
| 67 | [x] | **Notes de lecture par page** | Bloc-notes libre par livre ancré à une page précise (pas seulement le commentaire global) |
| 68 | [ ] | **Recommandations automatiques** | Suggérer des livres de la PAL selon les tropes et genres des 5 étoiles |
| 69 | [ ] | **Mode hors-ligne** | Service Worker + cache API — consulter et noter sans connexion, sync au retour |
| 70 | [ ] | **Thème "Encre sépia"** | Troisième thème — tons orangé-brun chauds pour les soirées d'automne |
| 71 | [ ] | **Mode "lecture rapide"** | Affiche une page à la fois en plein écran avec minuterie, pour s'entraîner à lire plus vite |
| 72 | [x] | **Comparaison de bibliothèques** | Voir les livres en commun avec une amie et ceux qu'elle a lus mais pas toi |
| 73 | [ ] | **Fiche auteur enrichie** | Récupérer photo, biographie et nationalité depuis OpenLibrary ou Wikidata |
| 74 | [x] | **Mode "coup de foudre"** | Swipe gauche/droite sur les livres de la PAL pour décider lequel lire en premier |
| 75 | [x] | **Lecture parallèle** | Suivre plusieurs livres simultanément avec un onglet par livre dans la vue En cours |
| 76 | [x] | **Club de lecture** | Espace dédié pour un groupe avec vote sur le prochain livre à lire ensemble |
| 77 | [ ] | **Graphe de réseau** | Visualisation des liens entre livres (série, auteur, tropes communs) en graphe interactif |
| 78 | [ ] | **Compteur de mots** | Champ "nombre de mots" en plus des pages, avec vitesse de lecture en mots/minute |
| 79 | [ ] | **Mode sombre total** | Variante OLED pure-black (#000) pour économiser la batterie sur mobile |
| 80 | [ ] | **Export PDF de fiche** | Générer un PDF imprimable d'une fiche de livre — couverture + infos + commentaire |
| 81 | [ ] | **Reconnaissance vocale** | Dicter le commentaire ou les notes d'une fiche à la voix |
| 82 | [ ] | **Prêt de livre** | Marquer un livre comme prêté à quelqu'un avec rappel de retour |
| 83 | [x] | **Liste de souhaits** | Rayon "Wishlist" avec bouton d'achat direct vers la librairie |
| 84 | [ ] | **Humeur de lecture** | Tag d'humeur par session (fébrile, contemplatif, frustré…) visible sur la timeline |
| 85 | [ ] | **Couverture personnalisée** | Uploader une photo de sa propre couverture pour remplacer la couleur générée |
| 86 | [ ] | **Partage sur Mastodon/Bluesky** | Bouton "Partager ma lecture" avec texte pré-rempli et lien vers la fiche publique |
| 87 | [ ] | **Résumé de fin d'année** | Récap visuel type "Spotify Wrapped" — top genre, top auteur, pages totales, mois le plus actif |
| 88 | [ ] | **Synchro iCloud/Drive** | Export automatique vers iCloud Drive ou Google Drive en JSON chiffré |
| 89 | [ ] | **Marque-page virtuel** | Afficher un marque-page animé à la page courante, personnalisable (couleur, motif) |
| 90 | [ ] | **Notes collaboratives scellées** | Dans la lecture partagée, débloquer les notes au même moment pour tout le groupe |
| 91 | [ ] | **Mode "défi"** | Définir un défi personnel (lire 5 livres hors de son genre habituel) avec suivi |
| 92 | [ ] | **Langue cible** | Pour chaque livre, noter la langue dans laquelle on l'a lu + progression en langue étrangère |
| 93 | [ ] | **Tableau de bord analytics** | Dashboard complet : courbes de pages/mois, heatmap des jours de lecture, évolution de vitesse |
| 94 | [ ] | **Playlist de lecture** | Associer une playlist Spotify ou Apple Music à un livre — s'affiche sur la fiche |
| 95 | [ ] | **Rappel quotidien** | Notification push à heure configurable : "Tu n'as pas encore lu aujourd'hui !" |
| 96 | [ ] | **Importation depuis Bookly** | Lire les données de l'app Bookly (iOS) et les mapper vers les champs Ex-Libris |
| 97 | [x] | **Tampon "relu"** | Badge visuel sur la couverture quand le livre est dans "À relire" et a déjà été noté |
| 98 | [ ] | **Historique des sessions de lecture** | Calculer temps moyen par session à partir des entrées journal + rappel minuterie |
| 99 | [x] | **Recherche par ISBN** | Champ de recherche directe par code ISBN dans SearchScreen |
| 100 | [ ] | **Vue "Nouveautés"** | Rayon automatique des livres ajoutés au cours des 30 derniers jours |
| 101 | [x] | **Filtre "non noté"** | Chip rapide pour isoler les livres "Déjà lu" sans note — pour se mettre à jour |
| 102 | [ ] | **Fiche en deux colonnes** | Option d'affichage dense : résumé + infos côte à côte au lieu de l'empilement vertical |
| 103 | [ ] | **Mode lecture nuit** | Filtre chaud (température couleur 3000 K) activable depuis la barre du bas |
| 104 | [x] | **Récompense de lecture** | Confettis + message personnalisé quand le dernier tome d'une saga est terminé |
| 105 | [ ] | **Agenda de lecture** | Calendrier avec les livres planifiés — "je lis ça en mars, puis ça en avril" |
| 106 | [x] | **Comparaison de notes** | Voir en regard les avis de tes amies sur un même livre si elles l'ont noté |
| 107 | [x] | **Fond de couverture dynamique** | Extracteur de palette automatique depuis une image uploadée pour les couvertures personnalisées |
| 108 | [ ] | **Export CSV de listes** | Télécharger une seule liste en CSV — utile pour partager une sélection |
| 109 | [x] | **Suggestions "même auteur"** | Dans la fiche, bloc "Autres livres de cet auteur dans ta PAL" |
| 110 | [x] | **Notification fin de série** | Alerte quand toutes les entrées d'une saga sont dans "Déjà lu" |
| 111 | [ ] | **Personnalisation du fond d'écran** | Choisir une image ou texture de fond pour l'app (bois, velours, pierre…) |
| 112 | [ ] | **Chiffrement des notes** | Option pour chiffrer localement les commentaires sensibles (AES-GCM, clé dérivée du mot de passe) |
| 113 | [x] | **Lien ISBN → achat** | Sur chaque fiche, lien direct vers le livre sur Bookshop.org ou la FNAC |
| 114 | [ ] | **Prédiction de durée** | "À ta vitesse actuelle tu finiras ce livre dans X jours" basé sur pages/jour du journal |
| 115 | [ ] | **Mot du jour** | Afficher un mot rare ou littéraire chaque matin sur l'écran de démarrage |
| 116 | [ ] | **Partage de page note** | Bouton sur une note de page pour la partager en image avec fond aux couleurs du livre |
| 117 | [ ] | **Mode "PAL surprise"** | Masquer la PAL entière sauf un livre tiré au sort — pour briser la paralysie du choix |
| 118 | [ ] | **Clavier raccourcis** | Raccourcis clavier pour les actions fréquentes (noter, passer à la liste suivante…) |
| 119 | [ ] | **Transcription de surlignages** | Exporter toutes les notes de page d'un livre en un seul texte copiable ou PDF |
| 120 | [ ] | **Tropes trending** | Afficher les 5 tropes les plus utilisés parmi les livres 5 étoiles de la bibliothèque |

---

## Journal des décisions

_(À compléter au fil des sessions — noter ici toute idée refusée pour ne pas la re-proposer)_

| Date | # | Décision | Raison |
|------|---|----------|--------|
| 2026-08-23 | 1, 5, 6, 8, 9, 10, 17, 19 | ✅ Acceptées et implémentées | — |
| 2026-08-23 | 21 | ✅ Acceptée et implémentée | — |
| 2026-08-23 | 4, 11, 13, 18, 22, 23, 26, 28, 31, 32, 34, 35, 52, 53, 55, 56, 58, 60, 61, 66, 67 | ✅ Acceptées et implémentées | — |
| 2026-08-23 | 71–120 | 🆕 Proposées | Session 3 |
