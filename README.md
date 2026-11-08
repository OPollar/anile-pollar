# Anile Pollar

Site de história/RPG em **Next.js 14 + Supabase**, com leitor de capítulos, fichas de personagem,
trilha sonora (Howler) e painel do Mestre com editor de texto rico (Tiptap).

## 1. Supabase (uma vez só)

1. **SQL Editor → New query** → cole o conteúdo de `supabase/schema.sql` → **Run**.
2. **Authentication → Users → Add user** → crie seu e-mail e senha de Mestre.
3. No SQL Editor rode (trocando o e-mail):
   ```sql
   insert into public.masters (id, name)
   select id, 'Mestre' from auth.users where email = 'SEU-EMAIL@exemplo.com'
   on conflict (id) do nothing;
   ```
4. **Project Settings → API**: copie a **Project URL** e a chave **anon / public**.
   ⚠️ Nunca use a `service_role` neste projeto, nem a coloque no Render.

## 2. Rodar no seu computador

```bash
cp .env.example .env.local   # preencha as duas variáveis
npm install
npm run dev                  # http://localhost:3000
```

## 3. Deploy no Render

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Environment:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (precisam existir **antes** do build, porque o Next as embute no código).

### Antes de fazer o deploy, confira o repositório

No GitHub, a raiz do repositório precisa mostrar as pastas **`app/`**, **`components/`**, **`lib/`**
e **`supabase/`** ao lado do `package.json`. Se só aparecerem os arquivos soltos, o upload não levou as pastas
e o Render vai dar o erro *"Couldn't find any `pages` or `app` directory"*.
Dica: use `git add . && git commit -m "site" && git push` (ou o GitHub Desktop) em vez de arrastar arquivos no navegador.

## Uso

- `/login` → entra como Mestre → `/admin`
- **Capítulos:** crie, escreva com o editor, marque *Publicado* para os leitores verem. Cada capítulo pode ter capa e trilha própria.
- **Fichas:** cadastre personagens (aparecem em `/personagens`).
- **História e visual:** título, capa, trilha geral, paleta de cores e fonte dos títulos.
