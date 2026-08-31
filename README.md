# Zeik Digital — Painel de Prospecção & Vendas

Painel comercial da **Zeik Digital** (sites para pequenos negócios da Zona Sul de São Paulo).
É 100% arquivo estático: **HTML + CSS + JavaScript puro**, sem framework, sem build, sem servidor, sem banco de dados.
Os dados vivem **no seu navegador** (`localStorage`) — nada é enviado para nenhum servidor.

> WhatsApp comercial: **(11) 99014-7836** · e-mail: **zeikdigital@gmail.com**
> Oferta padrão configurável: site **R$ 500–600**, entrega em **48h**, manutenção opcional **R$ 97/mês**.

---

## 1. Publicar na Vercel (5 minutos, só cliques)

1. Entre em [vercel.com](https://vercel.com) e faça login com a sua conta GitHub.
2. **Add New… → Project** → escolha o repositório `ermprodutmaneger/ZEIK-DIGITAL` → **Import**.
3. Nas opções de build, deixe tudo vazio/desligado:
   - **Framework Preset:** `Other`
   - **Build Command:** *(campo vazio)*
   - **Output Directory:** *(campo vazio)*
   - **Install Command:** *(campo vazio)*
   - **Environment Variables:** nenhuma
   (O `vercel.json` já faz isso: `framework: null`, cache por tipo de arquivo e todos os cabeçalhos de segurança.)
4. **Deploy**. Em ~20 segundos você recebe uma URL `https://SEU-PROJETO.vercel.app`.
5. Abra a URL no celular da loja e use **Compartilhar → Adicionar à tela de início**: o painel vira um **app instalável (PWA)** e continua funcionando sem internet.
6. (Opcional) **Settings → Domains** → conecte `painel.seudominio.com.br`.

**Atualizar o painel depois:** faça a mudança no repositório → o Vercel publica sozinho a cada `git push`.
**Trocar de branch/produção:** *Settings → Environments/Production branch*.

> O app está nesta branch: `arena/01a05872-zeik-digital`.
> Para a Vercel publicar direto do `main`, é só mergear o pull request aberto a partir dela.

---

## 2. Testar no computador antes de publicar

```bash
cd ZEIK-DIGITAL
python3 -m http.server 8000
# abra http://localhost:8000/index.html
```

Abrir com duplo clique no arquivo (`file://`) também funciona para olhar o visual, **mas o navegador pode bloquear o
armazenamento local** nesse modo — a mensagem aparece no rodapé da sidebar. Para dados salvos de verdade, use `http://localhost` ou a URL da Vercel.

---

## 2b. Deu `404: NOT_FOUND` na URL da Vercel?

Quase sempre é uma coisa só: **o painel está na branch `arena/01a05872-zeik-digital` e o `main` ainda tem apenas o README** — e a Vercel publica o `main` por padrão, então não encontra `index.html` e devolve `404 NOT_FOUND` (o `ID: gru1::…` que aparece é o bordo da Vercel dizendo “não tem arquivo aqui”).

Escolha **uma** das duas:

**A. Mergear o Pull Request #1 (recomendado, 1 clique)**
1. Abra https://github.com/ermprodutmaneger/ZEIK-DIGITAL/pull/1
2. **Merge pull request** → **Confirm merge**.
3. Volte na Vercel → **Deployments**: o deploy novo aparece sozinho em ~30 s. Pronto.

**B. Apontar o projeto para a branch do painel (sem mexer no `main`)**
1. Na Vercel → **Settings → Environments** (em projetos novos: **Settings → Production Branch**).
2. Troque para `arena/01a05872-zeik-digital` → **Save**.
3. **Deployments → Promote/Redeploy** (ou importe de novo escolhendo essa branch na tela *Import → Git → Branch*).

Se ainda der 404 depois disso, confira nesta ordem:

| Checar | Onde | Tem de estar |
|---|---|---|
| Branch do último deploy | Vercel → Deployments → nome do deploy | `arena/01a05872-zeik-digital` ou `main` **depois** do merge |
| Raiz do projeto | Settings → General → **Root Directory** | `./` (nada de subpasta) |
| Build | Settings → Build & Development | Framework `Other`, Build/Output/Install **vazios** |
| Estado | Deployments → log | **Ready** (não “Error” nem “Queued”) |
| URL | barra do navegador | `https://SEU-PROJETO.vercel.app/` — sem `/main/`, sem hash de preview |
| Cache do navegador | recarregue com Ctrl+Shift+R | o service worker antigo pode segurar a tela velha |

> Depois do primeiro deploy, se você editar qualquer arquivo, é só `git push`: a Vercel publica sozinha.

---

## 3. O que tem dentro

| Tela | Para que serve |
|---|---|
| **Dashboard** | Contadores do mês, funil, segmentos mais quentes, meta de sites e a lista **“precisa de você hoje”**. |
| **Prospecção** | 151 empresas reais da Zona Sul (Capão Redondo, Jd. Ângela, Campo Limpo, Grajaú, M'Boi Mirim). Busca, filtros por bairro/prioridade/status/necessidade, botão **Ligar** (`tel:`) e **WhatsApp** (`wa.me`), script de abordagem pronto, converter em negociação, **Caça-empresas** para ampliar a lista. |
| **Pipeline** | Kanban **Lead → Contatado → Proposta → Ganho → Perdido** com **arrastar e soltar** (mouse e toque com ¼ de segundo). Ao soltar em *Contatado* o painel oferece o **lembrete de follow-up**; em *Proposta* abre o **gerador de proposta**; em *Ganho* o **fechamento** que cria cliente + financeiro + tarefas. |
| **Clientes** | Empresa, contato, segmento, bairro, telefone, valor, status, **manutenção mensal**, notas (domínio, hospedagem, acessos) e up-sell do pacote de Instagram. |
| **Faturamento** | Pago / a receber / total, ticket médio, sites vendidos, gráfico dos **últimos 6 meses**, lançamentos com período (3/6/12 meses/tudo) e **calculadora de lucro com MRR**. |
| **Tarefas** | Agenda com data, ciclos automáticos, abas pendentes/atrasadas/concluídas, atalho de WhatsApp na própria linha. |
| **Scripts** | Abordagem pronta **por segmento**, personalizada com o nome da empresa, com variants para quem **não tem Instagram**, quem **tem feed bagunçado** e resposta para as 8 objeções mais comuns. |
| **Gerador** | Cria o **site do cliente** a partir do modelo: nome, bairro, segmento, telefone, endereço e horários → prévia em tela e **download do `.html`** pronto para hospedar. |
| **Configurações** | Preço, prazo, manutenção, bairros, metas, backup, importar, snapshots, **PIN de bloqueio** e reset. |

Atalhos: `⌘K`/`Ctrl+K` abre a busca de prospecção · `⌘S`/`Ctrl+S` força o salvamento · `⌥⌘Z`/`Ctrl+Alt+Z` desfaz a última mudança · `Esc` fecha modal. No celular há barra inferior e menu lateral com filtro.

### Arquivos

```
index.html              o painel (shell + telas)
modelo-site.html        demo estática do site que você entrega (hero, serviços, sobre, depoimentos, contato, botão flutuante de WhatsApp)
assets/css/style.css    o design system Apple (claro + escuro automático)
assets/js/seed.js       151 empresas reais + 13 segmentos com scripts + 8 objeções
assets/js/store.js      estado, persistência, undo, snapshots, estatísticas, PIN
assets/js/site-template.js  o gerador de site (ZeikSite.gerar)
assets/js/ui.js         navegação, modais, toasts, WhatsApp/Maps, atalhos, lock
assets/js/app.js        as 9 telas + drag & drop do Kanban
assets/js/modals.js     CRUD, propostas, gerador, backup, importação, snapshots
manifest.webmanifest    PWA instalável   ·   sw.js  ·  public/icons/  · vercel.json  · robots.txt
```

Ordem dos `<script>` é obrigatória: `seed → store → site-template → ui → app → modals`.

---

## 4. As suas proteções (o que já vem ligado)

**Dados / não perder trabalho**

- **Autosave** depois de cada edição + gravação forçada ao fechar a aba; o rodapé da sidebar mostra **“Dados salvos neste navegador”** (ou “Atenção: verifique o aviso” quando algo não gravou).
- **Desfazer** em praticamente toda ação destrutiva — o toast traz o botão **Desfazer** e há 25 níveis de histórico (`App.undo`, também via `⌘Z`/`Ctrl+Z`).
- **Snapshots automáticos** a cada 25 alterações (até 12 cópias, ~2,4 MB no total) + botão **📸 Snapshot** para guardar antes de uma maratoninha de ligações. Restaure qualquer um em Configurações.
- **Backup `.json` completo** (empresas, pipeline, clientes, financeiro, tarefas) em um clique e **importação** por arquivo ou colando o texto — inclusive para restaurar um arquivo que você baixou na semana passada.
- **Exportar CSV** (prospectados / clientes / financeiro) com `;` e BOM, abre direto no Excel brasileiro.
- Se o `localStorage` aparecer corrompido, o painel **guarda a cópia bruta** numa chave `.corrompido.<data>`, recomeça pela lista-base e avisa — ele nunca apaga em silêncio.
- Armazenamento cheio (modo privado/limite): mensagem clara em vez de tela branca.
- **Tarefas atrasadas** são empurradas para hoje com anotação de quem empurrou.

**Segurança do deploy**

- **CSP** `script-src 'self'` (nenhum script inline, nenhum JS de terceiro), `nosniff`, `X-Frame-Options SAMEORIGIN`, `frame-ancestors 'self'`, `base-uri`/`form-action` presos, `object-src 'none'`, HSTS com `preload`, `Referrer-Policy: no-referrer`, `COOP`/`CORP` same-origin e `Permissions-Policy` cortando câmera/microfone/geolocalização/pagamentos. Os mesmos cabeçalhos estão no `vercel.json` **e** no `<meta>` do `index.html` (funciona até em servidor mal configurado).
- **Fora do Google:** `X-Robots-Tag: noindex, nofollow` + `robots.txt` com `Disallow: /`. Seu painel de vendas não aparece em busca.
- **PIN opcional** (Configurações → Bloqueio): 4–8 dígitos, guardados como **hash SHA-256** (nunca em texto puro), com bloqueio de 60 s depois de 5 tentativas. Proteção de ombro em balcão, não é login de servidor.
- **Zero dados seus na nuvem de terceiros:** sem analytics, sem fonte externa, sem CDN, sem cookie. Só você, o navegador e a sua conta Vercel.
- Para **proteger a URL com login de verdade**, use *Project Settings → Deployment Protection* na Vercel (Vercel Authentication). Dependendo do plano, isso vale para a URL de produção também — é a única camada que o painel estático não pode oferecer sozinho.

---

## 5. Rotina sugerida (dá 20 minutos por dia)

1. Abra **Prospecção** → filtro **Sem site (venda fácil)** ou **Sem Instagram (combo)**.
2. Toque em **🧠 Script** → **Copiar** → **WhatsApp**. O texto já vai com o nome da pessoa, o bairro, o serviço e o preço da tela de Configurações.
3. Marque **Contatado** no Kanban → o painel pergunta em quantos dias lembrar → cria a tarefa sozinho.
4. Respondeu? **📄 Proposta** → marque o que entra (site, Instagram criado/organizado, Google Meu Negócio, manutenção) → **Copiar tudo** → mande no WhatsApp.
5. Fechou? Arraste para **Ganho** → confirme valor, entrada e manutenção. Cliente, lançamento e tarefa de entrega entram sozinhos, e o **🎉** aparece.
6. **Gerador** → escolha o cliente → **Prévia** → **Baixar HTML** → suba na hospedagem. 48h cumpridas.
7. Sexta-feira: **Configurações → Baixar backup .json** e guarde no Drive. Uma vez por mês: **↻ Atualizar lista-base** para completar telefone/Instagram das fichas que você ainda não tocou.

---

## 6. Sobre os dados da lista

As empresas vieram de diretórios públicos (Fresha, Apontador, Encontra Capão Redondo / Campo Limpo, Guia Folha, Grajaú.net e sites das próprias empresas). **Telefone e endereço podem estar desatualizados** — por isso as fichas sem telefone vêm marcadas e o botão **🗺️ Maps** existe. Antes de ligar, confira em 20 segundos; o painel já marca o que a pesquisa não mostrou (ex.: “nenhum Instagram aparece no anúncio — confirmar no Maps”).

Os prospects **não** contêm nada de LGPD sensível: são dados de estabelecimentos abertos ao público. Ainda assim, trate a lista como material interno — o painel não é indexável e os dados não saem do aparelho.

---

## 7. Personalizar rápido

- Preço, prazo, manutenção, WhatsApp, e-mail, nome e bairros: **Configurações** (salvam sozinhos).
- Roteiros por segmento e objeções: `assets/js/seed.js` (os campos `{{empresa}}`, `{{contato}}`, `{{bairro}}`, `{{preco}}`, `{{manut}}`, `{{telZeik}}` são substituídos na hora).
- Visual do site entregue: tudo está em `assets/js/site-template.js` (função `ZeikSite.gerar`). Mude cores/textos lá e o **Gerador** do painel já entrega o site novo. O `modelo-site.html` é só a demonstração aberta no navegador — para atualizá-lo, gere pelo Gerador e salve o `.html` baixado por cima dele.
- Cores/tipografia: `assets/css/style.css` — a paleta é a mesma do site da Apple (fundo `#f5f5f7`, cards de vidro `rgba(255,255,255,.72)` com `backdrop-filter: blur(40px) saturate(180%)`, azul `#0071e3`, cantos 18px, botões 980px, tema escuro automático). Vale para as duas frentes: o painel e o site que você entrega.
