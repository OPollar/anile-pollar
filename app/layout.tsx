import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/lora";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/merriweather";
import "@fontsource/uncial-antiqua/400.css";
import "@fontsource/medievalsharp/400.css";
import "@fontsource/special-elite/400.css";
import "@fontsource/im-fell-english/400.css";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource/cinzel-decorative/700.css";
import "./globals.css";
import { getStory } from "@/lib/data";
import { themeToCss } from "@/lib/theme";
import { StoreHydrator } from "@/components/StoreHydrator";

export async function generateMetadata(): Promise<Metadata> {
  const story = await getStory();
  return {
    title: story?.title || "Anile Pollar",
    description: story?.tagline || "Uma história interativa.",
  };
}

export const viewport: Viewport = { themeColor: "#0b0d14" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const story = await getStory();
  // O tema do personagem é injetado no servidor => sem "piscada" de cor ao carregar.
  return (
    <html lang="pt-BR">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeToCss(story?.theme) }} />
      </head>
      <body>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
