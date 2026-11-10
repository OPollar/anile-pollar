-- =====================================================================
--  ANILE POLLAR — banco de dados (Supabase)  ·  versão 2 (Player + Mestre)
--  Cole TUDO isto em: Supabase > SQL Editor > New query > Run
--  Pode rodar de novo sem medo (idempotente) e também ATUALIZA o banco
--  da versão 1: quem estava em "masters" vira PLAYER automaticamente.
--
--  PAPÉIS
--    player = quem ESCREVE a história: capítulos, cenário, tema, mídia, ficha.
--    master = quem LÊ a história e tem acesso à ficha (pode editá-la).
--    (visitante sem login = só lê capítulos publicados; não vê a ficha)
-- =====================================================================

-- ---------- 1. Membros (quem tem papel) -------------------------------
create table if not exists public.members (
  email text primary key,
  role  text not null check (role in ('player', 'master'))
);
alter table public.members enable row level security;
-- (sem policies de propósito: ninguém lê essa tabela pela API;
--  só as funções abaixo, que rodam com privilégio de sistema)

-- Migração da v1: quem estava em "masters" (escrevia a história) vira player.
do $$
begin
  if to_regclass('public.masters') is not null then
    insert into public.members (email, role)
    select lower(email), 'player' from public.masters
    on conflict (email) do nothing;
  end if;
end $$;

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.members
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

create or replace function public.is_player() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.my_role() = 'player', false); $$;

create or replace function public.is_master() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.my_role() = 'master', false); $$;

-- Player OU Mestre
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public
as $$ select public.my_role() is not null; $$;

grant execute on function public.my_role()   to anon, authenticated;
grant execute on function public.is_player() to anon, authenticated;
grant execute on function public.is_master() to anon, authenticated;
grant execute on function public.is_member() to anon, authenticated;

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

-- ---------- 5. Ficha do personagem ------------------------------------
-- A ficha nova fica na coluna "data" (seções, barras, retrato...).
-- Se estiver vazia, o site usa uma ficha-modelo pronta.
create table if not exists public.character_sheets (
  id int primary key default 1 check (id = 1),
  fields jsonb not null default '[]',
  public boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.character_sheets add column if not exists data jsonb;

drop trigger if exists sheets_updated_at on public.character_sheets;
create trigger sheets_updated_at before update on public.character_sheets
  for each row execute function public.set_updated_at();

insert into public.character_sheets (id) values (1) on conflict (id) do nothing;

-- ---------- 6. Capítulo de exemplo (pode apagar depois) ---------------
insert into public.chapters (position, slug, title, subtitle, content, published)
values (
  1, 'capitulo-1', 'Capítulo 1', 'o início',
  '{"type":"doc","content":[
    {"type":"paragraph","content":[{"type":"text","text":"O céu rachou sem aviso. Foi o primeiro raio — e foi o primeiro dia."}]},
    {"type":"paragraph","content":[{"type":"text","text":"Entre no painel do Player, apague este texto e escreva a sua história."}]}
  ]}'::jsonb,
  true
)
on conflict (slug) do nothing;

-- ---------- 7. Segurança (RLS) ----------------------------------------
-- Escreve a história: SÓ o PLAYER.  Ficha: PLAYER e MESTRE.

alter table public.story enable row level security;
drop policy if exists story_read   on public.story;
drop policy if exists story_insert on public.story;
drop policy if exists story_update on public.story;
create policy story_read   on public.story for select using (true);
create policy story_insert on public.story for insert with check (public.is_player());
create policy story_update on public.story for update using (public.is_player()) with check (public.is_player());

alter table public.chapters enable row level security;
drop policy if exists chapters_read   on public.chapters;
drop policy if exists chapters_insert on public.chapters;
drop policy if exists chapters_update on public.chapters;
drop policy if exists chapters_delete on public.chapters;
create policy chapters_read   on public.chapters for select using (published or public.is_player());
create policy chapters_insert on public.chapters for insert with check (public.is_player());
create policy chapters_update on public.chapters for update using (public.is_player()) with check (public.is_player());
create policy chapters_delete on public.chapters for delete using (public.is_player());

alter table public.character_sheets enable row level security;
drop policy if exists sheets_read   on public.character_sheets;
drop policy if exists sheets_insert on public.character_sheets;
drop policy if exists sheets_update on public.character_sheets;
create policy sheets_read   on public.character_sheets for select using (public.is_member());
create policy sheets_insert on public.character_sheets for insert with check (public.is_member());
create policy sheets_update on public.character_sheets for update using (public.is_member()) with check (public.is_member());

-- ---------- 8. Armazenamento de mídia (imagens, mp3, vídeos) ----------
-- Só o PLAYER envia arquivos de cenário; o MESTRE também pode enviar o
-- retrato do personagem (pasta "sheet/").
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)  -- 50 MB por arquivo (limite do plano grátis)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists media_master_select on storage.objects;
drop policy if exists media_master_insert on storage.objects;
drop policy if exists media_master_update on storage.objects;
drop policy if exists media_master_delete on storage.objects;
drop policy if exists media_member_select on storage.objects;
drop policy if exists media_member_insert on storage.objects;
drop policy if exists media_member_update on storage.objects;
drop policy if exists media_member_delete on storage.objects;

create policy media_member_select on storage.objects for select
  using (bucket_id = 'media' and public.is_member());
create policy media_member_insert on storage.objects for insert
  with check (bucket_id = 'media' and (public.is_player() or (public.is_master() and name like 'sheet/%')));
create policy media_member_update on storage.objects for update
  using (bucket_id = 'media' and public.is_player());
create policy media_member_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_player());

-- ---------- 9. Limpeza da v1 -------------------------------------------
drop table if exists public.masters;
