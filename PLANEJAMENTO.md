# Mesa de planejamento — Fênix Estética

## 🎨 UI 2.0 — Repaginação estilo CLAUDE (04/10/2026) — DECIDIDO, aguarda «puxa»
**O sonho do dono**: «uma UI parecida com a do Claude, da Anthropic, aquela bonita limpa».

**Decisões cravadas (dono respondeu as 3)**:
1. **Claro PAPEL como padrão** — fundo bege morno, texto tinta, exatamente a sensação do Claude. O escuro+ouro de hoje NÃO morre: vira tema escolhível em Aparência.
2. **Destaque CORAL do Claude** (terracota ~#D97757) — troca o ouro nos botões/detalhes; a identidade vira «papel + tinta + coral + serifa».
3. **Só o Estética agora** — a Center atual não se mexe; a Center nova (P2 da plataforma) JÁ NASCE nessa UI.

**A receita (o que faz ser «cara Claude»)**: fundo papel morno (não cinza) · texto tinta suave · TÍTULOS SERIFADOS (serifa do próprio aparelho — Georgia — zero download, funciona offline) · UMA cor de destaque só, resto neutro · muito respiro, cantos redondos, bordas fininhas, quase zero sombra · chat em estilo conversa com o pensamento visível (já temos!).

**Viabilidade confirmada**: a CSS inteira bebe de UM `:root` de tokens + sistema de tema/acento que já existe (13 acentos, dataset.theme light/dark). Troca a pele inteira SEM tocar em ID, fluxo, função ou tela.

**Etapas**:
- **UI-A — Fundação**: tokens novos (papel/tinta/coral) + tipografia serifada nos títulos + componentes de base (cards, botões, campos, modais, badges, barras) → o app inteiro muda de cara de uma vez.
- **UI-B — Polida fina**: Chat da Fênix I.A em estilo conversa · Cliente · Financeiro · Painel · funções extras.
- **Regras**: ZERO função nova · testes têm que continuar verdes (eles checam IDs/funções, não CSS) · checador de aninhamento obrigatório · escuro+ouro vira tema em Aparência · FENIX-TESTE-LOCAL acompanha.

**Ordem sugerida**: UI 2.0 ANTES da P1 da plataforma — assim as contas Fênix e a Center nova já nascem na casa nova.

## 🏛️ R90+ — PLATAFORMA FÊNIX: a CENTER no coração de tudo (04/10/2026) — DESENHO APROVADO PELO DONO

**A ideia do dono**: uma conta única (tipo um gmail nosso) e a Central mandando em tudo — «a central automatizar tudo, sério mesmo, tudo; o app só poder ser acessado por lá».

**Decisões cravadas (dono respondeu as 4 perguntas)**:
1. **Porteira TOTAL**: os apps SÓ abrem por dentro da Center — nada de abrir o Estética direto pelo ícone. Tudo começa na Center, que abre os apps **já logados**.
2. **Quem usa a Center: TODOS** — o dono Fênix (painel-mestre) e cada clínica (a parte dela, dentro dos limites que ele definir).
3. **Center automatiza TUDO**: criar clínica nova com 1 toque (conta + app liberado + plano), bloquear/liberar na hora, ver e publicar versões, cotas da I.A por clínica, backups de todos num lugar só.
4. **Sem internet, não entra**: toda abertura valida na nuvem — bloqueio funciona de verdade, a qualquer hora, de qualquer lugar. (Fim do modo offline — aprovado.)

### Conta Fênix (o «gmail» nosso)
- 1 conta por pessoa: email + senha · guarda o papel (dono Fênix / clínica / equipe) e a clínica dela.
- **Formato escolhido pelo dono: POR CLÍNICA** — apelido interno `ana@clinicaprincipal` desde já; quando o domínio for comprado (~US$14/ano, só dependerá do dono), vira `ana@clinicaprincipal.fenixestetica.app` **sem migrar nada** (só acrescenta o sobrenome). Domínio: **depois** (dono preferiu não gastar agora). Domínios livres conferidos hoje: fenixestetica.app ✓ · fenixapp.app ✓ · meufenix.app ✓ · fenixsuite.app ✓ (fenix.app ocupado).
- Logou 1 vez, **todos** os apps já sabem quem é, qual clínica, o que pode ver.
- Senha **nunca** circula no app nem fica no aparelho — o worker é quem confere (criptografada).
- As clínicas que já usam **viram contas Fênix automaticamente** (mesmo email, mesma senha) — ninguém cadastra nada de novo.

### Plano em partes (executa nessa ordem, cada parte numa release própria)
- **P1 — BASE (worker)**: tabelas novas `contas` + `sessoes` (NÃO mexe em tabela nenhuma que existe) + endpoints /auth (criar conta, logar, conferir sessão, token de 1 uso pra abrir app) + migração automática: clínicas atuais viram contas Fênix.
- **P2 — CENTER NOVO (v2.0)**: entra pela conta Fênix · **dono vê**: clínicas, criar/bloquear, versões, cotas da I.A, backups · **clínica vê**: meus apps, meus usuários, minha parte · botão que abre o Estética **já logado**.
- **P3 — ESTÉTICA ACEITA A CONTA**: o app entende a sessão vinda da Center (deep-link `fenix://` com token de 1 uso no celular / link com token no Windows) e entra direto, sem digitar nada. (Transição: o login de hoje continua funcionando.)
- **P4 — LIGA A PORTEIRA TOTAL**: Estética novo só abre com sessão da Center (sem net, não entra) + Center Windows embute o app dentro dela. Só quando o Center novo estiver com todo mundo é que o «só acessado por lá» vale geral.
- **P5+ — operação pela Center**: publicar versão pra todas as clínicas de lá, cotas da I.A ajustáveis, tudo que aparecer.

### Cuidados da travessia (pra ninguém ficar na mão)
- Clínicas atuais **não podem travar**: a porteira total só liga na P4, com o Center novo já distribuído.
- A tela nova (P2/P3) chega sozinha pelo auto-update que já existe; mudança de comportamento do Android (P4) sempre pede APK novo.
- Regras de sempre valem: tabela `backups` NUNCA · cliente NUNCA mexe no banco · credencial NUNCA no app · Cloudflare GRÁTIS (aguenta).

**Status**: ✅ «PUXA» dado (04/10) — execução EM ORDEM: UI 2.0 → P1 → P2 → P3 → P4.
