export type Theme = {
  primary: string;
  accent: string;
  glow: string;
  bg: string;
  ink: string;
};

export type Typography = {
  fontFamily: string; // chave de lib/fonts.ts
  fontSize: number; // px
  lineHeight: number;
  color: string;
};

export type Story = {
  id: number;
  title: string;
  tagline: string | null;
  character_name: string;
  theme: Theme;
  home_background_url: string | null;
};

export type Chapter = {
  id: string;
  position: number;
  slug: string;
  title: string;
  subtitle: string | null;
  content: any; // documento Tiptap (JSON)
  background_url: string | null;
  music_url: string | null;
  intro_video_url: string | null;
  typography: Typography;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ChapterSummary = Pick<
  Chapter,
  "id" | "position" | "slug" | "title" | "subtitle" | "published" | "updated_at"
>;

export type Role = "player" | "master";

export type SheetFieldType = "text" | "textarea" | "number" | "bar" | "tags";

export type SheetField = {
  id: string;
  label: string;
  type: SheetFieldType;
  /** texto, número, ou valor ATUAL da barra */
  value: string;
  /** só para barras: valor máximo */
  max?: string;
  /** só para "tags": lista de etiquetas */
  tags?: string[];
  icon?: string;
  accent?: string;
};

export type SheetSection = {
  id: string;
  title: string;
  icon?: string;
  /** ocupa a largura toda da página */
  wide?: boolean;
  fields: SheetField[];
};

export type Sheet = {
  name?: string;
  subtitle?: string;
  portrait_url?: string | null;
  sections: SheetSection[];
};
