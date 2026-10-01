/**
 * FENIX API — Cloudflare Worker
 * Traduz o protocolo Supabase (PostgREST + GoTrue + Storage) para o banco D1.
 * O app Fênix continua falando "supabase-js"; este Worker responde tudo.
 */
const DB_PUB = '1b449f18-8d5f-4850-b9b9-7d2ce18be2c0'; // informativo

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, prefer, accept, x-supabase-api-version, range, content-profile, accept-profile',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-expose-headers': 'content-type, prefer, location',
};

function j(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...CORS, ...extra },
  });
}
function jerr(message, status, code) {
  return j({ message, code: code || String(status), hint: null, details: null }, status);
}

/* ---------- JWT HS256 ---------- */
const enc = new TextEncoder();
function b64u(b) { let s = btoa(String.fromCharCode(...new Uint8Array(b))); return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64uS(s) { return b64u(enc.encode(s)); }
function ub64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); }
/* R61 — IA: Workers AI (binding, sem chave) + Groq (se GROQ_KEY existir) */
const IA_SYS='Você é o Assistente Fênix, assistente de um estúdio de estética. Responda em português do Brasil, de forma curta (máximo 120 palavras), direta e amigável. Baseie-se SOMENTE nos dados fornecidos; nunca invente números; se algo não estiver nos dados, diga com franqueza que não tem essa informação. Conhecimento de estética: procedimentos comuns incluem limpeza de pele, peeling, massagem modeladora, drenagem linfática, design de sobrancelhas e nail design; foque em benefícios e bem-estar e NUNCA prometa resultado médico ou curativo; quando pedirem textos criativos (posts, legendas, mensagens para clientes), escreva com tom acolhedor e elegante.';
const IA_RESUMO='Você é a assistente pessoal de um estúdio de estética. Escreva um RESUMO ELEGANTE, caloroso e profissional do relatório abaixo, em português do Brasil. Use 2 a 4 parágrafos curtos, com linguagem humana e acolhedora, como quem conhece o negócio de perto. Destaque com sutileza as conquistas (faturamento, clientes fiéis, sessões realizadas), aponte com delicadeza o que merece atenção e feche com 1 ou 2 sugestões práticas e otimistas. NUNCA use tabelas nem listas com marcadores. NUNCA invente números: use apenas os do relatório. Não comece com saudação: vá direto ao texto.';
const IA_POST='Você cria posts de Instagram para um estúdio de estética. Responda SOMENTE com um JSON válido, sem nenhum texto fora dele, exatamente neste formato: {"titulo":"...","chamada":"...","beneficios":["..."],"legenda":"..."}. REGRAS OBRIGATÓRIAS: (1) FIDELIDADE AO PEDIDO — use EXATAMENTE o serviço/termo que o usuário escreveu, com as mesmas palavras; se ele escreveu «ozônio terapia capilar», o título e a legenda devem conter «Ozônio Terapia Capilar» — NUNCA troque por termo genérico tipo «cuidar dos cabelos» ou «tratamento capilar». (2) titulo: o nome do serviço/oferta do pedido, até 6 palavras. (3) chamada: 1 frase curta de apoio (máximo 110 caracteres), citando o serviço exato. (4) beneficios: SEMPRE inclua 3 ou 4 benefícios REAIS e ESPECÍFICOS do serviço exato, cada um com até 5 palavras, sem ponto final — exemplo para ozônio terapia capilar: ["Fortalece os fios","Reduz a queda","Brilho intenso","Estimula o crescimento"]; só devolva lista vazia [] se o pedido não for sobre um serviço ou tratamento. (5) legenda: comece com o nome EXATO do serviço; depois 1 ou 2 frases; depois a linha «✨ Benefícios:» e cada benefício em linha própria começando com ✅; termine chamando para agendar e coloque 6 a 10 hashtags ESPECÍFICAS do serviço (ex.: #ozonioterapiacapilar #saudecapilar) mais 2 ou 3 gerais; use 2 a 4 emojis. Estilo: elegante, acolhedor, sofisticado. Conhecimento de estética: limpeza de pele, massagem modeladora, drenagem linfática, design de sobrancelhas, nail design, ozônio terapia e tratamentos capilares em geral; foque em benefícios e bem-estar; NUNCA prometa resultado médico ou curativo.';
async function aiChat(env,msgs){
  try{
    const r=await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast',{messages:msgs,max_tokens:400,temperature:0.4});
    return {resposta:(r&&r.response)||''};
  }catch(e){
    const r=await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast',{messages:msgs,max_tokens:400,temperature:0.4});
    return {resposta:(r&&r.response)||''};
  }
}
async function groqChat(key,msgs){
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'authorization':'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:msgs,max_tokens:400,temperature:0.4})});
  const d=await r.json().catch(()=>null);
  return {resposta:(d&&d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content)||''};
}
/* R60 — R2: fotos e arquivos no balde fenix-arquivos (D1 fica só c/ dados + fotos antigas) */
const R2_AC='022e146199d99c7fc5785f2d9c620a9b';
const R2_BUCKET='fenix-arquivos';
function r2Url(path){return 'https://api.cloudflare.com/client/v4/accounts/'+R2_AC+'/r2/buckets/'+R2_BUCKET+'/objects/'+encodeURIComponent(path);}
async function r2Put(path, buf, mime, token){
  const r=await fetch(r2Url(path),{method:'PUT',headers:{'authorization':'Bearer '+token,'content-type':mime||'application/octet-stream'},body:buf});
  return r.ok;
}
async function r2Get(path, token){
  try{const r=await fetch(r2Url(path),{headers:{'authorization':'Bearer '+token}});
  if(r.status===200)return r; return null;}catch(e){return null;}
}
async function r2Del(path, token){
  try{await fetch(r2Url(path),{method:'DELETE',headers:{'authorization':'Bearer '+token}});}catch(e){}
}
async function hmacKey(secret) { return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']); }
async function signJWT(payload, secret) {
  const head = b64uS(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64uS(JSON.stringify(payload));
  const data = head + '.' + body;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data));
  return data + '.' + b64u(sig);
}
async function verifyJWT(token, secret) {
  try {
    const [h, p, s] = token.split('.');
    const data = h + '.' + p;
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), ub64u(s), enc.encode(data));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(ub64u(p)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) { return null; }
}

/* ---------- senha: salt$sha256hex ---------- */
async function hashPass(pass, salt) {
  salt = salt || crypto.randomUUID().replace(/-/g, '');
  const dig = await crypto.subtle.digest('SHA-256', enc.encode(salt + ':' + pass));
  const hex = [...new Uint8Array(dig)].map(b => b.toString(16).padStart(2, '0')).join('');
  return salt + '$' + hex;
}
async function checkPass(pass, stored) {
  try { const [salt] = stored.split('$'); return (await hashPass(pass, salt)) === stored; } catch (e) { return false; }
}

/* ---------- SQL helpers ---------- */
function q1(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function safeTable(t) { if (!/^[a-z_][a-z0-9_]*$/.test(t)) throw new Error('tabela inválida'); return '"' + t + '"'; }
function safeCols(list) {
  return list.split(',').map(c => {
    c = c.trim().replace(/^"|"$/g, '');
    if (c === '*') return '*';
    if (!/^[a-z_][a-z0-9_]*$/.test(c)) throw new Error('coluna inválida: ' + c);
    return '"' + c + '"';
  }).join(',');
}
/* filtros PostgREST → SQL; valores vindos de query params */
function buildWhere(url) {
  const parts = [];
  const vals = [];
  for (const [k, v] of url.searchParams.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    const m = v.match(/^(eq|neq|gt|gte|lt|lte|like|ilike|is|in)\.(.*)$/s);
    if (!m) continue;
    const op = m[1], raw = m[2];
    const col = '"' + k.replace(/^"|"$/g, '') + '"';
    if (op === 'eq') { parts.push(col + ' = ?'); vals.push(raw); }
    else if (op === 'neq') { parts.push(col + ' <> ?'); vals.push(raw); }
    else if (op === 'gt') { parts.push(col + ' > ?'); vals.push(raw); }
    else if (op === 'gte') { parts.push(col + ' >= ?'); vals.push(raw); }
    else if (op === 'lt') { parts.push(col + ' < ?'); vals.push(raw); }
    else if (op === 'lte') { parts.push(col + ' <= ?'); vals.push(raw); }
    else if (op === 'like') { parts.push(col + ' LIKE ?'); vals.push(raw); }
    else if (op === 'ilike') { parts.push(col + ' LIKE ?'); vals.push(raw); }
    else if (op === 'is') { parts.push(raw === 'null' ? col + ' IS NULL' : (raw === 'true' ? col + ' = 1' : col + ' = 0')); }
    else if (op === 'in') {
      const inner = raw.replace(/^\(/, '').replace(/\)$/, '');
      const items = inner.split('","').map(x => x.replace(/^"/, '').replace(/"$/, ''));
      if (!items.length || inner === '') { parts.push('1=0'); }
      else { parts.push(col + ' IN (' + items.map(() => '?').join(',') + ')'); vals.push(...items); }
    }
  }
  return { sql: parts.length ? ' WHERE ' + parts.join(' AND ') : '', vals };
}
/* valor JS → valor SQLite */
function sqlVal(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}
function rowOut(row) {
  // booleans 0/1 → true/false não dá pra saber quais colunas são bool;
  // o app trata 0/1 como falsy/truthy — mantém como está.
  // R39: colunas JSON gravadas como TEXTO voltam como lista/objeto de novo
  // (corrigia "as perguntas do formulário apagam" e guias/itens/respostas).
  for (const c of ['estrutura', 'respostas', 'guias', 'itens', 'payload']) {
    const v = row[c];
    if (typeof v === 'string' && v.length > 1 && (v[0] === '[' || v[0] === '{')) {
      try { row[c] = JSON.parse(v); } catch (e) {}
    }
  }
  return row;
}

/* ---------- session payload ---------- */
async function sessionFor(u, secret) {
  const now = Math.floor(Date.now() / 1000);
  const expIn = 60 * 60 * 24 * 28; // 28 dias
  const access = await signJWT({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', iat: now, exp: now + expIn }, secret);
  const refresh = await signJWT({ sub: u.id, typ: 'refresh', iat: now, exp: now + 60 * 60 * 24 * 56 }, secret);
  let meta = {};
  try { meta = u.meta ? JSON.parse(u.meta) : {}; } catch (e) {}
  const user = {
    id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email,
    email_confirmed_at: u.criado_em || new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: meta,
    created_at: u.criado_em || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return {
    access_token: access, token_type: 'bearer', expires_in: expIn,
    expires_at: now + expIn, refresh_token: refresh, user,
  };
}

/* ---------- rpc fenix_cliente_pub ---------- */
function hojeBR() {
  const f = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
  const p = f.format(new Date()); // dd/mm/aaaa
  return p;
}
async function rpcClientePub(env, pId) {
  const db = env.DB;
  const c = await db.prepare('SELECT id, nome, clinic_id, acesso, ctabs FROM clientes WHERE id = ?').bind(pId).first();
  if (!c) return null;
  if (c.acesso === 0 || c.acesso === false || String(c.acesso)==='false' || String(c.acesso)==='fals' || String(c.acesso)==='0') return { erro: 'sem_acesso' };
  const clin = await db.prepare('SELECT nome FROM clinics WHERE id = ?').bind(c.clinic_id).first();
  const pt = await db.prepare('SELECT COALESCE(SUM(valor),0) t FROM pagamentos WHERE cliente_id = ?').bind(pId).first();
  const pacotes = await db.prepare(`
    SELECT json_group_array(json_object(
      'nome', p.nome, 'valor', p.valor, 'qtd', p.sessoes,
      'itens', CASE WHEN p.itens IS NULL OR p.itens = '' THEN json('[]') ELSE json(p.itens) END,
      'feitas', (SELECT COUNT(*) FROM sessoes s WHERE s.pacote_id = p.id AND s.feita IN (1,'1','true','tru')),
      'pago', (SELECT COALESCE(SUM(pg.valor),0) FROM pagamentos pg WHERE pg.pacote_id = p.id)
    )) x FROM (SELECT * FROM pacotes WHERE cliente_id = ? ORDER BY criado_em) p
  `).bind(pId).first();
  const proximas = await db.prepare(`
    SELECT json_group_array(json_object(
      'data', s.data, 'pacote', p.nome, 'obs', s.obs, 'num', s.num
    )) x FROM (
      SELECT s.* FROM sessoes s LEFT JOIN pacotes p ON p.id = s.pacote_id
      WHERE s.cliente_id = ? AND (s.feita IN (0,'0','false','fals') OR s.feita IS NULL) AND s.data IS NOT NULL AND s.data >= ?
      ORDER BY s.data LIMIT 8
    ) s LEFT JOIN pacotes p ON p.id = s.pacote_id
  `).bind(pId, hojeBR()).first();
  const realizadas = await db.prepare(`
    SELECT json_group_array(json_object(
      'data', s.data, 'pacote', p.nome, 'obs', s.obs, 'num', s.num
    )) x FROM (
      SELECT * FROM sessoes WHERE cliente_id = ? AND feita IN (1,'1','true','tru') AND data IS NOT NULL
      ORDER BY data DESC LIMIT 30
    ) s LEFT JOIN pacotes p ON p.id = s.pacote_id
  `).bind(pId).first();
  const pagamentos = await db.prepare(`
    SELECT json_group_array(json_object(
      'valor', pg.valor, 'data', pg.data, 'metodo', pg.metodo, 'obs', pg.obs
    )) x FROM (SELECT * FROM pagamentos WHERE cliente_id = ? ORDER BY data DESC LIMIT 20) pg
  `).bind(pId).first();
  const documentos = await db.prepare(`
    SELECT json_group_array(json_object(
      'titulo', d.titulo, 'texto', d.texto, 'data', COALESCE(d.atualizado_em, d.criado_em)
    )) x FROM (SELECT * FROM documentos WHERE cliente_id = ? AND titulo IS NOT NULL ORDER BY COALESCE(atualizado_em, criado_em) DESC LIMIT 12) d
  `).bind(pId).first();
  const jsafe = (r) => { try { return JSON.parse(r.x || '[]'); } catch (e) { return []; } };
  return {
    cliente: (() => { let ct = null; try { const p = JSON.parse(c.ctabs || 'null'); if (Array.isArray(p) && p.length) { const okk = ['res','pac','ses','pag','doc'].filter(k => p.indexOf(k) >= 0); if (okk.length) ct = okk; } } catch (e) {} return { nome: c.nome, ctabs: ct }; })(),
    clinica: clin ? clin.nome : null,
    pago_total: pt ? pt.t : 0,
    pacotes: jsafe(pacotes) || [],
    proximas: jsafe(proximas) || [],
    realizadas: jsafe(realizadas) || [],
    pagamentos: jsafe(pagamentos) || [],
    documentos: jsafe(documentos) || [],
  };
}

/* ---------- Storage em D1 ---------- */
function ab2b64(buf) {
  const bytes = new Uint8Array(buf); let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(bin);
}
function b642ab(b64) {
  const bin = atob(b64); const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    const secret = env.FENIX_SECRET;

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    try {
      /* ============ AUTH ============ */
      if (p.startsWith('/auth/v1/')) {
        if (req.method === 'GET' && p === '/auth/v1/settings') {
          return j({ external: { email: true }, disable_signup: false, mailer_autoconfirm: true, phone_autoconfirm: false, sms_provider: null });
        }
        if (req.method === 'POST' && p === '/auth/v1/signup') {
          const b = await req.json();
          const email = String(b.email || '').trim().toLowerCase();
          const pass = String(b.password || '');
          if (!email || pass.length < 6) return jerr('Signup requires a valid email and password', 400, 'validation_failed');
          const ex = await env.DB.prepare('SELECT id FROM auth_users WHERE email = ?').bind(email).first();
          if (ex) return jerr('User already registered', 422, 'user_already_exists');
          const id = crypto.randomUUID();
          const pw = await hashPass(pass);
          const meta = JSON.stringify(b.data || b.user_metadata || {});
          await env.DB.prepare('INSERT INTO auth_users (id,email,pw,meta,criado_em) VALUES (?,?,?,?,?)')
            .bind(id, email, pw, meta, new Date().toISOString()).run();
          const u = { id, email, meta, criado_em: new Date().toISOString() };
          const s = await sessionFor(u, secret);
          return j(s);
        }
        if (req.method === 'POST' && p === '/auth/v1/token') {
          const grant = url.searchParams.get('grant_type');
          const b = await req.json();
          if (grant === 'password') {
            const email = String(b.email || '').trim().toLowerCase();
            const pass = String(b.password || '');
            let u = await env.DB.prepare('SELECT * FROM auth_users WHERE email = ?').bind(email).first();
            if (!u) {
              // migração: se ninguém reivindicou a clínica ainda, o 1º login assume
              // a identidade da clínica existente (user.id = clinics.id) e define a senha
              const claimed = await env.DB.prepare('SELECT id FROM auth_users LIMIT 1').first();
              if (!claimed) {
                const c1 = await env.DB.prepare('SELECT id FROM clinics LIMIT 1').first();
                const id = (c1 && c1.id) || crypto.randomUUID();
                const pw = await hashPass(pass);
                await env.DB.prepare('INSERT INTO auth_users (id,email,pw,meta,criado_em) VALUES (?,?,?,?,?)')
                  .bind(id, email, pw, '{}', new Date().toISOString()).run();
                u = { id, email, pw, meta: '{}', criado_em: new Date().toISOString() };
              } else {
                return jerr('Invalid login credentials', 400, 'invalid_credentials');
              }
            } else {
              const ok = await checkPass(pass, u.pw);
              if (!ok) return jerr('Invalid login credentials', 400, 'invalid_credentials');
            }
            const s = await sessionFor(u, secret);
            return j(s);
          }
          if (grant === 'refresh_token') {
            const pl = await verifyJWT(String(b.refresh_token || ''), secret);
            if (!pl || pl.typ !== 'refresh') return jerr('Invalid Refresh Token', 400, 'refresh_token_not_found');
            const u = await env.DB.prepare('SELECT * FROM auth_users WHERE id = ?').bind(pl.sub).first();
            if (!u) return jerr('Invalid Refresh Token', 400, 'refresh_token_not_found');
            const s = await sessionFor(u, secret);
            return j(s);
          }
          return jerr('Unsupported grant type', 400);
        }
        if (p === '/auth/v1/user') {
          const auth = req.headers.get('authorization') || '';
          const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
          if (!pl) return jerr('invalid claim: missing sub claim', 401, 'bad_jwt');
          if (req.method === 'GET') {
            const u = await env.DB.prepare('SELECT * FROM auth_users WHERE id = ?').bind(pl.sub).first();
            if (!u) return jerr('User from sub claim in JWT does not exist', 404, 'user_not_found');
            const s = await sessionFor(u, secret);
            return j(s.user);
          }
          if (req.method === 'PUT') {
            const b = await req.json();
            if (b.password) {
              const pw = await hashPass(String(b.password));
              await env.DB.prepare('UPDATE auth_users SET pw = ? WHERE id = ?').bind(pw, pl.sub).run();
            }
            const u = await env.DB.prepare('SELECT * FROM auth_users WHERE id = ?').bind(pl.sub).first();
            const s = await sessionFor(u, secret);
            return j(s.user);
          }
        }
        if (req.method === 'POST' && p === '/auth/v1/logout') return new Response(null, { status: 204, headers: CORS });
        if (req.method === 'POST' && p === '/auth/v1/recover') return j({}, 200);
        return jerr('Not found', 404, 'not_found');
      }

      /* ============ RPC ============ */
      const mrpc = p.match(/^\/rest\/v1\/rpc\/(\w+)$/);
      if (mrpc && req.method === 'POST') {
        if (mrpc[1] === 'fenix_cliente_pub') {
          /* pública: o link do cliente É a chave (id imprevisível) — a cliente não faz login */
          const b = await req.json();
          const r = await rpcClientePub(env, b.p_id);
          return j(r);
        }
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        return jerr('function not found', 404, 'PGRST202');
      }

      /* ============ PÚBLICO: formulário por link (o token do link É a chave) ============ */
      if (p === '/pub/form' && req.method === 'POST') {
        const b = await req.json().catch(() => ({}));
        const tk = String(b.token || '').slice(0, 64);
        if (!tk) return jerr('token ausente', 400);
        const r = await env.DB.prepare('SELECT id, clinic_id, titulo, descr, estrutura FROM formularios WHERE link_token = ?').bind(tk).first();
        if (!r) return j({ erro: 'invalido' });
        let est = r.estrutura;
        if (typeof est === 'string') { try { est = JSON.parse(est); } catch (e) { est = []; } }
        return j({ id: r.id, clinic_id: r.clinic_id, titulo: r.titulo, descr: r.descr, estrutura: Array.isArray(est) ? est : [] });
      }
      if (p === '/pub/resp' && req.method === 'POST') {
        const b = await req.json().catch(() => ({}));
        const tk = String(b.token || '').slice(0, 64);
        const pessoa = String(b.pessoa || '').trim().slice(0, 120);
        const valsIn = Array.isArray(b.vals) ? b.vals.slice(0, 200) : [];
        if (!tk || pessoa.length < 2) return jerr('dados inválidos', 400);
        const fm = await env.DB.prepare('SELECT id, clinic_id FROM formularios WHERE link_token = ?').bind(tk).first();
        if (!fm) return jerr('link inválido', 404, 'invalid_link');
        const dup = await env.DB.prepare('SELECT id FROM formulario_respostas WHERE formulario_id = ? AND lower(pessoa) = lower(?) LIMIT 1').bind(fm.id, pessoa).first();
        if (dup) return jerr('já respondeu', 409, 'dup');
        const vals = valsIn.filter(v => v && v.qid).map(v => ({ qid: String(v.qid).slice(0, 64), valor: String(v.valor || '').slice(0, 4000) }));
        if (!vals.length) return jerr('sem respostas', 400);
        await env.DB.prepare('INSERT INTO formulario_respostas (id, clinic_id, formulario_id, pessoa, respostas, criado_em, ts) VALUES (?,?,?,?,?,?,?)')
          .bind(crypto.randomUUID(), fm.clinic_id, fm.id, pessoa, JSON.stringify(vals), new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), Date.now()).run();
        return j({ ok: true });
      }

      /* ============ USO — medidor do banco (Dados › Uso) ============ */
      if (p === '/uso' && req.method === 'GET') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const r0 = await env.DB.prepare('SELECT id FROM mensagens LIMIT 1').run();
        const bytes = (r0.meta && r0.meta.size_after) || 0;
        const quota = 5368709120;
        return j({ bytes, quota, gatilho: 3758096384, pct: +(bytes / quota * 100).toFixed(3), atualizado_em: new Date().toISOString() });
      }

      /* ============ REST ============ */
      const mrest = p.match(/^\/rest\/v1\/([a-z_][a-z0-9_]*)$/);
      if (p === '/rest/v1/' || p === '/rest/v1') {
        return j({ swagger: '2.0', info: { title: 'Fênix API', version: 'v2-claim' }, paths: {} });
      }
      if (mrest) {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const t = safeTable(mrest[1]);
        const db = env.DB;
        const accept = req.headers.get('accept') || '';
        const wantObj = accept.includes('vnd.pgrst.object');
        const prefer = req.headers.get('prefer') || '';

        if (req.method === 'GET') {
          const sel = url.searchParams.get('select') || '*';
          const cols = safeCols(sel);
          const w = buildWhere(url);
          let sql = 'SELECT ' + cols + ' FROM ' + t + w.sql;
          const order = url.searchParams.get('order');
          if (order) {
            const om = order.match(/^([a-z_][a-z0-9_]*)(\.(asc|desc))?(?:,|$)/);
            if (om) sql += ' ORDER BY "' + om[1] + '" ' + (om[3] === 'desc' ? 'DESC' : 'ASC');
          }
          const limit = url.searchParams.get('limit');
          if (limit) sql += ' LIMIT ' + parseInt(limit, 10);
          const r = await db.prepare(sql).bind(...w.vals).all();
          const rows = (r.results || []).map(rowOut);
          if (wantObj) return j(rows.length ? rows[0] : null);
          return j(rows);
        }
        if (req.method === 'POST') {
          const body = await req.json();
          const rows = Array.isArray(body) ? body : [body];
          if (!rows.length) return j([], 201);
          const allCols = [...new Set(rows.flatMap(r => Object.keys(r)))];
          const colSql = allCols.map(c => '"' + c + '"').join(',');
          const stmts = rows.map(r => {
            const vals = allCols.map(c => sqlVal(r[c]));
            return db.prepare('INSERT OR IGNORE INTO ' + t + ' (' + colSql + ') VALUES (' + allCols.map(() => '?').join(',') + ')').bind(...vals);
          });
          await db.batch(stmts);
          if (prefer.includes('return=representation')) {
            const ids = rows.map(r => String(r.id)).filter(Boolean);
            if (ids.length) {
              const r2 = await db.prepare('SELECT * FROM ' + t + ' WHERE id IN (' + ids.map(() => '?').join(',') + ')').bind(...ids).all();
              const out = r2.results || [];
              return j(wantObj ? (out[0] || null) : out, 201);
            }
            const r2 = await db.prepare('SELECT * FROM ' + t + ' LIMIT ?').bind(rows.length).all();
            return j(r2.results || [], 201);
          }
          return new Response(null, { status: 201, headers: CORS });
        }
        if (req.method === 'PATCH' || req.method === 'PUT') {
          const body = await req.json();
          const w = buildWhere(url);
          if (!w.sql) return jerr('UPDATE requires a filter', 400, 'PGRST103');
          const keys = Object.keys(body);
          const sets = keys.map(k => '"' + k + '" = ?');
          const vals = keys.map(k => sqlVal(body[k]));
          await db.prepare('UPDATE ' + t + ' SET ' + sets.join(',') + w.sql).bind(...vals, ...w.vals).run();
          if (prefer.includes('return=representation')) {
            const r2 = await db.prepare('SELECT * FROM ' + t + w.sql).bind(...w.vals).all();
            const out = r2.results || [];
            return j(wantObj ? (out[0] || null) : out);
          }
          return new Response(null, { status: 204, headers: CORS });
        }
        if (req.method === 'DELETE') {
          const w = buildWhere(url);
          if (!w.sql) return jerr('DELETE requires a filter', 400, 'PGRST103');
          if (t === 'mensagens' && env.R2_TOKEN) {
            /* R60: mensagens expiram em 24h → arquivos delas no R2 expiram junto */
            try {
              const velhas = await db.prepare('SELECT url FROM ' + t + w.sql + ' LIMIT 200').bind(...w.vals).all();
              const paths = (velhas.results || []).map(x => String(x.url || '')).filter(u => u.indexOf('/storage/v1/object/public/fenix-arquivos/') >= 0).map(u => decodeURIComponent(u.split('fenix-arquivos/')[1] || ''));
              if (paths.length) await Promise.all(paths.map(pp => r2Del(pp, env.R2_TOKEN)));
            } catch (e) { /* R2 falhou → apaga só no banco */ }
          }
          const r2 = await db.prepare('DELETE FROM ' + t + w.sql).bind(...w.vals).run();
          return new Response(null, { status: 204, headers: CORS });
        }
        return jerr('method not allowed', 405);
      }

      /* ============ STORAGE ============ */
      const mUp = p.match(/^\/storage\/v1\/object\/fenix-arquivos\/(.+)$/);
      if (mUp && req.method === 'POST') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const path = decodeURIComponent(mUp[1]);
        const mime = req.headers.get('content-type') || 'application/octet-stream';
        const buf = await req.arrayBuffer();
        if (buf.byteLength > 12 * 1024 * 1024) return jerr('Payload too large', 413);
        if (env.R2_TOKEN) {
          const ok = await r2Put(path, buf, mime, env.R2_TOKEN);
          if (ok) return j({ Key: path, r2: true });
          /* R2 falhou → segue pro D1 como antes (não perde o arquivo) */
        }
        const b64 = ab2b64(buf);
        await env.DB.prepare('INSERT OR REPLACE INTO fotos (path,mime,bytes,data) VALUES (?,?,?,?)')
          .bind(path, mime, buf.byteLength, b64).run();
        return j({ Key: path });
      }
      const mPub = p.match(/^\/storage\/v1\/object\/public\/fenix-arquivos\/(.+)$/);
      if (mPub && req.method === 'GET') {
        const path = decodeURIComponent(mPub[1]);
        if (env.R2_TOKEN) {
          const rf = await r2Get(path, env.R2_TOKEN);
          if (rf) return new Response(rf.body, { status: 200, headers: {
            'content-type': rf.headers.get('content-type') || 'application/octet-stream',
            'cache-control': 'public, max-age=3600', ...CORS } });
        }
        const f = await env.DB.prepare('SELECT mime,data FROM fotos WHERE path = ?').bind(path).first();
        if (!f) return new Response('Not found', { status: 404, headers: CORS });
        return new Response(b642ab(f.data), {
          status: 200,
          headers: { 'content-type': f.mime || 'application/octet-stream', 'cache-control': 'public, max-age=3600', ...CORS },
        });
      }
      const mDel = p.match(/^\/storage\/v1\/object\/fenix-arquivos\/(.+)$/);
      if (mDel && req.method === 'DELETE') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        if (env.R2_TOKEN) await r2Del(decodeURIComponent(mDel[1]), env.R2_TOKEN);
        await env.DB.prepare('DELETE FROM fotos WHERE path = ?').bind(decodeURIComponent(mDel[1])).run();
        return j({ message: 'Successfully deleted' });
      }

      if (p === '/ia-ok') { /* diagnóstico público: pergunta fixa, sem dado de cliente */
        try{
          const t0=Date.now();
          let motor='workers-ai',out=null;
          if(env.GROQ_KEY){motor='groq';out=await groqChat(env.GROQ_KEY,[{role:'user',content:'Responda em UMA frase curta em português: está tudo funcionando?'}]);}
          if(!out||!out.resposta){motor='workers-ai';out=await aiChat(env,[{role:'user',content:'Responda em UMA frase curta em português: está tudo funcionando?'}]);}
          return j({ok:!!out.resposta,motor,resposta:out.resposta,ms:Date.now()-t0});
        }catch(e){return j({ok:false,erro:String(e&&e.message||e).slice(0,200)})}
      }
      if (p === '/ia' && req.method === 'POST') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const b = await req.json().catch(()=>null);
        const q = String(b&&b.pergunta||'').slice(0,600);
        const ctx = String(b&&b.contexto||'').slice(0,6000);
        if(!q) return jerr('pergunta vazia',400);
        const hist=Array.isArray(b.historico)?b.historico.slice(-10).filter(h=>h&&(h.role==='user'||h.role==='assistant')&&typeof h.content==='string').map(h=>({role:h.role,content:h.content.slice(0,2000)})):[];
        const modo=String(b&&b.modo||'').slice(0,20);
        const sysBase=(modo==='resumo')?(IA_RESUMO+'\n\nRELATÓRIO:\n'+ctx):(modo==='post')?(IA_POST+'\n\nCONTEXTO DO ESTÚDIO:\n'+ctx):(IA_SYS+'\n\nDADOS ATUAIS DA CLÍNICA:\n'+ctx);
        const msgs=[{role:'system',content:sysBase}].concat(hist).concat([{role:'user',content:q}]);
        let motor='workers-ai',out=null;
        try{
          if(env.GROQ_KEY){motor='groq';out=await groqChat(env.GROQ_KEY,msgs);}
          if(!out||!out.resposta){motor='workers-ai';out=await aiChat(env,msgs);}
        }catch(e){
          try{motor='workers-ai';out=await aiChat(env,msgs);}catch(e2){return jerr('IA indisponível: '+String(e2&&e2.message||e2).slice(0,120),502)}
        }
        return j({resposta:(out&&out.resposta)||'',motor});
      }
      if (p === '/r2-ok') return j({ ok: true, r2: !!env.R2_TOKEN });

      return jerr('Not found: ' + p, 404, 'not_found');
    } catch (e) {
      return jerr('Erro interno: ' + (e && e.message ? e.message : String(e)), 500, 'internal');
    }
  },
};