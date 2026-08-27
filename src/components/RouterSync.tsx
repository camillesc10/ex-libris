"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store";
import type { Screen } from "@/types";

const PATH_TO_SCREEN: Record<string, Screen> = {
  "/etagere":   "shelf",
  "/recherche": "search",
  "/listes":    "lists",
  "/activite":  "activity",
  "/journal":   "journal",
  "/timeline":  "timeline",
  "/sagas":     "series",
  "/moi":       "me",
};

const SCREEN_TO_PATH: Record<Screen, string> = {
  shelf:    "/etagere",
  search:   "/recherche",
  lists:    "/listes",
  activity: "/activite",
  journal:  "/journal",
  timeline: "/timeline",
  series:   "/sagas",
  me:       "/moi",
  profile:  "/profil",
};

export default function RouterSync() {
  const router = useRouter();
  const pathname = usePathname();
  const screen = useStore((s) => s.screen);
  const profileUserId = useStore((s) => s.profileUserId);
  const navigate = useStore((s) => s.navigate);
  const viewProfile = useStore((s) => s.viewProfile);

  // URL → store : gère le bouton Retour/Suivant du navigateur + accès direct par URL
  useEffect(() => {
    if (pathname.startsWith("/profil/")) {
      const id = pathname.slice("/profil/".length);
      if (id && screen !== "profile") viewProfile(id);
    } else {
      const s = PATH_TO_SCREEN[pathname];
      if (s && s !== screen) navigate(s);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // store → URL : gère la navigation dans l'appli
  useEffect(() => {
    const targetPath = screen === "profile"
      ? `/profil/${profileUserId ?? ""}`
      : (SCREEN_TO_PATH[screen] ?? "/etagere");
    if (targetPath !== pathname) {
      router.push(targetPath, { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, profileUserId]);

  return null;
}
