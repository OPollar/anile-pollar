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

export type SheetField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "number";
  value: string;
  icon?: string;
  accent?: string;
};

export type Sheet = {
  fields: SheetField[];
  public: boolean;
};
