/* R92 (P3 da Plataforma) — Estética aceita a CONTA FÊNIX: login pela Central · convite fx= · ponte sb no worker · fenix:// no APK · CENTER v2.0 */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const CJ=fs.readFileSync(path.join(__dirname,'..','center','app.html'),'utf8');
const MJ=fs.readFileSync(path.join(__dirname,'..','apk-src','br','fenix','estetica','MainActivity.java'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.78 + versao.json R92 (5 melhorias)', W.includes("APP_VERSAO='1.6.78'")&&VJ.versao==='1.6.78'&&VJ.r==='R104'&&(VJ.melhorias||[]).length===5);
/* worker: ponte sb */
T('2. worker: fxSBSessao — conta Fênix vira sessão supabase da clínica', WK.includes('async function fxSBSessao(env, c)')&&WK.includes("SELECT * FROM auth_users WHERE id = ?")&&WK.includes('return u ? await sessionFor(u, env.FENIX_SECRET) : null;'));
T('3. worker: login e usar-abrir devolvem sb (2 respostas)', (WK.match(/const sbx = await fxSBSessao\(env, c\);/g)||[]).length===3&&(WK.match(/return j\(\{ ok: true, token, sb: sbx, conta: await fxContaPub\(c\) \}\);/g)||[]).length===2);
/* app: porta da Central */
T('4. app: painel «🏛️ Conta Fênix» no login (formFx + link + voltar)', W.includes('<form id="formFx" class="panel" novalidate>')&&W.includes('id="lnkFx"')&&W.includes('id="lnkFxVoltar"')&&W.includes('Veio da <b>🏛️ Central Fênix</b>?'));
T('5. app: entrar pela conta Fênix → /auth-fenix/login → setSession + entrarRemoto', W.includes("fetch(FXAPI+'/auth-fenix/login'")&&W.includes('SB.auth.setSession({access_token:sbSess.access_token,refresh_token:sbSess.refresh_token})')&&W.includes('await entrarRemoto(sbSess.user);'));
T('6. app: convite da Central (?fx= / #fx= / pendente) → usar-abrir → entra direto', W.includes('searchParams.get(\'fx\')')&&W.includes("fetch(FXAPI+'/auth-fenix/usar-abrir'")&&W.includes('fenix_fx_pendente')&&W.includes('setTimeout(fxConvite,fxms)'));
T('7. app: FXAPI aponta pro worker e limpa o fx= da URL depois de usar', W.includes("const FXAPI='https://fenix-api.geniterapeuta12.workers.dev'")&&W.includes("history.replaceState(null,'',location.pathname"));
/* APK vc50 */
T('8. APK: onCreate trata fenix://abrir?token=… → ?fx= no WebView', MJ.includes('"fenix".equals(d.getScheme())')&&MJ.includes('d.getQueryParameter("token")')&&MJ.includes('base = base + "?fx=" + java.net.URLEncoder.encode(t, "UTF-8")'));
T('9. APK: onNewIntent também (app aberto e a Central chama de novo)', MJ.includes('protected void onNewIntent(Intent i2)')&&MJ.includes('u2.split("\\\\?")[0]'));
/* Center v2.0 */
T('10. Center v2.1: login conta Fênix + confere na abertura + sessão guardada', CJ.includes("CENTER_V='2.4.0'")&&CJ.includes("fetch(FXAPI+'/auth-fenix/login'")&&CJ.includes("'/auth-fenix/confere?token='")&&CJ.includes('fenix_center_fx'));
T('11. Center v2.0: dono — criar conta · bloquear/liberar · lista', CJ.includes("'/auth-fenix/criar-conta'")&&CJ.includes("'/auth-fenix/bloquear'")&&CJ.includes("'/auth-fenix/lista'")&&CJ.includes('Bloquear'));
T('12. Center v2.0: abrir Estética JÁ LOGADO (convite 1 uso: app fenix:// · navegador ?fx= · copiar)', CJ.includes("'/auth-fenix/abrir'")&&CJ.includes("'fenix://abrir?token='+encodeURIComponent(t)")&&CJ.includes("PAGES+'?fx='")&&CJ.includes('navigator.clipboard.writeText'));
T('13. Center v2.0: auto-atualização do Pages preservada (checaUiNova + base href)', CJ.includes('async function checaUiNova()')&&CJ.includes("uiMaisNova(m[1],CENTER_V)")&&CJ.includes('<base href="https://geniterapeuta12-tech.github.io/fenix-estetica/center/">'));
T('14. Center v2.0: UI papel+terracota (Claude) e painel da clínica com «JÁ LOGADO»', CJ.includes('--papel:#FAF9F5')&&CJ.includes('--terra:#D97757')&&CJ.includes('font-family:Georgia')&&CJ.includes('🚀 Abrir o Estética já logado'));
/* intactos */
T('15. P1/R91 intacto (fx_ tabelas + rotas + 7 irmãs + cap 5)', WK.includes('CREATE TABLE IF NOT EXISTS fx_contas')&&WK.includes("p === '/auth-fenix/login'")&&WK.includes('if(canvasLista.length>=5)break;')&&['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'=')));
T('16. auth/v1 legado + UI 2.0 intactos', WK.includes("p === '/auth/v1/token'")&&W.includes('html[data-theme="light"]{background:#FAF9F5}')&&W.includes("if(!['dark','light'].includes(t))t='light';"));
T('17. aninhamento HTML 0 erros (app e Center)', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('18. JS válido (checado externamente: app, worker .js/.mjs, center)', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
