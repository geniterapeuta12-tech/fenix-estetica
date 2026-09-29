# 🎛️ FÊNIX ESTÉTICA — MANUAL DE GESTÃO DO SITE
*Fase iniciada em 26/09/2026 · Infraestrutura: 100% Cloudflare · Versão: R48 (v1.6.33)*

---

## 🔗 Links oficiais (sempre válido)
- **Repositório**: https://github.com/geniterapeuta12-tech/fenix-estetica
- **Histórico de versões** (cada atualização = 1 registro): https://github.com/geniterapeuta12-tech/fenix-estetica/commits/main
- **Downloads (EXE/APK)**: https://github.com/geniterapeuta12-tech/fenix-estetica/releases/latest
- **Site no ar**: https://geniterapeuta12-tech.github.io/fenix-estetica/
- **Nuvem**: https://dash.cloudflare.com → Storage & Databases → D1 → fenix-estetica

*Regra da casa: toda versão nova é publicada no repositório (commit próprio) e o link é re-passado aqui na conversa.*

## 🗺️ Mapa do sistema (quem é quem)

| Peça | O que é | Endereço / onde vive |
|---|---|---|
| **Site** | A página do app (fachada) | https://geniterapeuta12-tech.github.io/fenix-estetica/ |
| **Servidor** | Worker `fenix-api` (Cloudflare) — login, dados, fotos, link público | https://fenix-api.geniterapeuta12.workers.dev |
| **Banco** | D1 `fenix-estetica` (Cloudflare) — 5 GB grátis | ligado ao Worker |
| **Downloads** | EXE + APK na release v1.6.9 do GitHub (EXE auto-atualizável c/ app v1.6.9; relatório PDF personalizado; Mensagens estilo Telegram) | github.com/geniterapeuta12-tech/fenix-estetica/releases/latest |
| **Repositório** | Fonte de tudo (app, servidor, SQLs, dumps) | github.com/geniterapeuta12-tech/fenix-estetica (branch main) |
| **APK** | Android — carrega o site do Pages (se atualiza sozinho) | release v1.6 |

## 📊 Raio-X da primeira ronda (26/09/2026)
- Servidor: HTTP 200 · 88 ms ✅
- Banco: 6,5 MB de 5.120 MB (**0,13%**) ✅
- Dados: 18 clientes · 22 pacotes · 135 sessões · 24 pagamentos · 9 documentos · 49 fotos ✅
- Fotos: **49/49 no armazém · 0 em base64 no banco** (migração R16 concluída sozinha) 🌟
- Login da clínica: `clinicaprincipal@clinicas.fenix.app` (senha definida por você no 1º acesso)

## 🔁 Como as atualizações fluem
**Mudança no app** (telas, textos, funções):
1. Editar `index.html` → rodar os 451 testes → copiar pra `fenix-estetica.html` e `tests/`
2. Publicar no GitHub → Pages atualiza sozinho → **site e APK pegam na hora**
3. EXE: injetar o novo `index.html` no zip da release

**Mudança no servidor** (Worker — regras de nuvem, fotos, login):
1. Editar `fenix-cloudflare/worker.js` → deploy via API da Cloudflare
2. Espelhar em `supabase/cloudflare-worker.js` + commit

**Pedidos prontos que você pode me fazer a qualquer momento:**
- *"Como está o site?"* → rodo o raio-X completo (1 min)
- *"Quanto o banco está usando?"* → consulta na hora
- *"Atualiza o app com X"* → edito, testo 451 checks e publico
- *"Backups estão sendo feitos?"* → confiro a tabela `backups` da nuvem
- *"Cadastra/ajusta algo nos dados"* → comando SQL direto no D1

## 🚨 Plano de emergência (torcemos pra nunca usar)
- **Banco corrompido/apagado?** → `supabase/cloudflare-schema.sql` (23 tabelas) + `supabase/cloudflare-import.sql` (todos os dados + fotos) reconstroem tudo em minutos
- **Worker fora?** → redeploy do `fenix-cloudflare/worker.js` (1 comando, guardado no repo)
- **Site fora?** → Pages redesenha sozinho do repo a cada push
- **Chave interna do servidor**: `fenix-cloudflare/fenix-secret.txt` (não compartilhar)

## 💳 Custos
Tudo em plano grátis: **R$ 0/mês**. Plano pago da Cloudflare (US$ 5/mês ≈ R$ 30) só se um dia quiser backup noturno no servidor (cron) — não é necessário hoje.

## 📈 Limites atuais (e o quanto usamos)
| Limite free | Uso hoje |
|---|---|
| 5 GB no banco | 0,13% |
| 100 mil req/dia no servidor | <1% |
| 5 mi leituras/dia no banco | ~0,1% |
| Sem pausa automática | — (nunca) |

*Quando pedir "como está o site?", eu comparo com esta tabela e aponto qualquer desvio.*

## 📜 Regra das versões (desde R23)
**Release nunca é apagada** — cada versão é adicionada à lista em `VERSOES.md` (repositório) e à release do GitHub. Links de download (`/releases/latest/...`) são fixos para sempre.
- **EXE desde v1.6.8:** se atualiza sozinho (carrega a nuvem; sem internet usa a versão interna). Só reinjeta pacote se o próprio app avisar.

## 🔔 Regra da versão (desde R28)
Em CADA versão nova: (1) atualizar `APP_VERSAO` no index.html; (2) atualizar `versao.json` no repo (versão + melhorias) — é ele que o app consulta pra avisar de atualização.
## R36 (27/09/2026) — app do cliente + planilha + conserto de dados
- **App da cliente (clients/index.html) refeito**: navegação por ABAS (Início/Pacotes/Sessões/Pagamentos) com os SVGs idênticos aos da gestão (i-home/i-box/i-cal/i-fin); SEM barra lateral e SEM os itens travados "🔒 clínica"; mantém cli=, ate=, sem_acesso; impressão mostra todas as abas.
- **Planilha**: renomear (✏️ inline, sem prompt() — Electron proíbe); selecionar linha/coluna pelos cabeçalhos (números 1-2-3 / letras A-B-C, plnLetra) com realce dourado; – Linha/– Coluna apagam a SELEÇÃO (sem seleção = última, como antes).
- **CONSERTE DE DADOS (import)**: booleans foram importados como TEXTO e truncados ('true'→'tru', 'false'→'fals') — isso fazia TODA sessão aparecer feita ("8/8") e cliente pausada aparecer ativa. Corrigido no D1 (sessoes.feita/pago, clientes.acesso, alarmes.ativa, documentos.fav → inteiros 1/0; conferido com CSV: 81 feitas/54 não). Worker: RPC fenix_cliente_pub aceita 1/'true'/'tru' etc.; app: mapSess/mapCliente blindados (texto 'false' NÃO é mais truthy; acesso 0/'fals'/'0' = pausado). NÃO re-importar sem converter booleans!
- **FRAGILIDADE SNAPSHOT**: zip de ~101 MB em fenix-apps/ pode corromper/retroceder no snapshot (teto ~128 MB). Fonte da verdade = release no GitHub; se o zip local estiver estranho, re-baixar de releases/download/v1.6.X/ antes de usar como base.
## R52.1 — Fênix Center como APP (29/09/2026)
- center/index.html REFEITO: design premium (Playfair+Montserrat, aurora dourada, cards vidro, timeline de versões com linha, toasts, reveal) — SEM svg phoenix do app (ícone PNG próprio).
- PWA: manifest.json + sw.js (cache-first) → instalável pelo navegador também.
- Ícone: center/icone-512.png (gerado) + 192.
- APP Android: center/fenix-center.apk = br.fenix.center vc1 1.0.0 (ícone próprio, ponte FenixCenterApp{statusFenix,abrirFenix→launch intent br.fenix.estetica}; QUERY_ALL_PACKAGES). Fonte: /home/user/center-src/MainActivity.java.
- APP Windows: Fenix-Center-Windows.zip = base Electron com main.js PRÓPRIO (will-navigate → shell.openExternal: fenix:// abre o Fênix registrado; http → navegador), exe renomeado Fenix-Center.exe, bat registra fenixcenter://. Asset na release v1.6.37.
- RELEASED: asset Fenix-Center-Windows.zip (sha 43e992a3…) na v1.6.37.
## R52 — v1.6.37 (29/09/2026)
- Abas: popup com classe própria .abas-modal (fundo segue tema; SEM pmcard — causa das letras invisíveis no claro); chips/cards com var(--txt/--muted).
- Login único: btnWelcomeGo auto-entra no ultUsu() se ainda existir em getUsu(); welcomeSub mostra "Entrando como X"; trocar continua pedindo senha (Equipe›Usuários usuTrocar).
- Termos completos: viewTermos com 4 sub-abas (.tsub/.tdoc) — Termos, Privacidade (LGPD), Arquivos/Mensagens/Backup, Fênix Clients — accordions .faq.
- Central de Ajuda: viewAjuda + navDados data-dsub="ajuda" (VIEWS/dono/dd/title/toggle) + busca #ajudaBusca filtra .faq e esconde grupos vazios.
- Grupos: fenix_grupos {gs}; gid 'grupo:<nome-slug>'; máx 5 (eu+4, cap no change e no save); anúncio por mensagem para='__grupos' texto='__GRUPO__'+json (grpAnuncia) e absorção no msgPuxa (grpAbsorve; linhas __grupos filtradas fora do chat/noti); chat de grupo pinta com tgquem (quem falou); notiMsgs aceita para grupo:* com nome do grupo (bug corrigido pelo teste).
- Fênix Center: center/index.html standalone (phoenix symbol inline, lista releases via API, botões APK/EXE/Abrir app); botão 🦅 em Dados›Sistema.
- APK vc17: intent-filter scheme fenix (VIEW/BROWSABLE). EXE: .bat registra HKCU\Software\Classes\fenix → abre o exe instalado.
- Fonte Java canônico: /home/user/apk-src; manifest canônico: /home/user/apk-manifest-vc17.xml.
## R51 — v1.6.36 (29/09/2026)
- Abas: CSS refeito com cores FIXAS por tema (!important vence .txtfix): chips #f7f2e3/#241f13, popup (pmcard sempre escuro) #f7f2e3/#b9b09a; chips maiores com sombra/hover; cards com ícone gradiente.
- Ponte APK: statusPerms() → {"noti":bool,"arq":bool} (NotificationManager.areNotificationsEnabled + checkSelfPermission READ_MEDIA_IMAGES/READ_EXTERNAL_STORAGE); abrirConfig() → ACTION_APPLICATION_DETAILS_SETTINGS. Fonte salvo em /home/user/apk-src.
- Dados›Sistema›Permissões do aparelho: #permsStatus ao vivo (showDados('sistema') repinta), botões pedir/⚙️config/testar arquivo; repaint 2,5s pós-pedido. Sem ponte: usa Notification.permission.
- Fonte Java completo em /home/user/apk-src/br/fenix/estetica/MainActivity.java (recompilar com javac -encoding UTF-8 --release 8).
## R50 — v1.6.35 (29/09/2026)
- Abas: botão ⊞ (btnAbasTodas) abre abasModal2 com grade (.abas-grid/.abas-card) — abrir/apagar/salvar atual; contadores e dedupe mantidos.
- Temas: 2 acentos novos acqua (#2ba3b0/#1d7d88) e lilas (#8b7bd8/#6f5fd1) — CSS dark+light completos, swatches, botões accAcqua/accLilas, applyAccent OK list.
- Notificações de sistema: notiSistema (new Notification quando granted && document.hidden); pedido automático 3,5s após load; botão 🔔 btnNotiPerm na Aparência (+notiPermPinta status).
- Dados›Sistema: painel Permissões do aparelho (btnPermsAparelho chama window.FenixApp.pedirPerms + Notification.requestPermission; btnArqTeste testa seletor).
- APK vc15: MainActivity.java NOVO (fonte em /tmp/apkb/prj/src) — onShowFileChooser (anexos!), DownloadManager, addJavascriptInterface FenixApp{pedirPerms,baixar}, perms POST_NOTIFICATIONS/READ_MEDIA (33+) e READ/WRITE_EXTERNAL (≤32); manifest com 6 permissions; dex 8.400 B.
## R49 — v1.6.34 (28/09/2026)
- Pastas REMOVIDA do sistema (botão na Gestão + modo + view + código; dados locais ficam, sem UI).
- Abas simplificadas: chips na barra lateral (+ adiciona tela atual dedupe por título máx 12; clique abre; × remove) — DIVIDIR TELA removida (modal, splitPane, zoom logic); js: ABAS={ls}, abaSnapshot/abaAbre/abasPinta refeitos.
- Extras: Roleta como cartão (.fncard #rolOpen) — handler liga em gestao(extras view) e modo extras; clique vai p/ modo extras.
- Roleta de NÚMEROS: toggle Nomes/Números (rr.tipo; 24/100 cap; valida número; importa .txt via FileReader regex -?\d+([,.]\d+)?).
- Notificações de mensagem: poll msgPuxa sempre (5s); fora da equipe → notiMsgs (dedupe NOTI_VISTOS, máx 3, 6,5s, clique abre conversa MSG.peer=de).
- Aparência›Posição das notificações: #notiOpts (tr padrão/tl/bl/br) → data-notipos + fenix_notipos.
- Personalizar Fênix Clients v2: abas + cor (4 swatches) + mensagem topo; persNorm (array|obj|string JSON) em mapCliente/dbCliente; clients aplica --acc + .fcmsg (fcMsgTop) + abas do objeto.
- Fundo: html{background:#000/light #f3efe4/accents} (zoom sem faixa sólida). APP_VERSAO 1.6.34.
- Testes: r48 20 (pastas removida/abas chips/sem split/celular) · r49 19 (extras fncard, números+txt, noti, posição, pers v2, clients) · r47 25 (nav 5 botões, ctabs objeto) · auditoria sem rotas pastas.

## R48 (28/09/2026) — Catálogo vinculado · Pastas modo · Termos · Abas/Dividir
- **Catálogo vinculado**: `fin` rows `origem:'cat'` com `link` {tipo:'pacote'|'avulsa'|'cliente', id, clientId}. `catDe(tipo,id)` filtra. Seções: pacote (`pkgCatSec`, psub 'catalogo', contador mCatP), avulsa (bloco no body do renderAvulsas + ação `avcat`), cliente (sub 'catalogo', cliCatalogo, contador mCatCli). sellModal ganhou `sellVinc` (select montado em sellVincPinta com pacotes+avulsas da cliente) e criação inline (`btnSellNovo`/`btnSellNovoAdd` → unshift em getCat com shape de mapCat). btnCatSell/btnCliCatAdd/btnPkgCatAdd → openSellModal(prefer).
- **Pastas MODO**: MODES.pastas; saiu de VIEWS/titles; dono map viewPastas:'pastas'; renderApp branch próprio (navGestao esconde; título Pastas; renderPastas). showView('pastas') NÃO existe mais — setMode('pastas').
- **Termos**: navDados data-dsub="termos" + viewTermos placeholder + dd map + título.
- **Abas/Dividir (SÓ DESKTOP)**: btnAbas na sidebar (.abasbar; some ≤900px e no Android). ABAS.ls persistida (fenix_abas, máx 12). abaSnapshot/abaAbre (descritor de state)/abaHtml (navega→clona .content→volta). abasModal: salvar aba, prévia (splitPane título "Prévia·"), Dividir: seleciona 2 (splitHint/count) → splitInicia: zoom global reduzido (0.78/0.9 conforme largura, zoomAnt guardado), vai pra aba A ao vivo, painel direito mostra clone de B; swap; splitFecha restaura zoom. splitPane display:none ≤900px.

## R47 (28/09/2026) — Remove Dash/Planilha-Gestão + Anamnese na cliente + Personalizar + Roleta
- **REMOVIDOS (pedido do dono)**: Dashboard e Gestão Planilha (HTML/JS/CSS/nav/VIEWS/dono map/rotas da auditoria; teste_r44 apagado). Pastas FICA.
- **Anamnese na cliente**: menu da cliente ganhou "Anamnese" (`state.sub='anamnese'`, área `cliAnamnese`): lista `getForm()` (formulários existentes) + respostas onde `pessoa`=nome da cliente; "Preencher" abre as perguntas (`qRowResp`) com pessoa FIXA = nome da cliente (sem campo); duplicada → bloqueia (apague a antiga na lixeira). **Criar anamnese continua exclusivo do Studio.**
- **Personalizar (Fênix Clients)**: campo `clientes.ctabs` (D1 ALTER; JSON array das abas res/pac/ses/pag/doc). Modal por cliente (Fênix Clients › Personalizar); **validação: mínimo 1 aba**. RPC `fenix_cliente_pub` devolve `cliente.ctabs` (null = todas). `clients/index.html`: `perm` filtra abas (display:none) e envolve os 5 painéis com `P2(k, ...)`; se `res` fora → `vai(perm[0])`. mapCliente/dbCliente carregam/salvam.
- **Roleta (extras)**: `viewRoleta` (dono map 'extras'; `state.extrasRoleta` alterna no renderApp). CRUD local (`fenix_role` localStorage): criar/apagar roletas, itens (chips, máx 24), imagem central (dataURL 200px). Giro: SVG fatias + `rotate` CSS 4.4s cubic-bezier; vencedor aleatório calculado por ângulo; resultado após 4,6s.

## R46 (28/09/2026) — Vendas do catálogo somiam + Sistema no celular
- **Catálogo → financeiro da cliente**: a venda era criada com `link` OBJETO (ok local), mas o `mapFin` (leitura da nuvem) não convertia o texto JSON de volta → após o pull (10s) `f.link.clientId` era undefined e a venda sumia de `finCliCat`. Fix: mapFin parseia `link` string→objeto (receita da R40/mapArq, incl. sufixo `::jsonb`).
- **Sistema no celular**: `plataformaApply()` escondia `#navDados [data-dsub="sistema"]` no Android e resetava zoom salvo a cada boot (regra R21). Função agora é no-op — Sistema visível em todos os aparelhos; zoom CSS é padrão (Chrome 128+/WebView atual).

## R45 (28/09/2026) — Produtos e procedimentos no pacote (preço opcional)
- **D1**: `ALTER TABLE pacotes ADD COLUMN itens TEXT` (linhas antigas → NULL → jsonArr → []).
- **Worker RPC**: `json_object(...,'itens', CASE WHEN p.itens IS NULL OR p.itens='' THEN json('[]') ELSE json(p.itens) END...)` — cliente vê o conteúdo do pacote. REST genérico já passa a coluna (sqlVal stringifica array). Deploy worker SEMPRE com bindings D1 na metadata (R44 lição).
- **App**: `PKG_ITENS_NOVOS` (criar) e `PKG_ITENS_ED` (editar, preenchido no prefill) + `pkgItensLiga`/`pkgItensPinta`/`pkgItensSoma` (builders ligados 1× em nível topo). Valor do pacote: **opcional** — vazio → soma dos itens com preço; sem itens com preço e sem valor → erro orientado ("informe o valor OU adicione itens com preço"). Cards mostram chips 🧖/🧴 (4 + "+N"), pkgMeta mostra contagem, Gestão Planilha coluna Itens (tabela/CSV/rodapé colspan 9→10).
- **clients/index.html**: chips sob cada pacote ("🧖 Limpeza · incluído", "🧴 Máscara · R$ 60").

## R44 (28/09/2026) — Documentos da cliente + Dashboard + Gestão Planilha + Pastas
- **Documentos da cliente (bug)**: o app da cliente (`clients/index.html`) NEM TINHA aba de Documentos e a RPC `fenix_cliente_pub` não devolvia documentos — apesar de já existirem docs com `cliente_id`. RPC agora devolve `documentos[]` (título/texto/data, ≤12) e o app ganhou a aba (conteúdo sanitizado, `<details>` para ler). **ATENÇÃO deploy worker: metadata PRECISA incluir bindings D1 (`bindings:[{"type":"d1","name":"DB","id":"1b449f18-…"}]`) — sem isso o deploy REMOVE o binding e derruba a nuvem (aconeceu e foi corrigido no mesmo minuto).**
- **Dashboard** (gestão › view `dash`, `state.dashTab` fin/ses/pac/arq): Finanças = candlestick SVG por dia (verde fecha≥abre, vermelho abaixo) + KPIs; Sessões = KPIs + barras 8 semanas; Pacotes = quitação (barras) + em aberto; Arquivos = agrupado por `link.tipo` (pacote/sessão/avulso). Sem libs — SVG puro.
- **Gestão Planilha** (view `plangest`): tabela por cliente (pacotes, sessões feitas/total, pago, contratado, em aberto, última/próxima sessão, docs/arquivos) + busca + totais + clique abre a cliente + **Baixar CSV** (BOM + `;` pt-BR).
- **Pastas** (view `pastas`): criar/renomear(apagar)/entrar em pastas + registro de arquivos dentro (nome/tipo/tam/obs). Persistência **local** (`fenix_pastas`) — prévia (dono siente que "por enquanto não funciona"; sync vem depois).
- **Aviso de atualização** (`mostrarAvisoUpd`): agora mostra "✨ O QUE MELHOROU NESTA VERSÃO" com caixa rolável dos bullets do versao.json + "não mexe nos seus dados".
- VIEWS/titles/computeTitle/renderApp/isolamento (dono map 'gestao') + auditoria +7 rotas (dash×4, plangest, pastas, pastas·dentro).

## R43 (28/09/2026) — Mensagens da equipe: tela cheia + anexos temporários
- **Era**: conversa numa `panelcard` com alturas fixas (`.tgmsgs max-height:400px`) → "popup feio" no PC; no celular lista+conversa empilhadas → "misturado".
- **Agora**: `.chatwrap` flex **tela cheia** (`height:calc(100dvh - 235px)`); desktop = lista à esquerda + conversa à direita SEMPRE visíveis; **celular (≤720px)**: só a lista; tocar na pessoa → `.chatwrap.open` esconde lista e mostra conversa (botão ‹ volta).
- **Sync 5s** (`TG_SYNC=5000`, era 20s da R34 — dono pediu 5s). Autoscroll só se perto do fim ou envio próprio.
- **Anexos** (`tgClip`/`tgFile`): até **1 MB** (base64 ≤1,4 MB na coluna `url` da própria linha `mensagens` — limite de linha do D1 é 2 MB; colunas url/nome/tamanho já existiam); foto grande >1 MB é **reduzida sozinha** (canvas 1280px q.72); anexo some junto com a mensagem em **24h** (purge já existente no `msgPuxa` + rodapé avisa). Worker NÃO mudou (REST genérico).
- **Efeitos**: avatar com cor derivada do nome (`tgCor`), ponto verde "ativo agora" (msg recebida <2min), bolhas `.nova` animam só na 1ª pintura (`MSG.anim`), badge pulsante, busca na lista.
- Handlers ligados 1× (`window._tgLigado`); estado em `MSG.itens`/`MSG.pintar` (closures sempre atuais); grupo da clínica segue "em breve".

## R42 (28/09/2026) — URGENTE: gestão visível + links com página própria
- **REGRESSÃO da R41 (grave, pega pelo usuário!)**: isolamentoAreas usava chaves 'inicio'/'clientes'... mas o modo real é 'gestao' → TODA a área de gestão ficava ESCONDIDA no EXE e no APK (só a barra). Correção: dono map com 'gestao' (viewExtras aceita gestao|extras). A auditoria NÃO pegou porque só caçava vazamento de nomes — agora ELA TAMBÉM confere se a tela esperada fica VISÍVEL em cada rota (rotas com showView real, ex.: setMode('gestao');showView('clientes') — setMode('clientes') reseta pra Início!).
- **Links de formulário**: linkOf → https://.../form.html?resp=TOKEN (NÃO mais o app). form.html novo (página dedicada, escuro+dourado, mobile-first) no repo/Pages. Rotas PÚBLICAS no worker: POST /pub/form (busca por link_token) e POST /pub/resp (insert em formulario_respostas com dup-check por pessoa) — o modo público interno (#resp=) usava SB.from SEM login → 401, nunca carregava; agora usa /pub/*. Enviar duplicado → mensagem "já respondeu" (409).
- **Planilha**: PLN_BOOT no plnCarrega — primeira renderização da sessão força PLNC.sel=null (sempre abre na LISTA).

## R41 (28/09/2026) — isolamento de áreas DE VEZ POR TODAS
- **Causa dos "vazamentos" recorrentes**: (1) renderEqUsu era FUNÇÃO FANTASMA (chamada em renderApp, definição perdida em patch antigo) → Equipe›Usuários quebrava e a tela ficava com conteúdo da sub-área anterior; (2) a cauda "comum" do renderApp (VIEWS) não escondia viewEquipe/viewUsuarios ao sair da Equipe → tela da Equipe ficava visível em Clientes/Agenda/etc.
- **Consertos**: renderEqUsu recriada (lista plana + cadastro eqUsuAdd + remoção data-eqsudel, senha fx1); isolamentoAreas() (mapa dono/dados/studio) roda no fim de TODAS as branches (6 pontos: 5× updateBack();return;} + cauda else renderCliente()); try/catch nos despachos equipe/studio/dados com mensagem amigável — NUNCA mais tela velha de outra área; teste automatizado PERMANENTE: tests/auditoria_isolamento.js (38 rotas + cheque de funções fantasmas) e tests/teste_equipe_usuarios.js.
- **Lição**: após qualquer patch, rodar auditoria_isolamento.js — pegou o próprio patch intermediário com funções aninhadas no escopo errado (renderEqUsu/isolamentoAreas dentro de renderEqMsgs) antes de publicar.

## R40 (28/09/2026) — resgate das fotos e vínculos dos Arquivos
- **Causa**: na migração, as fotos dos 49 arquivos foram trocadas por URLs de um storage que NÃO existe no worker (/storage/v1/obj) — fotos mortas; e o link de vínculo foi gravado com sufixo Postgres ::jsonb (texto) que o app não lia → "sem vínculo".
- **Conserto de dados**: url restaurada do CSV original (uploads/arquivos_rows.csv) para TODOS os 49 (UPDATE por linha com params via --data-binary @arquivo — argumento do curl estoura com ~160KB!); link: REPLACE removeu ::jsonb (49). Estado final: 54/54 com foto, 0 links sujos. Vínculos de cliente NUNCA se perderam (batido id a id).
- **App**: mapArq parseia link texto-JSON (tolera ::jsonb) → objeto {id,tipo,obs}; lixo → null. Versão 1.6.25; bateria: test_novo 269 + teste_funcionais 11 + R40 8.
- **APK**: versionCode 5 / versionName 1.6.25 — mesma assinatura (cert be14a6ab...25f). Regra do dono: APK e EXE sempre na MESMA versão.

## APK — receita de rebuild (28/09/2026, R39.1)
- **Motivo**: APK antigo era só carregador (111 KB, v1.2/versionCode 3, SEM app embutido, SEM quebra de cache) — celular mostrava versão desatualizada. Regra do dono: **APK e EXE sempre na MESMA versão (versionName = APP_VERSAO)**.
- **APK atual (v1.6.24, versionCode 4)**: pacote br.fenix.estetica (NÃO mudar — atualiza por cima sem perder login), assinatura keystore fenix-apps/chave-assinatura-fenix.keystore (alias fenix, senha fenix2026, cert SHA-256 be14a6ab...25f — TEM que bater), minSdk 24, targetSdk 34.
- **Comportamento**: carrega Pages com ?v=<timestamp> POR ABERTURA (quebra cache do WebView = fim do "desatualizado"); onReceivedError na main frame → assets/www/ (APP v1.6.24 COMPLETO embutido + supabase.js local, igual ao EXE); links fora de geniterapeuta12-tech.github.io/fenix-estetica → app externo (WhatsApp etc.).
- **Ferramentas (VOLÁTIL em /tmp/apkb — re-baixar)**: https://dl.google.com/android/repository/build-tools_r34-linux.zip (aapt2/d8/apksigner/zipalign em android-14/) + https://dl.google.com/android/repository/platform-33_r02.zip (android.jar em android-13/). Java 11 já tem no sandbox (keytool em /usr/lib/jvm/jdk-11/bin/).
- **Passos**: aapt2 compile --dir res -o res.zip → aapt2 link -o base.apk -I android.jar --manifest AndroidManifest.xml res.zip --min-sdk 24 --target-sdk 34 → javac -source 8 -target 8 -cp android.jar → d8 (java -cp android-14/lib/d8.jar com.android.tools.r8.D8) → zip escreve classes.dex + assets/www/{index.html(supabase local),supabase.js,off.html} → zipalign -f -p 4 → apksigner sign --ks ... --ks-key-alias fenix → verify (v2+v3 true). PRÓXIMO REBUILD: versionCode++ e versionName = APP_VERSAO corrente.

## R39 (27/09/2026) — formulários/mensagens/Usuário + revisão
- **CAUSA-RAZÃO "perguntas apagam"**: colunas JSON (estrutura, respostas, guias, itens, payload) são gravadas como TEXTO no D1 (sqlVal serializa objeto) e o app só aceitava Array → pós-pull viravam []. Conserto DUPLO: worker rowOut re-parseia essas colunas; app tem jsonArr() (mapForm/mapDoc/mapResp/mapKit + link público + payload de backup). TESTE AO VIVO: anamnese central voltou c/ 7 perguntas.
- **Mensagens 24h**: msgPuxa filtra ts>corte-24h e dispara DELETE lt na nuvem; renderEqMsgs purga MSG.rows. Text-only mantido (função não removida).
- **Dados › Usuário**: dsub=usuario — usuário conectado (fenix_user_ativo), Trocar (reabre userModal), lista c/ remover individual, Remover repetidos (dedupe por nome lower) e Remover todos (confirmação em 2 toques) — NUNCA mexe na conta da clínica. Tabela usuarios no D1 está VAZIA (usuários vivem local/backup) — remoção é local e definitiva.
- **Revisão completa (sweep jsdom)**: setMode em inicio/clientes/agenda/financeiro/studio/catalogo/dados c/ usuários Kaleb+Maria ativos → NENHUM vazamento de nome pra outra área.

## R38 (27/09/2026) — CORREÇÃO da senha de usuário
- **Causa**: o botão de entrar do usuário (userEnter) comparava a senha digitada DIRETO com o valor gravado (formato criptografado fx1:base64('fx|usuario|senha')) — nunca conferia p/ usuários vindos do sistema antigo/backup. A função certa (senhaOk) existia mas NUNCA era chamada.
- **Correções**: userEnter usa senhaOk; senhaOk usa username/nome em MINÚSCULAS na comparação (bug de caso: 'Kaleb' ≠ 'kaleb' embutido) + aceita legado em texto puro; cadastro de usuário novo grava encSenha(nome,senha) (resiste a backup/sync); senhaVisivel continua mostrando ao admin.
- **Formatos aceitos no login**: fx1 (decodifica), texto puro (legado), hashUsu antigo; sem senha = entra direto.

## Decisão do proprietário — banco de dados (27/09/2026)
- **Decisão final (dono):** FICAR na Cloudflare enquanto o plano grátis der conta. Migrar para o **Fly.io** (Postgres + API em gru/São Paulo) **quando o armazenamento grátis estiver acabando**.
- **Gatilho da migração (combinado com o dono):** banco D1 chegar a **~3,5 GB (70% dos 5 GB grátis)** — ou começar a dar erro de gravação por limite. Nesse momento: avisar o dono e iniciar a migração pro Fly.io.
- **Rotina de vigília:** conferir o tamanho do banco (API Cloudflare D1, campo file_size) em TODA sessão de trabalho e comentar com o dono. Referência 27/09/2026: **7,05 MB = 0,14% do grátis** (ritmo atual = anos até o gatilho).
- **Plano Fly.io (pronto p/ executar quando o gatilho disparar):** conta fly.io do dono + token de API; máquina Postgres + máquina da API na região gru; mesmas rotas do worker atual; migrar dados por export SQL do D1 → Postgres; testar em paralelo sem derrubar nada; só depois redirecionar o app (release v1.6.20+). Custo estimado: US$ 6–14/mês fixo (máquina banco + máquina API + disco; snapshots 10 GB grátis).
