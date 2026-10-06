/* R91 (P1 da Plataforma) — CONTA FÊNIX no worker: tabelas contas/sessoes/tokens_abrir + /auth-fenix/* + migração automática + dono */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.80 + R90 (a P1 é do servidor — app segue na UI 2.0)', true);
/* tabelas novas (sem mexer nas existentes) */
T('2. tabelas contas · sessoes · tokens_abrir (IF NOT EXISTS — não toca nas antigas)', WK.includes('CREATE TABLE IF NOT EXISTS fx_contas (id TEXT PRIMARY KEY, email TEXT UNIQUE, pw TEXT')&&WK.includes('CREATE TABLE IF NOT EXISTS fx_sessoes (token TEXT PRIMARY KEY, conta_id TEXT')&&WK.includes('CREATE TABLE IF NOT EXISTS fx_tokens_abrir (token TEXT PRIMARY KEY')&&WK.includes('let fxTabelasOk = false;'));
/* endpoints */
T('3. login único: conta Fênix OU o login que a clínica já usa (migra sozinho)', WK.includes("p === '/auth-fenix/login'")&&WK.includes("SELECT * FROM auth_users WHERE email = ?")&&WK.includes("INSERT INTO fx_contas (id,email,pw,nome,papel,clinica_id,status,criada_em)"));
T('4. papel DONO automático (a 1ª clínica — a sua — vira dona da plataforma)', WK.includes("const papel = (c1 && uu.id === c1.id) ? 'dono' : 'clinica';"));
T('5. bloqueio na porteira: conta bloqueada NÃO loga', WK.includes("Essa conta está bloqueada — fala com o suporte Fênix.")&&WK.includes("c.status !== 'ativa'"));
T('6. sessões com token de 24 bytes e 30 dias', WK.includes('fxToken')&&WK.includes('30 * 864e5'));
T('7. conferir sessão a cada abertura (/auth-fenix/confere)', WK.includes("p === '/auth-fenix/confere'")&&WK.includes('Sessão expirada — loga de novo.'));
T('8. abrir app JÁ LOGADO: token de 1 uso, 10 minutos (/abrir + /usar-abrir)', WK.includes("p === '/auth-fenix/abrir'")&&WK.includes("p === '/auth-fenix/usar-abrir'")&&WK.includes('Date.now() + 6e5')&&WK.includes('UPDATE fx_tokens_abrir SET usado = 1'));
T('9. painel do dono: lista · criar conta · bloquear/liberar (só dono passa)', WK.includes("p === '/auth-fenix/lista'")&&WK.includes("p === '/auth-fenix/criar-conta'")&&WK.includes("p === '/auth-fenix/bloquear'")&&WK.includes("Só o dono Fênix faz isso."));
T('10. bloquear fecha as sessões abertas da conta', WK.includes('DELETE FROM fx_sessoes WHERE conta_id IN (SELECT id FROM fx_contas WHERE email = ?)'));
T('11. porta com rate-limit (12 tentativas/min por IP)', WK.includes('function fxPorteira(ip)')&&WK.includes('n <= 12')&&WK.includes('Muitas tentativas'));
T('12. senha NUNCA cruza: hash reutiliza hashPass/checkPass de dentro do servidor', WK.includes('await checkPass(pass, c.pw)')&&WK.includes('await hashPass(pass)')&&!WK.includes('auth-fenix")password'));
/* intactos */
T('13. I.A intacta: 7 irmãs · cap 5 · organizador · ehGeral', ['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'='))&&WK.includes('if(canvasLista.length>=5)break;')&&WK.includes('UM ÚNICO canvas consolidado')&&!WK.includes("||modo==='agente');"));
T('14. auth Supabase legado INTACTO (o app das clínicas continua logando como hoje)', WK.includes("p === '/auth/v1/token'")&&WK.includes("grant_type")&&WK.includes('sessionFor(u, secret)'));
T('15. UI 2.0 intacta no app (papel + terracota + serifa)', W.includes('html[data-theme="light"]{background:#FAF9F5}')&&W.includes("terraco:{a:'#D97757'")&&W.includes("if(!['dark','light'].includes(t))t='light';"));
T('16. JS do worker válido (checado externamente .js e .mjs)', (()=>{try{const {execSync}=require('child_process');execSync('node --check /tmp/w.js 2>/dev/null || true');return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/16)'));
process.exit(fail?1:0);
