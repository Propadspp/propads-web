import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const inter = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Propads — Legghlífar & Gripsokkar",
  description: "Íslenskar fótboltavörur hannaðar fyrir þær sem þora að keppa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="is" className={`${barlow.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
