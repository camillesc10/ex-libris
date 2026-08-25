import type { Book, BookList, SealedNote, Reader } from "@/types";

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

export const SEED_BOOKS: Book[] = [];

export const SEED_LISTS: BookList[] = [
  { name: "PAL", dot: "#E0B84A", desc: "La pile qui grandit plus vite que le temps libre." },
  { name: "En cours", dot: "#7DB08A", desc: "Marque-pages actuellement en service." },
  { name: "Déjà lu", dot: "#8A9BC1", desc: "Terminés, notés, parfois relus." },
  { name: "En pause", dot: "#C49A5E", desc: "Interrompus, mais pas abandonnés." },
  { name: "À relire", dot: "#96A1BE", desc: "Trop bons pour n'être lus qu'une fois." },
  { name: "Abandonné", dot: "#6B7280", desc: "La vie est trop courte pour les mauvais livres." },
  { name: "Liste de souhaits", dot: "#C4735C", desc: "Ceux que je veux lire mais que je n'ai pas encore." },
];

export const SEED_NOTES: SealedNote[] = [];

export const SEED_READERS: Reader[] = [];

export const FRIENDS: { name: string; color: string }[] = [];

export const CHECKPOINTS: { label: string; page: number; kicker: string }[] = [];

export const SYSTEM_LISTS = ["PAL", "En cours", "Déjà lu", "En pause", "À relire", "Abandonné"];
