"use client";
import { useEffect } from "react";
import { useStore } from "@/store";
import AuthPage from "@/components/AuthPage";
import AppShell from "@/components/AppShell";

export default function Home() {
  const auth = useStore((s) => s.auth);
  const restoreSession = useStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return auth ? <AppShell /> : <AuthPage />;
}
