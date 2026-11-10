# ⚡ Anile Pollar — plataforma de histórias interativas

Site 100% online: **GitHub** (código) → **Render** (hospeda o site) → **Supabase** (banco, login do Mestre e arquivos).
Nada roda na sua máquina.

**O que tem:** login de Player e Mestre · editor de capítulos (fonte, tamanho, cor, espaçamento, alinhamento…) · imagem de fundo por capítulo · trilha MP3 com player e volume · áudios no meio do texto · vídeo de abertura em tela cheia com botão **Pular** · imagens PNG/JPEG que flutuam, respiram e reagem ao mouse · raios e partículas · tema de cores do personagem · tela de carregamento animada · ficha em pergaminho · fumaça · compressão automática de imagens.

---

## Quem é quem

| Papel | O que faz |
|---|---|
| **Player** | Escreve a história: capítulos, cenário (fundo, música, vídeo), tema de cores, mídia. Também edita a ficha. |
| **Mestre** | Só **lê** a história e tem acesso à **ficha** (pode editá-la). Não mexe em capítulos. |
| Visitante (sem login) | Lê os capítulos publicados. Não vê a ficha. |

## PASSO 1 — Supabase (banco + login + arquivos)

1. Entre em <https://supabase.com> → **New project**.
2. **SQL Editor → New query** → copie **tudo** de `supabase/schema.sql` → **Run**.
   - Se você já tinha rodado a versão anterior, **rode este arquivo de novo**: ele atualiza o banco sozinho e transforma quem estava como "Mestre" antigo em **Player**.
3. **Authentication → Users → Add user → Create new user** (marque **Auto Confirm User**): crie **um usuário para o Player** e **outro para o Mestre** (e-mails e senhas diferentes).
4. **Authentication → Sign In / Providers** → desligue **"Allow new users to sign up"**.
5. No **SQL Editor**, cadastre os papéis (troque pelos e-mails certos):
   ```sql
   insert into public.members (email, role) values
     ('email-do-player@exemplo.com', 'player'),
     ('email-do-mestre@exemplo.com', 'master')
   on conflict (email) do update set role = excluded.role;
   ```
6. **Project Settings → API**: copie **Project URL** e **anon/publishable key**.

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
   | Build Command | `npm install && npm run build` |
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

- **Player:** `/login` → **Painel** → *Novo capítulo*. Escreva, insira **Imagem** (anima sozinha; clique nela para trocar o efeito) e **Áudio** (no ponto do cursor, até no meio do parágrafo). Barra lateral: fundo, trilha MP3, vídeo de abertura, fonte/tamanho/espaçamento. **Ctrl+S** salva. *História & tema* muda título e as cores do site todo.
- **Mestre:** entra em `/login` e lê normalmente (só capítulos **publicados**).
- **Ficha** (Player e Mestre): botão fixo no canto — **MINHA FICHA** (Player) / **ÁREA DO MESTRE** (Mestre). É uma folha de pergaminho com retrato, barras de Vida/Energia/XP (com − e +), atributos, etiquetas de habilidades e fraquezas, textos com linhas de caderno. **Tudo salva sozinho.** Em *Personalizar ficha* dá para criar/renomear/mover/colorir seções e campos, e escolher o tipo (texto, número, barra, etiquetas).

## Imagens: compressão automática

Toda imagem enviada (fundo, cenário, imagens do texto, retrato) é **comprimida no navegador antes de ser salva**: reduzida para no máx. 2400 px (retrato 1200 px) e convertida para **WebP**, mirando < 6 MB, sempre bem abaixo dos 50 MB. PNG com transparência continua com transparência. GIFs não são alterados.
Quem "descomprime" é o próprio navegador do leitor, automaticamente, ao mostrar a imagem — não precisa de nada extra. A compressão é *com perdas leves* (visualmente quase igual) e não dá para voltar ao arquivo original, então guarde o original no seu computador.
**Áudio e vídeo não são comprimidos pelo site** — precisam ter até 50 MB (MP3 ~128 kbps, MP4 H.264).

## Limites e dicas

- **Arquivos até 50 MB** cada (limite do Supabase grátis). Use MP3 ~128 kbps e vídeos MP4 comprimidos (H.264).
- O Render grátis **"dorme"** após 15 min sem visitas e a primeira visita demora ~1 min. Para evitar, use um monitor gratuito (ex.: UptimeRobot) pingando o site a cada 10 min, ou o plano pago.
- Navegadores só liberam som depois de um clique — por isso existe o botão **ENTRAR** antes da história.

## Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Faixa amarela "não está ligado ao Supabase" | Faltam as variáveis no Render → adicione e faça *Clear build cache & deploy*. |
| Faixa "não consegui ler a história" | O `schema.sql` não foi rodado (passo 1.2). |
| Login diz "não tem papel de Player nem de Mestre" | Faltou o `insert into public.members` (passo 1.5) ou o e-mail está diferente. |
| Erro ao salvar / enviar arquivo | Você não está logado como Mestre, ou o arquivo passa de 50 MB. |
| Build falha no Render por memória | Plano grátis tem 512 MB; tente de novo ou use o plano Starter só para o build. |

## Segurança (resumo)

Quem manda é o banco (RLS): visitantes só **leem** capítulos publicados; só o **Player** escreve capítulos/tema/mídia; **Player e Mestre** (tabela `members`) leem e editam a ficha. A chave `anon` é pública por natureza e não dá poder de escrita.

## Estrutura

```
app/                 páginas (home, /capitulo/[slug], /login, /admin/*)
components/          loading, música, vídeo, atmosfera, ficha, painel
lib/editor/          extensões do Tiptap (imagem viva, áudio inline, tamanho, linhas)
lib/supabase/        clientes do Supabase (navegador e servidor)
supabase/schema.sql  tabelas, segurança e armazenamento
```
