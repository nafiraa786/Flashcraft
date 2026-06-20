import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlashCraft — Describe it. We'll forge it.",
  description:
    "FlashCraft turns prompts into polished app ideas and experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", spaceGrotesk.variable, inter.variable, jetBrainsMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full bg-[#0a0e1a] text-slate-50">{children}</body>
    </html>
  );
}
