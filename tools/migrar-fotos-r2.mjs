#!/usr/bin/env node
/**
 * R61 — Migração das FOTOS ANTIGAS (base64 no D1) para o Cloudflare R2.
 *
 * Roda em lotes pequenos, confere no balde ANTES de apagar do banco e
 * pode ser interrompido/retomado a qualquer momento (é idempotente).
 *
 * Uso:
 *   node tools/migrar-fotos-r2.mjs --email clinicaprincipal@clinicas.fenix.app --senha 'xxx'
 *   node tools/migrar-fotos-r2.mjs --token '<access_token>' --dry
 *
 * Opções:
 *   --api <url>     padrão https://fenix-api.geniterapeuta12.workers.dev
 *   --lote <n>      itens por lote (1..25, padrão 10)
 *   --max <n>       máximo de lotes nesta execução (padrão: até acabar)
 *   --dry           simula (não sobe nem apaga nada)
 */
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);

const API = (arg('api', process.env.FENIX_API || 'https://fenix-api.geniterapeuta12.workers.dev')).replace(/\/$/, '');
const LOTE = Math.max(1, Math.min(25, parseInt(arg('lote', '10'), 10) || 10));
const MAXL = parseInt(arg('max', '0'), 10) || Infinity;
const DRY = flag('dry');

async function login() {
  const tok = arg('token', process.env.FENIX_TOKEN);
  if (tok) return tok;
  const email = arg('email', process.env.FENIX_EMAIL);
  const senha = arg('senha', process.env.FENIX_SENHA);
  if (!email || !senha) {
    console.error('Faltou --token OU --email/--senha (ou FENIX_TOKEN / FENIX_EMAIL+FENIX_SENHA).');
    process.exit(2);
  }
  const r = await fetch(API + '/auth/v1/token?grant_type=password', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: senha }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) { console.error('Login falhou:', r.status, d.message || d); process.exit(3); }
  return d.access_token;
}

const mb = (b) => (Number(b || 0) / 1048576).toFixed(2) + ' MB';

(async () => {
  const st0 = await fetch(API + '/r2-status').then(r => r.json()).catch(() => null);
  if (!st0 || !st0.ok) { console.error('Worker sem /r2-status — publique a versão R61 do worker antes.'); process.exit(4); }
  console.log(`Antes: ${st0.restantes} foto(s) no banco (${mb(st0.bytes)}) · R2 ligado: ${st0.r2 ? 'sim' : 'NÃO'}`);
  if (!st0.r2) { console.error('R2_TOKEN não está configurado no Worker — abortando.'); process.exit(5); }
  if (!st0.restantes) { console.log('Nada a migrar. ✅'); return; }

  const token = await login();
  let lotes = 0, migradas = 0, jaR2 = 0, bytes = 0; const erros = [];
  while (lotes < MAXL) {
    const r = await fetch(API + '/r2-migra', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({ limite: LOTE, dry: DRY }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { console.error('Lote falhou:', r.status, d.message || d); process.exit(6); }
    lotes++; migradas += d.migradas; jaR2 += d.ja_no_r2; bytes += d.bytes;
    if (d.erros && d.erros.length) erros.push(...d.erros);
    console.log(`Lote ${lotes}: +${d.migradas} migradas, ${d.ja_no_r2} já no R2, ${d.erros.length} erro(s) · restam ${d.restantes} (${mb(d.bytes_restantes)})`);
    if (DRY) break;                      // dry roda 1 lote só (nada muda, seria laço infinito)
    if (!d.restantes) break;
    if (!d.migradas && !d.ja_no_r2) { console.error('Lote sem progresso — parando para não girar à toa.'); break; }
  }
  const st = await fetch(API + '/r2-status').then(r => r.json()).catch(() => ({}));
  console.log('—');
  console.log(`Total: ${migradas} migradas · ${jaR2} já estavam no R2 · ${mb(bytes)} tirados do banco`);
  console.log(`Depois: ${st.restantes} foto(s) ainda no banco (${mb(st.bytes)})`);
  if (erros.length) { console.log('Erros:'); erros.forEach(e => console.log(' ✗', e.path, '—', e.erro)); process.exit(1); }
  console.log(st.restantes ? 'Parcial — rode de novo para continuar.' : 'Migração concluída. ✅');
})();
