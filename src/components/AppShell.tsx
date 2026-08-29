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
import SyncScreen from "./screens/SyncScreen";
import BookSheet from "./BookSheet";
import Toast from "./Toast";
import InstallBanner from "./InstallBanner";
import StarField from "./StarField";
import RouterSync from "./RouterSync";

export default function AppShell() {
  const { theme, screen, open, toast, hydrate } = useStore();
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <div
      data-theme={theme}
      style={{ background: "var(--bg)" }}
      className="min-h-[100dvh] relative max-[820px]:h-[100dvh] max-[820px]:min-h-0 max-[820px]:flex max-[820px]:flex-col max-[820px]:overflow-hidden"
    >
      <RouterSync />
      <StarField />
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="grid grid-cols-[240px_1fr] min-h-screen max-[820px]:grid-cols-1 max-[820px]:flex max-[820px]:flex-col max-[820px]:flex-1 max-[820px]:min-h-0 max-[820px]:overflow-hidden"
      >
        <Sidebar />

        <main
          className="min-w-0 pb-24 max-[820px]:pb-6 max-[820px]:flex-1 max-[820px]:overflow-y-auto max-[820px]:pt-[env(safe-area-inset-top)]"
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
    case "sync":     return <SyncScreen />;
  }
}
