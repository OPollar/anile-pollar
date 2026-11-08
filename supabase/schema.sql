-- =====================================================================
--  ANILE POLLAR — banco de dados (Supabase)
--  Cole TUDO isto em: Supabase > SQL Editor > New query > Run
--  Pode rodar de novo sem medo: o script é idempotente.
-- =====================================================================

-- ---------- 1. Quem é o Mestre ----------------------------------------
create table if not exists public.masters (
  email text primary key
);
alter table public.masters enable row level security;
-- (sem policies de propósito: ninguém lê essa tabela pela API,
--  só a função is_master() abaixo, que roda com privilégio de sistema)

create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.masters
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_master() to anon, authenticated;

-- ---------- 2. Atualiza updated_at sozinho ----------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- 3. História + personagem + tema (1 linha só) --------------
create table if not exists public.story (
  id int primary key default 1 check (id = 1),
  title text not null default 'Anile Pollar',
  tagline text,
  character_name text not null default 'Anile Pollar',
  theme jsonb not null default
    '{"primary":"#3b4cff","accent":"#a855f7","glow":"#7aa2ff","bg":"#0b0d14","ink":"#e8eaff"}',
  home_background_url text,
  updated_at timestamptz not null default now()
);

drop trigger if exists story_updated_at on public.story;
create trigger story_updated_at before update on public.story
  for each row execute function public.set_updated_at();

insert into public.story (id, title, tagline, character_name)
values (1, 'Anile Pollar', 'Onde os raios contam histórias.', 'Anile Pollar')
on conflict (id) do nothing;

-- ---------- 4. Capítulos ----------------------------------------------
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  slug text not null unique,
  title text not null default 'Novo capítulo',
  subtitle text,
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}',
  background_url text,
  music_url text,
  intro_video_url text,
  typography jsonb not null default
    '{"fontFamily":"lora","fontSize":19,"lineHeight":1.8,"color":"#e8eaff"}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chapters_position_idx on public.chapters (position);

drop trigger if exists chapters_updated_at on public.chapters;
create trigger chapters_updated_at before update on public.chapters
  for each row execute function public.set_updated_at();

-- ---------- 5. Ficha do personagem (Área do Mestre) -------------------
create table if not exists public.character_sheets (
  id int primary key default 1 check (id = 1),
  fields jsonb not null default '[]',
  public boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists sheets_updated_at on public.character_sheets;
create trigger sheets_updated_at before update on public.character_sheets
  for each row execute function public.set_updated_at();

insert into public.character_sheets (id, fields, public) values (
  1,
  '[
    {"id":"f1","label":"Nome","type":"text","value":"Anile Pollar","icon":"⚡","accent":"#7aa2ff"},
    {"id":"f2","label":"Idade","type":"number","value":"","icon":"⏳","accent":"#a855f7"},
    {"id":"f3","label":"Poder","type":"text","value":"","icon":"🌩️","accent":"#3b4cff"},
    {"id":"f4","label":"Aparência","type":"textarea","value":"","icon":"👁️","accent":"#7aa2ff"},
    {"id":"f5","label":"Personalidade","type":"textarea","value":"","icon":"🖤","accent":"#a855f7"},
    {"id":"f6","label":"História","type":"textarea","value":"","icon":"📜","accent":"#3b4cff"},
    {"id":"f7","label":"Fraquezas","type":"textarea","value":"","icon":"🩸","accent":"#7aa2ff"},
    {"id":"f8","label":"Inventário","type":"textarea","value":"","icon":"🎒","accent":"#a855f7"}
  ]'::jsonb,
  true
)
on conflict (id) do nothing;

-- ---------- 6. Capítulo de exemplo (pode apagar depois) ---------------
insert into public.chapters (position, slug, title, subtitle, content, published)
values (
  1, 'capitulo-1', 'Capítulo 1', 'o início',
  '{"type":"doc","content":[
    {"type":"paragraph","content":[{"type":"text","text":"O céu rachou sem aviso. Foi o primeiro raio — e foi o primeiro dia."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Entre no painel do Mestre, apague este texto e escreva a sua história."}]}
  ]}'::jsonb,
  true
)
on conflict (slug) do nothing;

-- ---------- 7. Segurança (RLS) ----------------------------------------
-- Regra de ouro: LEITORES só leem. Só o MESTRE escreve.

alter table public.story enable row level security;
drop policy if exists story_read   on public.story;
drop policy if exists story_insert on public.story;
drop policy if exists story_update on public.story;
create policy story_read   on public.story for select using (true);
create policy story_insert on public.story for insert with check (public.is_master());
create policy story_update on public.story for update using (public.is_master()) with check (public.is_master());

alter table public.chapters enable row level security;
drop policy if exists chapters_read   on public.chapters;
drop policy if exists chapters_insert on public.chapters;
drop policy if exists chapters_update on public.chapters;
drop policy if exists chapters_delete on public.chapters;
create policy chapters_read   on public.chapters for select using (published or public.is_master());
create policy chapters_insert on public.chapters for insert with check (public.is_master());
create policy chapters_update on public.chapters for update using (public.is_master()) with check (public.is_master());
create policy chapters_delete on public.chapters for delete using (public.is_master());

alter table public.character_sheets enable row level security;
drop policy if exists sheets_read   on public.character_sheets;
drop policy if exists sheets_insert on public.character_sheets;
drop policy if exists sheets_update on public.character_sheets;
create policy sheets_read   on public.character_sheets for select using (public or public.is_master());
create policy sheets_insert on public.character_sheets for insert with check (public.is_master());
create policy sheets_update on public.character_sheets for update using (public.is_master()) with check (public.is_master());

-- ---------- 8. Armazenamento de mídia (imagens, mp3, vídeos) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)  -- 50 MB por arquivo (limite do plano grátis)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists media_master_select on storage.objects;
drop policy if exists media_master_insert on storage.objects;
drop policy if exists media_master_update on storage.objects;
drop policy if exists media_master_delete on storage.objects;
create policy media_master_select on storage.objects for select
  using (bucket_id = 'media' and public.is_master());
create policy media_master_insert on storage.objects for insert
  with check (bucket_id = 'media' and public.is_master());
create policy media_master_update on storage.objects for update
  using (bucket_id = 'media' and public.is_master());
create policy media_master_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_master());
