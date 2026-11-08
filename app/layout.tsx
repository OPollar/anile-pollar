import "@fontsource-variable/cinzel";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/inter";
import "@fontsource-variable/lora";
import "@fontsource-variable/merriweather";
import "@fontsource-variable/playfair-display";
import "@fontsource/medievalsharp";
import "@fontsource/special-elite";
import "@fontsource/uncial-antiqua";
import "./globals.css";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import MusicPlayer from "@/components/MusicPlayer";
import { getStory } from "@/lib/data";
import { themeVars } from "@/lib/theme";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getStory();
  return { title: s.title, description: s.subtitle ?? undefined };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const story = await getStory();
  return (
    <html lang="pt-BR" style={themeVars(story.theme, story.heading_font)}>
      <body className="min-h-screen">
        <SiteHeader title={story.title} />
        <main>{children}</main>
        <MusicPlayer src={story.music_url} />
      </body>
    </html>
  );
}
