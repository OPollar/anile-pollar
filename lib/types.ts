export type Story = {
  id: number;
  title: string;
  subtitle: string | null;
  synopsis: string | null;
  cover_url: string | null;
  music_url: string | null;
  theme: string | null;
  heading_font: string | null;
};

export type Chapter = {
  id: string | number;
  number: number;
  title: string;
  summary?: string | null;
  content?: string | null;
  cover_url?: string | null;
  music_url?: string | null;
  published?: boolean;
};

export type Attributes = { for: number; des: number; con: number; int: number; sab: number; car: number };

export type Sheet = {
  id: string | number;
  name: string;
  race: string | null;
  klass: string | null;
  level: number | null;
  hp: number | null;
  attributes: Partial<Attributes> | null;
  backstory: string | null;
  avatar_url: string | null;
};
