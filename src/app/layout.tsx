import type { Metadata, Viewport } from "next";
import { Newsreader, Karla } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"],
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marque-page",
  description: "Ta bibliothèque, tes pépites, et les ami·es qui lisent avec toi.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Marque-page",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#F5F2F8",
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
            --font-newsreader: ${newsreader.style.fontFamily};
            --font-karla: ${karla.style.fontFamily};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
