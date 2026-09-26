# Fênix Estética — Nuvem (R17: 100% Cloudflare)

A nuvem do app agora é **Cloudflare**, sem Supabase, sem pausa e com muito mais espaço grátis.

## Arquitetura
| Peça | Produto Cloudflare | Endereço |
|---|---|---|
| Servidor (API) | **Workers** — `fenix-api` | https://fenix-api.geniterapeuta12.workers.dev |
| Banco de dados | **D1** — `fenix-estetica` (5 GB grátis) | vinculado ao Worker |
| Site (frente) | **GitHub Pages** | https://geniterapeuta12-tech.github.io/fenix-estetica/ |

O Worker (`cloudflare-worker.js`) entende o protocolo do cliente do app (auth + REST + storage + rpc) e responde lendo/escrevendo no D1.

## Arquivos
- `cloudflare-worker.js` — o servidor (publicar com `npx wrangler deploy` ou via API)
- `cloudflare-schema.sql` — todas as tabelas (23) exatamente como estão na nuvem
- `cloudflare-import.sql` — TODOS os dados (clientes, pacotes, sessões, pagamentos, documentos, 49 fotos etc.), idempotente
- `migrations/` e `supabase-completo.sql` — histórico do servidor antigo (aposentado, mantido só como backup)
- `import-01/02/03*.sql` — importadores antigos (PostgreSQL); o importador atual é o `cloudflare-import.sql`

## Reconstruir a nuvem do zero (se um dia precisar)
```bash
npx wrangler d1 create fenix-estetica
npx wrangler d1 execute fenix-estetica --remote --file=cloudflare-schema.sql
npx wrangler d1 execute fenix-estetica --remote --file=cloudflare-import.sql
npx wrangler deploy cloudflare-worker.js --name fenix-api --compatibility_date 2024-09-23
```
Segredo do JWT: variável `FENIX_SECRET` do Worker (cópia local: `../fenix-cloudflare/fenix-secret.txt`).

## Login da clínica
E-mail `clinicaprincipal@clinicas.fenix.app` — a senha usada no 1º acesso é a que fica valendo.
