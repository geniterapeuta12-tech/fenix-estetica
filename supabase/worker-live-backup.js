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
const IA_POST='Você cria posts de Instagram para um estúdio de estética. Responda SOMENTE com um JSON válido, sem nenhum texto fora dele, exatamente neste formato: {"titulo":"...","chamada":"...","beneficios":["..."],"legenda":"..."}. REGRAS OBRIGATÓRIAS: (0) MELHORAR ROTEIRO: se o pedido começar com «MELHORAR ROTEIRO DO USUÁRIO», NÃO invente tema novo: preserve as ideias, o nome EXATO dos serviços e a ordem do texto do usuário, apenas melhore a escrita (ortografia, clareza, emojis e hashtags) e devolva o mesmo JSON. (1) FIDELIDADE AO PEDIDO — use EXATAMENTE o serviço/termo que o usuário escreveu, com as mesmas palavras; se ele escreveu «ozônio terapia capilar», o título e a legenda devem conter «Ozônio Terapia Capilar» — NUNCA troque por termo genérico tipo «cuidar dos cabelos» ou «tratamento capilar». (2) titulo: o nome do serviço/oferta do pedido, até 6 palavras. (3) chamada: 1 frase curta de apoio (máximo 110 caracteres), citando o serviço exato. (4) beneficios: SEMPRE inclua 3 ou 4 benefícios REAIS e ESPECÍFICOS do serviço exato, cada um com até 5 palavras, sem ponto final — exemplo para ozônio terapia capilar: ["Fortalece os fios","Reduz a queda","Brilho intenso","Estimula o crescimento"]; só devolva lista vazia [] se o pedido não for sobre um serviço ou tratamento. (5) legenda: comece com o nome EXATO do serviço; depois 1 ou 2 frases; depois a linha «✨ Benefícios:» e cada benefício em linha própria começando com ✅; termine chamando para agendar e coloque 6 a 10 hashtags ESPECÍFICAS do serviço (ex.: #ozonioterapiacapilar #saudecapilar) mais 2 ou 3 gerais; use 2 a 4 emojis. Estilo: elegante, acolhedor, sofisticado. Conhecimento de estética: limpeza de pele, massagem modeladora, drenagem linfática, design de sobrancelhas, nail design, ozônio terapia e tratamentos capilares em geral; foque em benefícios e bem-estar; NUNCA prometa resultado médico ou curativo.';
const IA_CLIENTE='Você é a assistente virtual do espaço da cliente de um estúdio de estética. Responda APENAS com base nos DADOS DA CLIENTE abaixo — nunca invente números, datas ou valores. Se a informação não estiver nos dados, diga que não sabe e sugira falar com o estúdio. NUNCA agende, remarque ou cancele nada: se a cliente pedir isso, responda que para agendar ela deve falar direto com o estúdio (informe o contato se houver). Fale APENAS de assuntos relacionados a esta cliente e aos dados dela listados acima. Se perguntarem qualquer outra coisa (curiosidades, notícias, receitas, assuntos alheios ao espaço dela), recuse com gentileza em 1 frase e ofereça ajuda com os dados dela (sessões, pacotes, pagamentos). Responda em português, curtinho (2 a 5 frases), tom acolhedor.';
const IA_REL='Você responde perguntas SOBRE O RELATÓRIO de um estúdio de estética que está no texto abaixo. Use SOMENTE os números e nomes do relatório — nunca invente. Se a resposta não estiver no relatório, diga claramente que o relatório não tem essa informação. Responda em português, direto ao ponto, podendo usar pequenos tópicos.';
const IA_DOC='Você escreve e melhora textos e documentos para um estúdio de estética: mensagens para clientes, orientações de cuidados pós-procedimento, descrições de serviços, listas de preços, avisos e contratos simples. Responda SOMENTE com o texto final, pronto para usar, sem comentários e sem explicações. Se pedirem para melhorar: mantenha as informações e deixe mais claro, elegante e bem escrito. Se pedirem para resumir: encurte mantendo o essencial. Se pedirem para corrigir: corrija ortografia e gramática sem mudar o estilo da pessoa. Use o nome exato dos serviços que aparecerem no pedido. Tom acolhedor e profissional. NUNCA dê orientação médica nem prometa resultado curativo; em orientações de cuidados use linguagem de bem-estar e, se houver reação adversa, recomende procurar o estúdio ou um profissional.';
/* R81 — cotas de uso da I.A por clínica/dia (reset à meia-noite de Brasília) */
const IA_COTAS={chat:100,post:30,doc:30,rel:30,cliente:30,agente:20};
/* R86 — Modo Agente: missão em etapas com VÁRIOS arquivos prontos */
const IA_AGENTE='Você é o MODO AGENTE da Fênix, assistente do estúdio de estética. Recebe UMA MISSÃO e EXECUTA sozinho em etapas. Regras: use SÓ os DADOS fornecidos (nunca invente números); não dê conselho médico; português simples; você NÃO altera dados do app — você CRIA ARQUIVOS. FORMATO OBRIGATÓRIO: (1) <pensamento>…</pensamento> com o PLANO em etapas numeradas curtas (ex.: «1. vou olhar os dados… 2. vou montar… 3. vou criar os arquivos…»); (2) depois CRIE de 2 a 4 ARQUIVOS completos, cada um num bloco próprio: <canvas tipo="texto" titulo="Nome claro do arquivo">conteúdo completo do arquivo</canvas> — use tipo="pdf" para documento formal (protocolo, contrato, tabela de preços). Arquivos CAPRICHADOS e completos (títulos, seções, listas, prontos pra usar). (3) Se a missão for organizar/resumir ARQUIVOS EXISTENTES (a lista vem em ARQUIVOS DA BIBLIOTECA), NÃO crie vários: gere UM ÚNICO canvas consolidado com as seções «O principal», «Observações» e «Resumo organizado». Termine com resposta curta dizendo o que entregou.';
const IA_COTAS_ROTULO={chat:'Fênix I.A (chat)',post:'Gerador de Posts',doc:'I.A dos Documentos',rel:'I.A dos Relatórios',cliente:'I.A da cliente',agente:'Modo Agente'};
const USO_COTA_DB=262144000; /* cota amigável do banco por clínica: 250 MB */
async function cotaBate(env,cli,tipo){
  try{
    const dia=new Date(Date.now()-3*3600e3).toISOString().slice(0,10);
    const lim=IA_COTAS[tipo]||30;
    const r=await env.DB.prepare('INSERT INTO uso_ia (clinic_id,dia,tipo,qtd) VALUES (?1,?2,?3,1) ON CONFLICT (clinic_id,dia,tipo) DO UPDATE SET qtd=qtd+1 RETURNING qtd').bind(cli,dia,tipo).first();
    const qtd=(r&&r.qtd)||1;
    return {ok:qtd<=lim,qtd,limite:lim,dia};
  }catch(e){return {ok:true,qtd:0,limite:(IA_COTAS[tipo]||30),dia:'',aberto:true};}
}
function cotaJerr(tipo,c){return jerr('A cota de hoje acabou ('+(IA_COTAS_ROTULO[tipo]||tipo)+': '+c.limite+'/dia por clínica). O contador zera à meia-noite — amanhã volta normal.',429,'cota');}
async function aiChat(env,msgs,maxTokens){
  try{
    const r=await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast',{messages:msgs,max_tokens:maxTokens||1200,temperature:0.4});
    return {resposta:(r&&r.response)||''};
  }catch(e){
    const r=await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast',{messages:msgs,max_tokens:maxTokens||1200,temperature:0.4});
    return {resposta:(r&&r.response)||''};
  }
}
async function groqChat(key,msgs,maxTokens){
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'authorization':'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:msgs,max_tokens:maxTokens||1200,temperature:0.4})});
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
  const clin = await db.prepare('SELECT nome, wa, insta FROM clinics WHERE id = ?').bind(c.clinic_id).first();
  const pt = await db.prepare('SELECT COALESCE(SUM(valor),0) t FROM pagamentos WHERE cliente_id = ?').bind(pId).first();
  /* R82 — «pago» por pacote: pagamentos vinculados + distribuição FIFO dos SEM vínculo
     (assim QUALQUER pagamento registrado diminui o valor que falta pro pacote acabar) */
  const prows = await db.prepare('SELECT id, nome, valor, sessoes, itens FROM pacotes WHERE cliente_id = ? ORDER BY criado_em').bind(pId).all();
  const pgall = await db.prepare('SELECT pacote_id, valor FROM pagamentos WHERE cliente_id = ? ORDER BY data').bind(pId).all();
  const feitasMap = {};
  try { const fr = await db.prepare("SELECT pacote_id pid, COUNT(*) n FROM sessoes WHERE cliente_id = ? AND feita IN (1,'1','true','tru') GROUP BY pacote_id").bind(pId).all(); (fr.results || []).forEach(f => { feitasMap[f.pid] = f.n; }); } catch (e) {}
  let fila = (pgall.results || []).filter(x => !x.pacote_id).map(x => Number(x.valor) || 0);
  const pagoDir = {}; (pgall.results || []).forEach(x => { if (x.pacote_id) pagoDir[x.pacote_id] = (pagoDir[x.pacote_id] || 0) + (Number(x.valor) || 0); });
  let pacotes = (prows.results || []).map(p => {
    let pago = pagoDir[p.id] || 0;
    let falta = Math.max(0, (Number(p.valor) || 0) - pago);
    for (let i = 0; i < fila.length && falta > 0; ) { const usa = Math.min(fila[i], falta); fila[i] -= usa; falta -= usa; pago += usa; if (fila[i] <= 0.005) fila.splice(i, 1); else i++; }
    let itens = []; try { itens = p.itens ? JSON.parse(p.itens) : []; } catch (e) { itens = []; }
    return { nome: p.nome, valor: p.valor, qtd: p.sessoes, itens: itens, feitas: feitasMap[p.id] || 0, pago: pago };
  });
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
      SELECT * FROM fx_sessoes WHERE cliente_id = ? AND feita IN (1,'1','true','tru') AND data IS NOT NULL
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
    wa: (clin && clin.wa) || null,
    insta: (clin && clin.insta) || null,
    pago_total: pt ? pt.t : 0,
    pacotes: Array.isArray(pacotes) ? pacotes : (jsafe(pacotes) || []),
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

async function zipLer(bytes){ /* parser ZIP mínimo: só entradas sem compressão e deflate */
const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const out=[]; let i=bytes.length-22;
while(i>=0&&dv.getUint32(i,true)!==0x06054b50) i--;
if(i<0) return out;
const n=dv.getUint16(i+10,true); let p=dv.getUint32(i+16,true);
const td=new TextDecoder();
for(let k=0;k<n;k++){
  if(dv.getUint32(p,true)!==0x02014b50) break;
  const metodo=dv.getUint16(p+10,true);
  const tamComp=dv.getUint32(p+20,true);
  const nl=dv.getUint16(p+28,true); const el=dv.getUint16(p+30,true); const cl=dv.getUint16(p+32,true);
  const offLocal=dv.getUint32(p+42,true);
  const nome=td.decode(bytes.subarray(p+46,p+46+nl));
  if(dv.getUint32(offLocal,true)===0x04034b50){
    const nl2=dv.getUint16(offLocal+26,true); const el2=dv.getUint16(offLocal+28,true);
    const ini=offLocal+30+nl2+el2;
    const dados=bytes.subarray(ini,ini+tamComp);
    if(metodo===0) out.push({nome,dados});
    else if(metodo===8){ try{ out.push({nome,dados:await inflarRaw(dados,tamComp)}); }catch(e){} }
  }
  p+=46+nl+el+cl;
}
return out;
}
async function inflarRaw(dados,tamOrig){ /* RFC1951 via DecompressionStream nativo */
const ds=new DecompressionStream('deflate-raw');
const stream=new Blob([dados]).stream().pipeThrough(ds);
const buf=await new Response(stream).arrayBuffer();
return new Uint8Array(buf);
}

/* ═══════════ P1 — PLATAFORMA FÊNIX: CONTA ÚNICA (contas + sessões) ═══════════ */
let fxTabelasOk = false;
async function fxTabelas(env) {
  if (fxTabelasOk) return;
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS fx_contas (id TEXT PRIMARY KEY, email TEXT UNIQUE, pw TEXT, nome TEXT DEFAULT '', papel TEXT DEFAULT 'clinica', clinica_id TEXT, status TEXT DEFAULT 'ativa', criada_em TEXT);
CREATE TABLE IF NOT EXISTS fx_sessoes (token TEXT PRIMARY KEY, conta_id TEXT, criada_em TEXT, expira_em TEXT);
CREATE TABLE IF NOT EXISTS fx_tokens_abrir (token TEXT PRIMARY KEY, conta_id TEXT, alvo TEXT DEFAULT 'estetica', criada_em TEXT, expira_em TEXT, usado INTEGER DEFAULT 0);`);
  fxTabelasOk = true;
}
const fxToken = () => [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join('');
const fxLimite = new Map();
function fxPorteira(ip) { const n = (fxLimite.get(ip) || 0) + 1; fxLimite.set(ip, n); setTimeout(() => fxLimite.delete(ip), 60000); return n <= 12; }
async function fxContaPub(c) { return { email: c.email, nome: c.nome || '', papel: c.papel, clinica_id: c.clinica_id || null, status: c.status }; }
async function fxSBSessao(env, c) { /* R92 — ponte: conta Fênix → sessão supabase da clínica (o app entra inteiro) */
  if (!c || !c.clinica_id) return null;
  const u = await env.DB.prepare('SELECT * FROM auth_users WHERE id = ?').bind(c.clinica_id).first();
  return u ? await sessionFor(u, env.FENIX_SECRET) : null;
}
async function fxAbrirSessao(env, contaId) {
  const t = fxToken(), agora = Date.now();
  await env.DB.prepare('INSERT INTO fx_sessoes (token,conta_id,criada_em,expira_em) VALUES (?,?,?,?)')
    .bind(t, contaId, new Date(agora).toISOString(), new Date(agora + 30 * 864e5).toISOString()).run();
  return t;
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    const secret = env.FENIX_SECRET;

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    try {
      /* ============ P1 — CONTA FÊNIX (login único da Plataforma) ============ */
      if (p.startsWith('/auth-fenix/')) {
        await fxTabelas(env);
        const ip = req.headers.get('cf-connecting-ip') || 'x';
        /* login: aceita conta Fênix OU o login que a clínica já usa (migra sozinho) */
        if (req.method === 'POST' && p === '/auth-fenix/login') {
          if (!fxPorteira(ip)) return jerr('Muitas tentativas — espera um minutinho.', 429, 'rate_limited');
          const b = await req.json();
          let email = String(b.email || '').trim().toLowerCase(), pass = String(b.password || '');
          if (email && email.indexOf('@') < 0) email = email + '@clinicas.fenix.app'; /* R93 — aceita só o nome da clínica */
          if (!email || !pass) return jerr('Preenche email e senha.', 400, 'validation');
          let c = await env.DB.prepare('SELECT * FROM fx_contas WHERE email = ?').bind(email).first();
          if (!c) {
            const u = await env.DB.prepare('SELECT * FROM auth_users WHERE email = ?').bind(email).first();
            if (!u || !(await checkPass(pass, u.pw))) return jerr('Email ou senha errados.', 401, 'invalid_credentials');
            const c1 = await env.DB.prepare('SELECT id FROM clinics LIMIT 1').first();
            const papel = (c1 && u.id === c1.id) ? 'dono' : 'clinica';
            const id = crypto.randomUUID();
            await env.DB.prepare('INSERT INTO fx_contas (id,email,pw,nome,papel,clinica_id,status,criada_em) VALUES (?,?,?,?,?,?,?,?)')
              .bind(id, email, u.pw, email.split('@')[0], papel, u.id, 'ativa', new Date().toISOString()).run();
            c = await env.DB.prepare('SELECT * FROM fx_contas WHERE id = ?').bind(id).first();
          } else if (!(await checkPass(pass, c.pw))) return jerr('Email ou senha errados.', 401, 'invalid_credentials');
          if (c.status !== 'ativa') return jerr('Essa conta está bloqueada — fala com o suporte Fênix.', 403, 'bloqueada');
          const sbx = await fxSBSessao(env, c);
          const token = await fxAbrirSessao(env, c.id);
          return j({ ok: true, token, sb: sbx, conta: await fxContaPub(c) });
        }
        /* R93 — CRIAR CONTA público (a clínica se cadastra sozinha na Center): já cria tudo pra entrar no app na hora */
        if (req.method === 'POST' && p === '/auth-fenix/criar-clinica') {
          if (!fxPorteira(ip)) return jerr('Muitas tentativas — espera um minutinho.', 429, 'rate_limited');
          const b = await req.json();
          const email = String(b.email || '').trim().toLowerCase(), pass = String(b.password || '');
          const nome = String(b.nome || '').trim().slice(0, 80);
          if (!email.includes('@') || email.indexOf('@') !== email.lastIndexOf('@')) return jerr('Email no formato nome@clinica.', 400, 'validation');
          if (pass.length < 6) return jerr('A senha precisa de pelo menos 6 caracteres.', 400, 'validation');
          if (nome.length < 2) return jerr('Diz o nome da clínica.', 400, 'validation');
          const ex = await env.DB.prepare('SELECT id FROM fx_contas WHERE email = ?').bind(email).first();
          if (ex) return jerr('Já existe conta com esse email — é só entrar.', 422, 'ja_existe');
          const exu = await env.DB.prepare('SELECT id FROM auth_users WHERE email = ?').bind(email).first();
          if (exu) return jerr('Já existe conta com esse email — é só entrar.', 422, 'ja_existe');
          const id1 = crypto.randomUUID(), pw1 = await hashPass(pass);
          await env.DB.prepare('INSERT INTO fx_contas (id,email,pw,nome,papel,clinica_id,status,criada_em) VALUES (?,?,?,?,?,?,?,?)')
            .bind(id1, email, pw1, nome, 'clinica', id1, 'ativa', new Date().toISOString()).run();
          await env.DB.prepare('INSERT INTO auth_users (id,email,pw,meta,criado_em) VALUES (?,?,?,?,?)')
            .bind(id1, email, pw1, JSON.stringify({ nome }), new Date().toISOString()).run();
          try { await env.DB.prepare('INSERT INTO clinics (id,key,nome) VALUES (?,?,?)')
            .bind(id1, email.split('@')[0], nome).run(); } catch (e) {}
          const c = await env.DB.prepare('SELECT * FROM fx_contas WHERE id = ?').bind(id1).first();
          const sbx = await fxSBSessao(env, c);
          const token = await fxAbrirSessao(env, c.id);
          return j({ ok: true, token, sb: sbx, conta: await fxContaPub(c), msg: 'Conta criada! Já pode usar o app com ela.' });
        }
        /* conferir sessão (os apps chamam isso a cada abertura) */
        if (p === '/auth-fenix/confere') {
          const t = url.searchParams.get('token') || '';
          const s2 = await env.DB.prepare('SELECT * FROM fx_sessoes WHERE token = ?').bind(t).first();
          if (!s2 || new Date(s2.expira_em) < new Date()) return jerr('Sessão expirada — loga de novo.', 401, 'sessao_invalida');
          const c = await env.DB.prepare('SELECT * FROM fx_contas WHERE id = ?').bind(s2.conta_id).first();
          if (!c || c.status !== 'ativa') return jerr('Conta bloqueada.', 403, 'bloqueada');
          return j({ ok: true, conta: await fxContaPub(c) });
        }
        /* gerar token de 1 USO (10 min) pra abrir um app já logado */
        if (req.method === 'POST' && p === '/auth-fenix/abrir') {
          const b = await req.json();
          const s2 = await env.DB.prepare('SELECT * FROM fx_sessoes WHERE token = ?').bind(String(b.token || '')).first();
          if (!s2 || new Date(s2.expira_em) < new Date()) return jerr('Sessão expirada.', 401, 'sessao_invalida');
          const c = await env.DB.prepare('SELECT * FROM fx_contas WHERE id = ?').bind(s2.conta_id).first();
          if (!c || c.status !== 'ativa') return jerr('Conta bloqueada.', 403, 'bloqueada');
          const t = fxToken();
          await env.DB.prepare('INSERT INTO fx_tokens_abrir (token,conta_id,alvo,criada_em,expira_em,usado) VALUES (?,?,?,?,?,0)')
            .bind(t, c.id, String(b.alvo || 'estetica'), new Date().toISOString(), new Date(Date.now() + 6e5).toISOString()).run();
          return j({ ok: true, token_abrir: t, expira_em: new Date(Date.now() + 6e5).toISOString() });
        }
        /* usar o token de 1 uso (o app chama ao abrir por dentro da Center) */
        if (req.method === 'POST' && p === '/auth-fenix/usar-abrir') {
          const b = await req.json();
          const t = await env.DB.prepare('SELECT * FROM fx_tokens_abrir WHERE token = ?').bind(String(b.token_abrir || '')).first();
          if (!t || t.usado || new Date(t.expira_em) < new Date()) return jerr('Token de abertura inválido ou vencido.', 401, 'token_invalido');
          await env.DB.prepare('UPDATE fx_tokens_abrir SET usado = 1 WHERE token = ?').bind(t.token).run();
          const c = await env.DB.prepare('SELECT * FROM fx_contas WHERE id = ?').bind(t.conta_id).first();
          if (!c || c.status !== 'ativa') return jerr('Conta bloqueada.', 403, 'bloqueada');
          const sbx = await fxSBSessao(env, c);
          const token = await fxAbrirSessao(env, c.id);
          return j({ ok: true, token, sb: sbx, conta: await fxContaPub(c) });
        }
        /* a partir daqui: só DONO */
        const authH = String(req.headers.get('x-fenix-sessao') || '');
        const sD = await env.DB.prepare('SELECT s.token AS tk, s.expira_em AS expira_em, c.papel AS papel, c.status AS status, c.id AS id FROM fx_sessoes s JOIN fx_contas c ON c.id = s.conta_id WHERE s.token = ?').bind(authH).first();
        const ehDono = sD && sD.papel === 'dono' && sD.status === 'ativa' && new Date(sD.expira_em || 0) > new Date();
        if (!ehDono) return jerr('Só o dono Fênix faz isso.', 403, 'so_dono');
        if (req.method === 'GET' && p === '/auth-fenix/lista') {
          const rs = await env.DB.prepare('SELECT id,email,nome,papel,clinica_id,status,criada_em FROM fx_contas ORDER BY criada_em DESC LIMIT 500').all();
          return j({ ok: true, contas: rs.results || [] });
        }
        if (req.method === 'POST' && p === '/auth-fenix/criar-conta') {
          const b = await req.json();
          const email = String(b.email || '').trim().toLowerCase(), pass = String(b.password || '');
          if (!email.includes('@') || pass.length < 6) return jerr('Email válido e senha de 6+ caracteres.', 400, 'validation');
          const ex = await env.DB.prepare('SELECT id FROM fx_contas WHERE email = ?').bind(email).first();
          if (ex) return jerr('Já existe conta com esse email.', 422, 'ja_existe');
          const papel = ['dono', 'clinica', 'equipe'].includes(b.papel) ? b.papel : 'clinica';
          const id = crypto.randomUUID();
          await env.DB.prepare('INSERT INTO fx_contas (id,email,pw,nome,papel,clinica_id,status,criada_em) VALUES (?,?,?,?,?,?,?,?)')
            .bind(id, email, await hashPass(pass), String(b.nome || '').slice(0, 80), papel, String(b.clinica_id || '') || null, 'ativa', new Date().toISOString()).run();
          return j({ ok: true, id });
        }
        if (req.method === 'POST' && p === '/auth-fenix/bloquear') {
          const b = await req.json();
          const st = b.status === 'ativa' ? 'ativa' : 'bloqueada';
          const r2 = await env.DB.prepare('UPDATE fx_contas SET status = ? WHERE email = ?').bind(st, String(b.email || '').trim().toLowerCase()).run();
          if (st === 'bloqueada') await env.DB.prepare('DELETE FROM fx_sessoes WHERE conta_id IN (SELECT id FROM fx_contas WHERE email = ?)').bind(String(b.email || '').trim().toLowerCase()).run();
          return j({ ok: true, status: st, mudou: r2.meta && r2.meta.changes || 0 });
        }
        return jerr('Rota da conta Fênix não encontrada.', 404, 'not_found');
      }
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
        const uid = pl.sub || pl.id || pl.user_id;
        if(!uid) return jerr('Sessão inválida.',401);
        /* R81 — bytes reais da clínica: soma das colunas de texto por tabela (WHERE clinic_id) */
        const TABELAS=[
          ['arquivos','url','nome'],
          ['mensagens','texto','nome'],
          ['documentos','titulo','texto','guias'],
          ['formularios','titulo','descr','estrutura'],
          ['clientes','nome','cpf','nasc','tel','email','end','obs'],
          ['pagamentos','metodo','obs'],
          ['sessoes','obs'],
          ['pacotes','nome'],
          ['catalogo_itens','nome','descr','foto'],
          ['catalogo_kits','nome','descr','itens','foto'],
          ['alarmes','label','som','data'],
          ['usuarios','username','nome','info'],
          ['workspaces','nome','descr']
        ];
        let bytes=0;
        try{
          for(const t of TABELAS){
            const sql='SELECT COALESCE(SUM('+t.slice(1).map(c=>"COALESCE(LENGTH(\""+c+"\"),0)").join('+')+'),0) AS b FROM "'+t[0]+'" WHERE clinic_id = ?';
            const r=await env.DB.prepare(sql).bind(uid).first();
            bytes+=((r&&r.b)||0);
          }
        }catch(e){bytes=0;}
        const r0 = await env.DB.prepare('SELECT id FROM mensagens LIMIT 1').run();
        const total_db = (r0.meta && r0.meta.size_after) || 0;
        return j({ bytes, quota: USO_COTA_DB, pct: +(bytes / USO_COTA_DB * 100).toFixed(3), total_db, atualizado_em: new Date().toISOString() });
      }
      if (p === '/ia-uso' && req.method === 'GET') { /* R81 — cotas da I.A usadas hoje */
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const uid = pl.sub || pl.id || pl.user_id;
        if(!uid) return jerr('Sessão inválida.',401);
        const dia=new Date(Date.now()-3*3600e3).toISOString().slice(0,10);
        const uso={};
        try{const r=await env.DB.prepare('SELECT tipo,qtd FROM uso_ia WHERE clinic_id = ? AND dia = ?').bind(uid,dia).all();
          (r.results||[]).forEach(x=>{uso[x.tipo]=x.qtd;});}catch(e){}
        return j({ dia, cotas: IA_COTAS, uso, atualizado_em: new Date().toISOString() });
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
      if (p === '/doc-texto' && req.method === 'POST') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        try{
          const b = await req.json().catch(()=>null);
          const b64 = String(b&&b.b64||'');
          const nome = String(b&&b.nome||'').slice(0,120);
          if(!b64||b64.length>9500000) return jerr('Arquivo grande demais (limite ~7 MB).',400);
          const bin = atob(b64); const bytes = new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          let texto='';
          if(bytes[0]===0x50&&bytes[1]===0x4b){ /* ZIP (docx/odt) */
            const files=await zipLer(bytes);
            const dec=new TextDecoder('utf-8',{fatal:false});
            let xml='';
            for(const nm of ['word/document.xml','content.xml']){ const f=files.find(x=>x.nome===nm); if(f){ xml=dec.decode(f.dados); break; } }
            if(!xml) throw new Error('Formato de documento não reconhecido.');
            xml=xml.replace(/<\/w:p>/g,'\n').replace(/<w:tab[^>]*\/>/g,' ').replace(/<\/text:p>/g,'\n').replace(/<text:tab[^>]*\/>/g,' ');
            texto=xml.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();
          }else if(bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46){ /* PDF */
            const raw=new TextDecoder('latin1').decode(bytes);
            const chunks=[]; const re=/\(((?:\\.|[^\\()])*)\)\s*T[jJ]/g; let m;
            while((m=re.exec(raw))!==null){ let t=m[1];
              t=t.replace(/\\(\d{3})/g,(x,o)=>String.fromCharCode(parseInt(o,8)));
              t=t.replace(/\\([()\\])/g,'$1').replace(/\\n/g,'\n').replace(/\\r/g,'');
              chunks.push(t); }
            texto=chunks.join(' ').replace(/\s{2,}/g,' ').trim();
            if(texto.length<20) throw new Error('PDF sem texto extraível (só imagem) — tira um print e anexa a foto.');
          }else{
            texto=new TextDecoder('utf-8',{fatal:false}).decode(bytes);
          }
          if(!texto.trim()) throw new Error('Não achei texto legível nesse arquivo.');
          return j({texto:texto.slice(0,60000),nome:nome});
        }catch(e){ return jerr('Não consegui ler o documento: '+String(e&&e.message||e).slice(0,120),422); }
      }
      if (p === '/ia-cliente' && req.method === 'POST') {
        try{
          const b = await req.json().catch(()=>null);
          const pid = String(b&&b.p_id||'').slice(0,64);
          const q = String(b&&b.pergunta||'').slice(0,500).trim();
          if(!pid||!q) return jerr('Pedido inválido.',400);
          /* R81 — cota diária da I.A da cliente (por clínica) */
          try{const rc=await env.DB.prepare('SELECT clinic_id FROM clientes WHERE id = ?').bind(pid).first();
            if(rc&&rc.clinic_id){const cc=await cotaBate(env,rc.clinic_id,'cliente'); if(!cc.ok) return cotaJerr('cliente',cc);}}catch(e){}
          const ip = req.headers.get('cf-connecting-ip')||'x';
          const winG = globalThis.__fxThro = globalThis.__fxThro || new Map();
          const now = Date.now(); const arr = (winG.get(ip)||[]).filter(t=>now-t<3600000);
          if(arr.length>=40) return jerr('Muitas perguntas seguidas — tenta de novo mais tarde.',429);
          arr.push(now); winG.set(ip,arr);
          const d = await rpcClientePub(env, pid);
          if(!d||!d.cliente) return jerr('Cliente não encontrada.',404);
          if(d.erro==='sem_acesso') return jerr('Acesso pausado pela clínica.',403);
          const hist=Array.isArray(b.historico)?b.historico.slice(-6).filter(h=>h&&(h.role==='user'||h.role==='assistant')).map(h=>({role:h.role,content:String(h.content||'').slice(0,800)})):[];
          const ctxCli='CLIENTE: '+String(d.cliente.nome||'')+'\nCLÍNICA: '+String(d.clinica||'')+'\nPACOTES: '+JSON.stringify(d.pacotes)+'\nPRÓXIMAS SESSÕES: '+JSON.stringify(d.proximas)+'\nREALIZADAS (últimas): '+JSON.stringify(d.realizadas)+'\nPAGAMENTOS: '+JSON.stringify(d.pagamentos)+'\nTOTAL PAGO: '+String(d.pago_total);
          const contato=d.wa?('WhatsApp do estúdio: '+d.wa+'. '):'';
          const msgs=[{role:'system',content:IA_CLIENTE+'\n'+contato+(d.insta?('Instagram: @'+d.insta+'. '):'')+'\n\nDADOS DA CLIENTE:\n'+ctxCli}].concat(hist).concat([{role:'user',content:q}]);
          let out=null; try{ out=await aiChat(env,msgs); }catch(e){ return jerr('IA indisponível agora.',502); }
          if(!out||!out.resposta) return jerr('IA não respondeu agora.',502);
          return j({resposta:out.resposta});
        }catch(e){ return jerr('Falhou — tenta de novo.',500); }
      }
      if (p === '/ia-vis' && req.method === 'POST') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        /* R81 — cota (conta como I.A dos Documentos) */
        {const uidV=pl.sub||pl.id||pl.user_id; if(uidV){const cv=await cotaBate(env,uidV,'doc'); if(!cv.ok) return cotaJerr('doc',cv);}}
        try{
          const b = await req.json().catch(()=>null);
          const img = String(b&&b.imagem||'');
          const q = String(b&&b.pergunta||'Descreva esta imagem e o que nela importa para um estúdio de estética.').slice(0,600);
          if(img.indexOf('data:image/')!==0||img.length>2600000) return jerr('Imagem inválida ou grande demais.',400);
          const r=await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf',{image_url:img,prompt:q,max_tokens:512});
          const txt=(r&&r.description)||(r&&r.result)||'';
          if(!txt) return jerr('A I.A não conseguiu ler a imagem — manda outra ou escreve a dúvida.',502);
          return j({resposta:String(txt)});
        }catch(e){ return jerr('Não consegui ler a imagem agora — tenta de novo.',500); }
      }
      if (p === '/clinic-contato' && (req.method === 'POST' || req.method === 'GET')) {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const uid = pl.sub || pl.id || pl.user_id;
        if(!uid) return jerr('Sessão inválida.',401);
        if(req.method==='GET'){
          const r0 = await env.DB.prepare('SELECT wa, insta FROM clinics WHERE id = ?').bind(uid).first();
          return j({wa:(r0&&r0.wa)||'', insta:(r0&&r0.insta)||''});
        }
        const b = await req.json().catch(()=>null);
        const wa=String(b&&b.wa||'').slice(0,40).trim(), insta=String(b&&b.insta||'').replace(/^@/,'').slice(0,60).trim();
        await env.DB.prepare('UPDATE clinics SET wa = ?, insta = ? WHERE id = ?').bind(wa||null, insta||null, uid).run();
        return j({ok:true,wa:wa,insta:insta});
      }
      if (p === '/ia-imagem' && req.method === 'POST') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        /* R81 — cota (conta como Gerador de Posts) */
        {const uidI=pl.sub||pl.id||pl.user_id; if(uidI){const ci=await cotaBate(env,uidI,'post'); if(!ci.ok) return cotaJerr('post',ci);}}
        try{
          const b = await req.json().catch(()=>null);
          const t = String(b&&b.tema||'').slice(0,200).trim();
          const estilo=String(b&&b.estilo||'luxo').slice(0,20);
          const modelo=String(b&&b.modelo||'flux').slice(0,20);
          const ESTILOS={luxo:'dark black base with gold accents, luxury golden light, premium jewelry tones',marmore:'white marble texture with delicate gold veins, bright elegant spa mood',orquidea:'macro orchid petals close-up, soft cream and blush tones, dew drops, luxury botanical beauty',seda:'flowing golden silk fabric waves, warm champagne light, smooth elegant cloth texture',bokeh:'warm spa bokeh lights, candles and stones blurred, zen wellness mood',botanico:'eucalyptus and tropical leaves on dark background, botanical luxury, gold dust particles'};
          const st=ESTILOS[estilo]||ESTILOS.luxo;
          const MOD={flux:'@cf/black-forest-labs/flux-1-schnell',lucid:'@cf/leonardo/lucid-origin',phoenix:'@cf/leonardo/phoenix-1.0',sdxl:'@cf/stabilityai/stable-diffusion-xl-base-1.0',lightning:'@cf/bytedance/stable-diffusion-xl-lightning',dream:'@cf/lykon/dreamshaper-8-lcm'};
          const mdl=MOD[modelo]||MOD.flux;
          const prompt='Elegant beauty salon background art, '+st+'. About: '+t+'. Abstract textures only — NO people, NO faces, NO hands, NO text, NO letters, NO words, NO logos, NO watermark. Premium aesthetic, professional lighting, smooth depth, high detail.';
          if(!t) return jerr('Diga o tema do fundo.',400);
          const r=await env.AI.run(mdl,{prompt,steps:4});
          if(!r||!r.image) return jerr('A I.A de imagem não respondeu — tenta de novo.',502);
          return j({img:r.image});
        }catch(e){return jerr('Falhou a geração do fundo — tenta de novo em instantes.',500)}
      }
      if (p === '/ia' && req.method === 'POST') {
        const auth = req.headers.get('authorization') || '';
        const pl = await verifyJWT(auth.replace(/^Bearer /i, ''), secret);
        if (!pl) return jerr('Invalid API key', 401, 'invalid_api_key');
        const b = await req.json().catch(()=>null);
        const q = String(b&&b.pergunta||'').slice(0,600);
        const ctx = String(b&&b.contexto||'').slice(0,30000); /* R84: contexto completo — 6.000 cortava PAGAMENTOS/AGENDA e a I.A ficava «sem acesso» */
        if(!q) return jerr('pergunta vazia',400);
        const hist=Array.isArray(b.historico)?b.historico.slice(-10).filter(h=>h&&(h.role==='user'||h.role==='assistant')&&typeof h.content==='string').map(h=>({role:h.role,content:h.content.slice(0,2000)})):[];
        const modo=String(b&&b.modo||'').slice(0,20);
        /* R81 — cota de I.A (por clínica/dia) */
        const tipoC=(modo==='resumo'||modo==='rel')?'rel':((modo==='post'||modo==='doc')?modo:(modo==='agente'?'agente':'chat'));
        const cliIdC=pl.sub||pl.id||pl.user_id;
        if(cliIdC){const cota=await cotaBate(env,cliIdC,tipoC); if(!cota.ok) return cotaJerr(tipoC,cota);}
        const sysBase=(modo==='resumo')?(IA_RESUMO+'\n\nRELATÓRIO:\n'+ctx):(modo==='post')?(IA_POST+'\n\nCONTEXTO DO ESTÚDIO:\n'+ctx):(modo==='doc')?(IA_DOC+'\n\nCONTEXTO DO ESTÚDIO:\n'+ctx):(modo==='rel')?(IA_REL+'\n\nRELATÓRIO:\n'+ctx):(modo==='agente')?(IA_AGENTE+'\n\nDADOS ATUAIS DA CLÍNICA:\n'+ctx):(IA_SYS+'\n\nDADOS ATUAIS DA CLÍNICA:\n'+ctx+'\n\nIMPORTANTE: os totais, somas e contagens JÁ VÊM CALCULADOS nos DADOS acima (RESUMO DO MÊS, «pago», «FALTA pagar», contagens entre parênteses). Use SEMPRE esses números prontos — NUNCA tente somar ou recalcular listas. Se o número não estiver nos dados, diga que não está.');
        const ehGeral=!(modo==='resumo'||modo==='post'||modo==='doc'||modo==='rel'); /* agente JÁ cai no grupo geral (pensamento + canvases) */
        const sysFinal=ehGeral?(sysBase+'\n\nFORMATO OBRIGATÓRIO da resposta: escreva PRIMEIRO entre <pensamento> e </pensamento> o seu raciocínio curto (2 a 4 frases, em português, honesto — sem inventar dados) sobre como vai responder; DEPOIS escreva entre <resposta> e </resposta> a resposta final pronta pro dono. Não escreva NADA fora dessas duas partes.\n\nCRIAR ARQUIVOS (CANVAS): se o dono pedir pra você criar/escrever um documento, arquivo, PDF, contrato, roteiro, carta ou texto pronto (ou disser «cria um canvas»), DEPOIS das duas partes acrescente UM bloco no formato <canvas tipo="texto" titulo="Título curto">CONTEÚDO COMPLETO do documento, em texto simples e organizado, com quebras de linha</canvas> — use tipo="pdf" quando ele pedir PDF. O conteúdo do bloco é o arquivo inteiro, caprichado; fora do bloco, responda curto avisando que criou.'):sysBase;
        const msgs=[{role:'system',content:sysFinal}].concat(hist).concat([{role:'user',content:q}]);
        let motor='workers-ai',out=null;
        try{
          if(env.GROQ_KEY){motor='groq';out=await groqChat(env.GROQ_KEY,msgs,modo==='agente'?2000:1200);}
          if(!out||!out.resposta){motor='workers-ai';out=await aiChat(env,msgs,modo==='agente'?2000:1200);}
        }catch(e){
          try{motor='workers-ai';out=await aiChat(env,msgs,modo==='agente'?2000:1200);}catch(e2){return jerr('IA indisponível: '+String(e2&&e2.message||e2).slice(0,120),502)}
        }
        let resp=(out&&out.resposta)||'',pensa='';
        if(ehGeral){const mp=resp.match(/<pensamento>[\s\S]*?<\/pensamento>/i);
          if(mp){pensa=mp[0].replace(/<\/?pensamento>/gi,'').trim();resp=resp.replace(/<pensamento>[\s\S]*?<\/pensamento>/i,'');}
          resp=resp.replace(/<\/?resposta>/gi,'').trim();
          let canvas=null;const canvasLista=[];
          const reC=/<canvas\s+tipo="(texto|pdf)"\s+titulo="([^"]*)">([\s\S]*?)<\/canvas>/gi;let mc;
          while((mc=reC.exec(resp))){if(canvasLista.length>=5)break;const c={tipo:mc[1],titulo:mc[2].trim().slice(0,120),conteudo:mc[3].trim()};canvasLista.push(c);if(!canvas)canvas=c;}
          if(canvasLista.length)resp=resp.replace(/<canvas[\s\S]*?<\/canvas>/gi,'').trim();
          return j({resposta:resp,pensamento:pensa,canvas,canvasLista,motor});}
        return j({resposta:(out&&out.resposta)||'',motor});
      }
      if (p === '/r2-ok') return j({ ok: true, r2: !!env.R2_TOKEN });

      return jerr('Not found: ' + p, 404, 'not_found');
    } catch (e) {
      return jerr('Erro interno: ' + (e && e.message ? e.message : String(e)), 500, 'internal');
    }
  },
};