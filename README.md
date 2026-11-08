# ⚡ Anile Pollar — plataforma de histórias interativas

Site 100% online: **GitHub** (código) → **Render** (hospeda o site) → **Supabase** (banco, login do Mestre e arquivos).
Nada roda na sua máquina.

**O que tem:** login do Mestre · editor de capítulos (fonte, tamanho, cor, espaçamento, alinhamento…) · imagem de fundo por capítulo · trilha MP3 com player e volume · áudios no meio do texto · vídeo de abertura em tela cheia com botão **Pular** · imagens PNG/JPEG que flutuam, respiram e reagem ao mouse · raios e partículas · tema de cores do personagem · tela de carregamento animada · **Área do Mestre** (ficha editável).

---

## PASSO 1 — Supabase (banco + login + arquivos)

1. Entre em <https://supabase.com> → **New project**. Anote a senha do banco (não vai precisar dela depois).
2. Menu **SQL Editor** → **New query** → abra o arquivo `supabase/schema.sql` deste projeto, copie **tudo**, cole e clique **Run**. Deve aparecer "Success".
3. Menu **Authentication → Users → Add user → Create new user**: coloque **seu e-mail e uma senha** e marque **Auto Confirm User**. Esse é o seu login de Mestre.
4. Menu **Authentication → Sign In / Providers** → desligue **"Allow new users to sign up"** (ninguém mais pode criar conta).
5. Volte ao **SQL Editor**, nova query, e rode (trocando pelo SEU e-mail, o mesmo do passo 3):
   ```sql
   insert into public.masters (email) values ('seu@email.com');
   ```
6. Menu **Project Settings → API** (ou "API Keys"). Copie dois valores:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public key** (ou "publishable key")

## PASSO 2 — GitHub

1. Em <https://github.com> → **New repository** (nome: `anile-pollar`, pode ser privado).
2. Na página do repositório: **uploading an existing file** → arraste **todo o conteúdo desta pasta** (menos `node_modules`, se existir) → **Commit changes**.
   - Confira se subiram também: `package.json`, `package-lock.json`, `.node-version`, `.gitignore`, as pastas `app`, `components`, `lib`, `supabase` e o `middleware.ts`.
   - ⚠️ Se você já tinha arquivos do Gemini no repositório, **apague-os antes** (pasta `app/(leitor)`, `prisma/` etc.) para não misturar.

## PASSO 3 — Render (hospedagem)

1. Em <https://render.com> → **New → Web Service** → conecte o GitHub e escolha o repositório.
2. Preencha:
   | Campo | Valor |
   |---|---|
   | Runtime | **Node** |
   | Build Command | `npm ci && npm run build` |
   | Start Command | `npm start` |
   | Instance type | Free (serve para começar) |
3. Em **Environment Variables** adicione **antes de criar**:
   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | o *Project URL* do passo 1.6 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a *anon key* do passo 1.6 |
   | `NODE_VERSION` | `20` |
4. **Create Web Service**. Quando o log mostrar "Your service is live", abra o link `https://….onrender.com`.

> ⚠️ As duas variáveis `NEXT_PUBLIC_…` são gravadas **na hora do build**. Se você mudar alguma depois, faça **Manual Deploy → Clear build cache & deploy**.

## Como usar

- Entre em **`/login`** (ou pelo botão MESTRE no canto da home) com o e-mail/senha do passo 1.3.
- **Painel** → *Novo capítulo* → escreva, insira **Imagem** (ganha animação sozinha; clique nela para trocar o efeito) e **Áudio** (entra no ponto do cursor, até no meio de um parágrafo).
- Barra lateral do editor: fundo, trilha MP3, vídeo de abertura, fonte/tamanho/espaçamento do capítulo. **Ctrl+S** salva.
- Capítulo só aparece para leitores quando está **Publicado** (rascunhos só você vê).
- **História & tema**: título, nome do personagem e as cores do site inteiro (com prévia ao vivo e paletas prontas).
- **Ficha**: em qualquer capítulo, botão fixo **ÁREA DO MESTRE**. Logado, você edita os valores e usa *Personalizar campos* para criar/renomear/colorir campos. Leitores só veem (ou nem isso, se desmarcar "Leitores podem ver a ficha").

## Limites e dicas

- **Arquivos até 50 MB** cada (limite do Supabase grátis). Use MP3 ~128 kbps e vídeos MP4 comprimidos (H.264).
- O Render grátis **"dorme"** após 15 min sem visitas e a primeira visita demora ~1 min. Para evitar, use um monitor gratuito (ex.: UptimeRobot) pingando o site a cada 10 min, ou o plano pago.
- Navegadores só liberam som depois de um clique — por isso existe o botão **ENTRAR** antes da história.

## Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Faixa amarela "não está ligado ao Supabase" | Faltam as variáveis no Render → adicione e faça *Clear build cache & deploy*. |
| Faixa "não consegui ler a história" | O `schema.sql` não foi rodado (passo 1.2). |
| Login diz "não está cadastrado como Mestre" | Faltou o `insert into masters` (passo 1.5) ou o e-mail está diferente. |
| Erro ao salvar / enviar arquivo | Você não está logado como Mestre, ou o arquivo passa de 50 MB. |
| Build falha no Render por memória | Plano grátis tem 512 MB; tente de novo ou use o plano Starter só para o build. |

## Segurança (resumo)

Quem manda é o banco (RLS): leitores só **leem** capítulos publicados; só o e-mail da tabela `masters` consegue escrever ou enviar arquivos. A chave `anon` é pública por natureza e não dá poder de escrita.

## Estrutura

```
app/                 páginas (home, /capitulo/[slug], /login, /admin/*)
components/          loading, música, vídeo, atmosfera, ficha, painel
lib/editor/          extensões do Tiptap (imagem viva, áudio inline, tamanho, linhas)
lib/supabase/        clientes do Supabase (navegador e servidor)
supabase/schema.sql  tabelas, segurança e armazenamento
```
