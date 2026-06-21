import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio - FlashCraft",
  description: "AI-powered visual editor",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
