# Mesa de planejamento — Fênix Estética

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

**Status**: mesa aberta — o dono dá o «puxa» e começa pela **P1**.
