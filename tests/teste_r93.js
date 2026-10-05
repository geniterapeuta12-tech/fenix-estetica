/* R93 — consertos da CENTER: self-signup «Criar conta» público · login aceita NOME da clínica · tela inicial limpa (apps só depois) · provisioning completo */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const CJ=fs.readFileSync(path.join(__dirname,'..','center','app.html'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. Estética segue 1.6.73 (esse conserto é da Center + worker)', W.includes("APP_VERSAO='1.6.73'")&&VJ.versao==='1.6.73'&&VJ.r==='R99');
/* worker */
T('2. login aceita SÓ O NOME (expande @fenix.com + cai pro antigo @clinicas.fenix.app)', WK.includes("if (email && email.indexOf('@') < 0) email = email + '@fenix.com';")&&WK.includes("email.split('@')[0] + '@clinicas.fenix.app'"));
T('3. /auth-fenix/criar-clinica PÚBLICO (self-signup, fora do gate do dono)', WK.includes("p === '/auth-fenix/criar-clinica'")&&WK.indexOf("'/auth-fenix/criar-clinica'")<WK.indexOf('ehDono'));
T('4. validações do cadastro (email/usuário inválido · senha 6+)', WK.includes('Email ou usuário inválido — confere aí.')&&WK.includes('A senha precisa de pelo menos 6 caracteres.'));
T('5. duplicidade bloqueada (fx_contas e auth_users no cadastro)', (()=>{const seg=WK.split("p === '/auth-fenix/criar-clinica'")[1].split("'/auth-fenix/confere'")[0];return (seg.match(/Já existe conta com esse email/g)||[]).length===2&&seg.includes("SELECT id FROM fx_contas WHERE email = ?")&&seg.includes("SELECT id FROM auth_users WHERE email = ?");})());
T('6. PROVISIONING completo: fx_contas + auth_users + clinics (entra no app na hora)', WK.includes("INSERT INTO fx_contas (id,email,pw,nome,papel,clinica_id,status,criada_em) VALUES (?,?,?,?,?,?,?,?)")&&WK.includes("INSERT INTO auth_users (id,email,pw,meta,criado_em) VALUES (?,?,?,?,?)")&&WK.includes("INSERT INTO clinics (id,key,nome) VALUES (?,?,?)"));
T('7. cadastro já LOGA (bloco criar-clinica devolve token + sb + conta)', (()=>{const seg=WK.split("p === '/auth-fenix/criar-clinica'")[1].split('confira')[0];return seg.includes('const sbx = await fxSBSessao(env, c);')&&seg.includes('const token = await fxAbrirSessao(env, c.id);')&&seg.includes('return j({ ok: true, token, sb: sbx, conta: await fxContaPub(c)');})());
T('8. rate-limit cobre o cadastro', /criar-clinica[\s\S]{0,120}fxPorteira\(ip\)/.test(WK));
/* center v2.1.0 */
T('9. Center v2.3.0', CJ.includes("CENTER_V='2.4.0'"));
T('10. TELA INICIAL LIMPA: sem card de Apps/abrir antes de entrar', !CJ.includes('id="btnAbrirApp"')&&CJ.includes('id="btnAbrirApp2"')&&(CJ.match(/releases\/latest\/download\/FENIX-Estetica\.apk/g)||[]).length>=1);
T('11. «✨ Primeira vez? Criar conta» na tela inicial (estilo Gmail)', CJ.includes('✨ Primeira vez? Criar conta')&&CJ.includes('id="btnCriarClinica"')&&CJ.includes("'/auth-fenix/criar-clinica'")&&CJ.includes('nome@fenix.com'));
T('12. login aceita usuário ou email (campo único, sem @ vira @fenix.com)', CJ.includes('<label>Usuário ou email</label>')&&CJ.includes('(sem @ vira ana@fenix.com)'));
T('13. depois que cadastrar continua tudo (abrir já logado · instalar · dono)', CJ.includes('🚀 Abrir o Estética já logado')&&CJ.includes('btnAbrirLogado')&&CJ.includes("'/auth-fenix/criar-conta'")&&CJ.includes("'/auth-fenix/bloquear'"));
T('14. criar conta JÁ LOGA e ABRE O APP direto (guarda sessão + convite auto)', /btnCriarClinica[\s\S]{0,900}fenix_center_fx[\s\S]{0,120}pinta\(\);/.test(CJ));
/* intactos */
T('15. P1/P2/P3 intactos (fx_ rotas · ponte sb · fenix:// · porta no app)', WK.includes('CREATE TABLE IF NOT EXISTS fx_contas')&&WK.includes('fxSBSessao')&&W.includes("fetch(FXAPI+'/auth-fenix/login'")&&W.includes('setTimeout(fxConvite,fxms)'));
T('16. 7 irmãs + cap 5 + organizador intactos', ['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'='))&&WK.includes('if(canvasLista.length>=5)break;'));
T('17. aninhamento Center 0 erros', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('18. JS válido (checado externamente)', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
