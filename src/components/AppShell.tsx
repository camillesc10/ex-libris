"use client";
import { useEffect } from "react";
import { useStore } from "@/store";
import type { Screen } from "@/types";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ShelfScreen from "./screens/ShelfScreen";
import SearchScreen from "./screens/SearchScreen";
import ListsScreen from "./screens/ListsScreen";
import ActivityScreen from "./screens/ActivityScreen";
import ProfileScreen from "./screens/ProfileScreen";
import JournalScreen from "./screens/JournalScreen";
import TimelineScreen from "./screens/TimelineScreen";
import SeriesScreen from "./screens/SeriesScreen";
import MeScreen from "./screens/MeScreen";
import BookSheet from "./BookSheet";
import Toast from "./Toast";
import InstallBanner from "./InstallBanner";
import StarField from "./StarField";
import RouterSync from "./RouterSync";

export default function AppShell() {
  const { theme, screen, open, toast, hydrate } = useStore();
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <RouterSync />
      <StarField />
      <div
        style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", position: "relative", zIndex: 1 }}
        className="max-[820px]:grid-cols-1!"
      >
        <Sidebar />

        <main
          style={{ minWidth: 0, paddingBottom: 96 }}
          className="max-[820px]:!pb-[calc(96px+env(safe-area-inset-bottom))]"
        >
          <Header />
          <ScreenContent screen={screen} />
        </main>
      </div>

      <BottomNav />
      {open && <BookSheet />}
      {toast && <Toast />}
      <InstallBanner />
    </div>
  );
}

function ScreenContent({ screen }: { screen: Screen }) {
  switch (screen) {
    case "shelf":    return <ShelfScreen />;
    case "search":   return <SearchScreen />;
    case "lists":    return <ListsScreen />;
    case "activity": return <ActivityScreen />;
    case "journal":  return <JournalScreen />;
    case "timeline": return <TimelineScreen />;
    case "series":   return <SeriesScreen />;
    case "me":       return <MeScreen />;
    case "profile":  return <ProfileScreen />;
  }
}
