import type { Book, BookList, Conversation, SealedNote, Reader } from "@/types";

export const COVER_PALETTE: [string, string][] = [
  ["#151C31", "#F0DFAE"],
  ["#26192E", "#EFDCC9"],
  ["#122629", "#DBE9E0"],
  ["#271F16", "#F2E1BA"],
  ["#1A1730", "#E2D8EE"],
  ["#1B2436", "#E8DCC0"],
  ["#2A1D22", "#EFDFD2"],
  ["#16262F", "#DCE9EE"],
  ["#232019", "#EEE2C8"],
  ["#1E1A2C", "#DFD8EC"],
];

export const GENRES = [
  "Romantasy", "Romance", "Fantasy", "SF", "Thriller",
  "Contemporain", "Historique", "Dystopie", "Cosy mystery",
];

export const TROPES = [
  "enemies to lovers", "fake dating", "grumpy × sunshine", "only one bed",
  "slow burn", "found family", "forbidden love", "second chance",
  "touch her and die", "academy rivals", "morally grey MMC", "friends to lovers",
];

export const SPICE_LABELS = [
  "Aucune scène — tout est dans le regard",
  "Un baiser, un frisson, on ferme la porte",
  "Ça chauffe, la porte est entrouverte",
  "Porte grande ouverte, plusieurs fois",
  "Très explicite, mets un marque-page discret",
  "Il n'y a plus de porte",
];

export const RATING_LABELS = [
  "Pas encore noté", "Non.", "Ça se lit", "Bon moment", "Très bon, je le prête", "Coup de cœur absolu",
];

function bk(
  i: number, title: string, author: string, year: string, genre: string,
  spice: number, rating: number, pages: number, page: number,
  tropes: string[], lists: string[],
  resume: string, platforms?: { name: string; langs: string }[]
): Book {
  const [bg, ink] = COVER_PALETTE[i % COVER_PALETTE.length];
  return {
    id: `b${i}`, title, author, year, genre, lang: "FR",
    spice, rating, pages, page, tropes, lists, resume, comment: "",
    bg, ink, platforms: platforms ?? [{ name: "Kobo", langs: "FR, EN" }],
  };
}

export const SEED_BOOKS: Book[] = [
  bk(0, "Une cour de roses et d'épines", "Sarah J. Maas", "2015", "Romantasy", 3, 5, 528, 528,
    ["enemies to lovers", "touch her and die"], ["Déjà lu", "Pépites 2024"],
    "Feyre chasse pour survivre et tue le mauvais loup. La dette se paie de l'autre côté du mur, chez les Fae, dans un manoir où le maître porte un masque.",
    [{ name: "Kobo", langs: "FR, EN" }, { name: "Audible", langs: "FR" }, { name: "Bibliothèque municipale", langs: "FR" }]),
  bk(1, "Fourth Wing", "Rebecca Yarros", "2023", "Romantasy", 4, 5, 640, 211,
    ["academy rivals", "morally grey MMC", "enemies to lovers"], ["En cours"],
    "Violet devait devenir archiviste, elle entre au collège des cavaliers de dragons. Un an pour survivre, et le fils de la générale la déteste déjà.",
    [{ name: "Kobo", langs: "FR, EN" }, { name: "Audible", langs: "EN" }]),
  bk(2, "Le Prince cruel", "Holly Black", "2018", "Romantasy", 1, 4, 416, 416,
    ["enemies to lovers", "forbidden love"], ["Déjà lu"],
    "Jude est mortelle à la cour d'Elfhame, où on la méprise. Elle veut une place — et elle est prête à comploter avec le prince qu'elle hait le plus.",
    [{ name: "Kobo", langs: "FR" }, { name: "Fnac", langs: "FR" }]),
  bk(3, "La Chanson d'Achille", "Madeline Miller", "2011", "Historique", 2, 5, 352, 352,
    ["friends to lovers", "forbidden love", "slow burn"], ["Déjà lu", "Pépites 2024"],
    "Patrocle raconte Achille : l'enfance à Phthie, l'apprentissage chez Chiron, puis Troie. On connaît la fin, on espère quand même.",
    [{ name: "Kobo", langs: "FR, EN" }, { name: "Audible", langs: "FR, EN" }]),
  bk(4, "Beach Read", "Emily Henry", "2020", "Romance", 2, 4, 384, 384,
    ["grumpy × sunshine", "enemies to lovers"], ["Déjà lu"],
    "Deux écrivains en panne, deux maisons voisines, un pari : elle écrira du sombre, lui de la romance. Un été pour tenir.",
    [{ name: "Kobo", langs: "FR, EN" }]),
  bk(5, "Les Sept Maris d'Evelyn Hugo", "Taylor Jenkins Reid", "2017", "Contemporain", 2, 5, 448, 0,
    ["forbidden love", "second chance"], ["PAL"],
    "Une star d'Hollywood choisit une journaliste inconnue pour raconter sa vie et ses sept mariages. Elle sait exactement pourquoi.",
    [{ name: "Kobo", langs: "FR, EN" }, { name: "Bibliothèque municipale", langs: "FR" }]),
  bk(6, "Icebreaker", "Hannah Grace", "2022", "Romance", 4, 3, 464, 0,
    ["grumpy × sunshine", "only one bed", "fake dating"], ["PAL"],
    "Une patineuse artistique et un capitaine de hockey doivent partager la patinoire. Puis la chambre d'hôtel. Évidemment.",
    [{ name: "Kobo", langs: "FR, EN" }]),
  bk(7, "Piranesi", "Susanna Clarke", "2020", "Fantasy", 0, 4, 288, 96,
    ["found family"], ["En pause"],
    "Une maison infinie, des salles envahies par la mer, des statues sans nombre. Piranesi la cartographie et n'a qu'un ami — jusqu'à la treizième personne.",
    [{ name: "Kobo", langs: "FR" }, { name: "Bibliothèque municipale", langs: "FR, EN" }]),
  bk(8, "Le Problème à trois corps", "Liu Cixin", "2008", "SF", 0, 4, 592, 0,
    [], ["Abandonné"],
    "Des physiciens se suicident, un jeu vidéo simule un monde à trois soleils, et un signal a déjà quitté la Terre il y a longtemps.",
    [{ name: "Kobo", langs: "FR" }]),
  bk(9, "La Servante écarlate", "Margaret Atwood", "1985", "Dystopie", 1, 5, 368, 368,
    ["forbidden love"], ["Déjà lu"],
    "À Galaad, Defred a une chambre, une robe rouge et une fonction. Elle se souvient d'un temps où elle avait un nom.",
    [{ name: "Kobo", langs: "FR, EN" }, { name: "Audible", langs: "FR" }]),
  bk(10, "Normal People", "Sally Rooney", "2018", "Contemporain", 2, 5, 273, 0,
    ["slow burn", "friends to lovers", "second chance"], ["À relire"],
    "Connell et Marianne grandissent dans la même ville irlandaise mais vivent dans des mondes différents. À l'université, les rôles s'inversent.",
    [{ name: "Kobo", langs: "FR, EN" }]),
];

export const SEED_LISTS: BookList[] = [
  { name: "PAL", dot: "#E0B84A", desc: "La pile qui grandit plus vite que le temps libre." },
  { name: "En cours", dot: "#7DB08A", desc: "Marque-pages actuellement en service." },
  { name: "Déjà lu", dot: "#8A9BC1", desc: "Terminés, notés, parfois relus." },
  { name: "En pause", dot: "#C49A5E", desc: "Interrompus, mais pas abandonnés." },
  { name: "À relire", dot: "#96A1BE", desc: "Trop bons pour n'être lus qu'une fois." },
  { name: "Abandonné", dot: "#6B7280", desc: "La vie est trop courte pour les mauvais livres." },
  { name: "Liste de souhaits", dot: "#C4735C", desc: "Ceux que je veux lire mais que je n'ai pas encore." },
  { name: "Pépites 2024", dot: "#E0B84A", desc: "Celles que je force les gens à lire." },
];

export const SEED_CONVOS: Conversation[] = [
  {
    id: "c1", name: "Camille", initial: "C", avatarBg: "#C4735C", time: "10:24",
    messages: [
      { from: "them", text: "j'ai fini Fourth Wing cette nuit. je ne vais pas bien." },
      { from: "me", text: "attends attends. tu es à quelle page du tome 2 ?" },
      { from: "them", text: "aucune, je survis. tiens, celui-là est pour toi 👇" },
      { from: "them", book: "b3" },
    ],
  },
  {
    id: "c2", name: "Noor", initial: "N", avatarBg: "#8A6FB0", time: "hier",
    messages: [
      { from: "them", text: "besoin d'un comfort read, il pleut depuis 3 jours" },
      { from: "me", text: "j'ai exactement ce qu'il te faut, zéro piment, ambiance maison hantée douce" },
      { from: "me", book: "b7" },
      { from: "them", text: "vendu. on le lit en même temps ?" },
    ],
  },
  {
    id: "c3", name: "Salomé", initial: "S", avatarBg: "#5E8B6A", time: "lun.",
    messages: [
      { from: "them", text: "verdict sur Icebreaker ? je vois passer que du 5 étoiles sur booktok" },
      { from: "me", text: "3/5 pour moi, mais le seul-un-lit chapitre 18 vaut le détour" },
    ],
  },
];

export const SEED_NOTES: SealedNote[] = [
  { page: 42, who: "Camille", text: "« Les cavaliers ne pleurent pas leurs morts avant la fin du vol. » ok je suis déjà investie.", when: "lun. 21:04" },
  { page: 118, who: "Moi", text: "le parapet. LE PARAPET. j'ai relu la scène trois fois.", when: "mar. 08:12" },
  { page: 214, who: "Camille", text: "Xaden qui apparaît chaque fois qu'elle est en danger, on va appeler ça un hasard encore combien de temps ?", when: "mar. 22:47" },
  { page: 318, who: "Camille", text: "je ne dis rien. je ne dis RIEN. arrive juste à cette page vite.", when: "mer. 19:30" },
  { page: 470, who: "Camille", text: "appelle-moi quand tu y es. sérieusement.", when: "jeu. 07:15" },
];

export const SEED_READERS: Reader[] = [
  { name: "Camille", page: 396, color: "#8A6FB0" },
];

export const FRIENDS = [
  { name: "Camille", color: "#8A6FB0" },
  { name: "Noor", color: "#5E8B6A" },
  { name: "Salomé", color: "#D9A45B" },
];

export const CHECKPOINTS = [
  { label: "Le seuil du collège", page: 118, kicker: "Jalon 1" },
  { label: "Premier vol", page: 214, kicker: "Jalon 2" },
  { label: "La faille", page: 318, kicker: "Jalon 3" },
  { label: "Le dernier chapitre", page: 470, kicker: "Jalon 4" },
];

export const SYSTEM_LISTS = ["PAL", "En cours", "Déjà lu", "En pause", "À relire", "Abandonné"];
