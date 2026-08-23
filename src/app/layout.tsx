import type { Metadata, Viewport } from "next";
import { Cinzel, Karla } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ex-Libris",
  description: "Ta bibliothèque, tes pépites, et les ami·es qui lisent avec toi.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ex-Libris",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#161C2F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" style={{ fontFamily: karla.style.fontFamily }}>
      <head>
        <style>{`
          :root {
            --font-cinzel: ${cinzel.style.fontFamily};
            --font-karla: ${karla.style.fontFamily};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
