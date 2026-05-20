import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "CRM com IA para corretores transformarem leads em compradores reais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${hankenGrotesk.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
