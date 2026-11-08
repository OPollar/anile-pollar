-- =====================================================================
-- Anile Pollar — esquema do banco (Supabase > SQL Editor > New query)
-- Pode rodar mais de uma vez: ele só cria o que ainda não existe.
-- =====================================================================

-- 1) Tabelas ----------------------------------------------------------
create table if not exists public.masters (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.story (
  id int primary key default 1 check (id = 1)
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.character_sheets (
  id uuid primary key default gen_random_uuid()
);

-- 2) Colunas (se a tabela já existia, só acrescenta o que falta) -----
alter table public.story add column if not exists title text not null default 'Anile Pollar';
alter table public.story add column if not exists subtitle text;
alter table public.story add column if not exists synopsis text;
alter table public.story add column if not exists cover_url text;
alter table public.story add column if not exists music_url text;
alter table public.story add column if not exists theme text default 'ember';
alter table public.story add column if not exists heading_font text default 'cinzel';
alter table public.story add column if not exists updated_at timestamptz default now();

alter table public.chapters add column if not exists number int;
alter table public.chapters add column if not exists title text not null default 'Sem título';
alter table public.chapters add column if not exists summary text;
alter table public.chapters add column if not exists content text default '';
alter table public.chapters add column if not exists cover_url text;
alter table public.chapters add column if not exists music_url text;
alter table public.chapters add column if not exists published boolean not null default false;
alter table public.chapters add column if not exists created_at timestamptz not null default now();

alter table public.character_sheets add column if not exists name text not null default 'Sem nome';
alter table public.character_sheets add column if not exists race text;
alter table public.character_sheets add column if not exists klass text;
alter table public.character_sheets add column if not exists level int default 1;
alter table public.character_sheets add column if not exists hp int;
alter table public.character_sheets add column if not exists attributes jsonb default '{}'::jsonb;
alter table public.character_sheets add column if not exists backstory text;
alter table public.character_sheets add column if not exists avatar_url text;
alter table public.character_sheets add column if not exists created_at timestamptz not null default now();

insert into public.story (id) values (1) on conflict (id) do nothing;

-- 3) Quem é Mestre ----------------------------------------------------
create or replace function public.is_master()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.masters where id = auth.uid());
$$;

-- 4) Segurança (RLS): todo mundo lê, só Mestre escreve ----------------
alter table public.masters enable row level security;
alter table public.story enable row level security;
alter table public.chapters enable row level security;
alter table public.character_sheets enable row level security;

drop policy if exists "masters: ler o proprio" on public.masters;
create policy "masters: ler o proprio" on public.masters
  for select using (id = auth.uid());

drop policy if exists "story: leitura publica" on public.story;
create policy "story: leitura publica" on public.story
  for select using (true);
drop policy if exists "story: mestre escreve" on public.story;
create policy "story: mestre escreve" on public.story
  for all using (public.is_master()) with check (public.is_master());

drop policy if exists "chapters: leitura" on public.chapters;
create policy "chapters: leitura" on public.chapters
  for select using (published or public.is_master());
drop policy if exists "chapters: mestre escreve" on public.chapters;
create policy "chapters: mestre escreve" on public.chapters
  for all using (public.is_master()) with check (public.is_master());

drop policy if exists "fichas: leitura publica" on public.character_sheets;
create policy "fichas: leitura publica" on public.character_sheets
  for select using (true);
drop policy if exists "fichas: mestre escreve" on public.character_sheets;
create policy "fichas: mestre escreve" on public.character_sheets
  for all using (public.is_master()) with check (public.is_master());

-- 5) DEPOIS de criar seu usuário em Authentication > Users, rode isto
--    trocando o e-mail pelo seu:
--
-- insert into public.masters (id, name)
-- select id, 'Mestre' from auth.users where email = 'SEU-EMAIL@exemplo.com'
-- on conflict (id) do nothing;
