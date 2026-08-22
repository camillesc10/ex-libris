"use client";
import { useStore } from "@/store";
import AuthPage from "@/components/AuthPage";
import AppShell from "@/components/AppShell";

export default function Home() {
  const auth = useStore((s) => s.auth);
  return auth ? <AppShell /> : <AuthPage />;
}
