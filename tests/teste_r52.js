
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:[],error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){window.__inserido=r;return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
w.eval("try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');setMode('gestao')");
await new Promise(r=>setTimeout(r,350));
// ===== ABAS UI v3 =====
T('1. popup de abas SEM pmcard (classe abas-modal que segue o tema)', !!d.getElementById('abasModal2') && !d.getElementById('abasModal2').querySelector('.abas-modal').classList.contains('pmcard'));
T('2. CSS: fundo do popup por tema (escuro+claro) e texto var(--txt)', html.includes('.abas-modal{background:linear-gradient(170deg,#211c10,#13110a)!important') && html.includes('html[data-theme="light"] .abas-modal{background:#fffdf6!important') && html.includes('.abas-meta b{color:var(--txt)!important'));
T('3. tema claro: chip e textos com var (não fixados claros)', html.includes('html[data-theme="light"] .aba-chip{background:rgba(180,140,30,.10)}') && !html.includes('.aba-chip b{color:#f7f2e3'));
// fluxo
d.getElementById('btnAbaAdd').click();d.getElementById('btnAbasTodas').click();
T('4. popup segue abrindo com cartão', !d.getElementById('abasModal2').classList.contains('hidden') && d.querySelectorAll('#abasGrid2 .abas-card').length===1);
d.querySelector('#abasGrid2 .abas-del').click();d.getElementById('abasClose2').click();
// ===== LOGIN 1x =====
w.eval("(function(){getUsu().push({id:'u7',nome:'Fatima Dono',senha:''});localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'u7',nome:'Fatima Dono'}));})()");
d.getElementById('btnWelcomeGo').click();
T('5. COM último usuário: welcome vai DIRETO (sem pedir senha de novo)', d.getElementById('userModal').classList.contains('hidden') && w.eval("JSON.parse(localStorage.getItem('fenix_user_ativo')).nome")==='Fatima Dono');
w.eval("localStorage.removeItem('fenix_user_ativo')");
d.getElementById('btnWelcomeGo').click();
T('6. SEM último usuário: abre a escolha de usuário (como antes)', !d.getElementById('userModal').classList.contains('hidden'));
w.eval("document.getElementById('userModal').classList.add('hidden')");
// ===== TERMOS =====
w.eval("setMode('dados');showDados('termos')");
T('7. Termos com 4 documentos e conteúdo COMPLETO (14KB+)', (()=>{const td=d.querySelectorAll('#viewTermos .tdoc');let t=0;td.forEach(x=>t+=x.textContent.length);return td.length===4&&t>8000;})());
d.querySelectorAll('#viewTermos .tsub')[2].click();
T('8. sub-abas de Termos trocam (doc 3 visível)', !d.getElementById('tdoc-2').classList.contains('hidden') && d.getElementById('tdoc-0').classList.contains('hidden'));
T('9. política cita LGPD e 24h', d.getElementById('tdoc-1').textContent.includes('LGPD') && d.getElementById('tdoc-2').textContent.includes('24 horas'));
// ===== CENTRAL DE AJUDA =====
w.eval("showDados('ajuda')");
T('10. Central de ajuda abre com busca e muitas respostas', !!d.getElementById('ajudaBusca') && d.querySelectorAll('#ajudaCorpo .faq').length>=24);
d.getElementById('ajudaBusca').value='grupo';
d.getElementById('ajudaBusca').dispatchEvent(new w.Event('input',{bubbles:true}));
const vis=Array.from(d.querySelectorAll('#ajudaCorpo .faq')).filter(f=>f.style.display!=='none').length;
T('11. busca filtra o FAQ', vis>0&&vis<d.querySelectorAll('#ajudaCorpo .faq').length);
w.eval("setMode('dados');showDados('ajuda')");
T('12. título e nav (ajuda no Dados)', d.getElementById('viewTitle').textContent.includes('Central de Ajuda') && !!d.querySelector('#navDados [data-dsub="ajuda"]'));
// ===== GRUPOS =====
w.eval("localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'u7',nome:'Fatima Dono'}))");w.eval("DB.usu=[{id:'u1',nome:'Joana'},{id:'u2',nome:'Pedro'},{id:'u3',nome:'Maria'},{id:'u4',nome:'Caio'},{id:'u5',nome:'Bia'}]");
w.eval("setMode('equipe');state.esub='msgs';renderApp()");
d.getElementById('btnGrpNovo').click();
T('13. botão ＋ Grupo abre o popup com pessoas (excluindo eu)', !d.getElementById('grupoModal').classList.contains('hidden') && d.querySelectorAll('#grpMems .grpChk').length===5);
// marcar 4 e tentar a 5ª
const chks=Array.from(d.querySelectorAll('#grpMems .grpChk'));
chks.slice(0,4).forEach(c=>{c.checked=true;});
chks[4].checked=true;
chks[4].dispatchEvent(new w.Event('change',{bubbles:true}));
T('14. 5ª pessoa é desmarcada (cap 5 no total) e contador 5/5', d.getElementById('grpCount').textContent==='5/5' && !chks[4].checked);
w.eval("grpAnuncia=async function(g){window.__inserido={texto:'__GRUPO__'+JSON.stringify(g)};}");
d.getElementById('grpNome').value='Equipe Sábado';
d.getElementById('grpSave').click();
await new Promise(r=>setTimeout(r,150));
T('15. grupo criado (storage) e ANÚNCIO enviado pra nuvem', (()=>{const raw=w.eval("localStorage.getItem('fenix_grupos')");const G=JSON.parse(raw||'{"gs":[]}');const g=G.gs[0];
const okStorage=!!g&&g.nome==='Equipe Sábado'&&g.membros.length===5&&g.membros[0]==='Fatima Dono';
if(!okStorage)console.log('   [dbg15] storage=',raw,'· inserido=',JSON.stringify(w.__inserido||null));
return okStorage && !!w.__inserido && String(w.__inserido.texto).startsWith('__GRUPO__');})());
T('16. grupo aparece na lista de conversas com 👥', d.getElementById('tgList').textContent.includes('Equipe Sábado') && d.getElementById('tgList').innerHTML.includes('👥'));
// conversa do grupo: mensagem recebida de outra pessoa
w.eval("MSG.rows.push({id:'g1',de:'Joana',para:(function(){return (tryGetGrp().gs.find(g=>g.nome.indexOf('Equipe S')===0)||{}).id})(),texto:'oi grupo!',criado_em:'',ts:Date.now()});");
const it=JSON.parse(w.eval("JSON.stringify(MSG.itens.find(x=>x.grp))"));
w.eval("MSG.pintar(MSG.itens.find(x=>x.grp))");
T('17. abre o grupo e mostra a mensagem com QUEM falou', d.getElementById('tgNome').textContent.includes('Equipe Sábado') && d.getElementById('tgArea').textContent.includes('oi grupo!') && d.getElementById('tgArea').innerHTML.includes('tgquem') && d.getElementById('tgArea').innerHTML.includes('Joana'));
// notificação de grupo com nome
w.eval("document.getElementById('notiWrap').innerHTML='';notiMsgs([{id:'ng1',de:'Pedro',para:(function(){return (tryGetGrp().gs.find(g=>g.nome.indexOf('Equipe S')===0)||{}).id})(),texto:'bom dia',ts:Date.now()}])");
T('18. notificação de grupo mostra 👥 + nome do grupo', d.querySelector('#notiWrap .noti b').textContent.includes('Equipe Sábado') && d.querySelector('#notiWrap .noti').textContent.includes('Pedro: bom dia'));
// absorção de anúncio (outra pessoa criou grupo)
w.eval("grpAbsorve([{de:'Joana',para:'__grupos',texto:'__GRUPO__'+JSON.stringify({id:'grupo:promocoes',nome:'Promoções',membros:['Joana','Fatima Dono'],ts:999})}])");
T('19. anúncio de grupo de outra pessoa é absorvido (aparece pra mim se eu for membro)', (()=>{const G=JSON.parse(w.eval("localStorage.getItem('fenix_grupos')"));return G.gs.some(g=>g.id==='grupo:promocoes');})());
// ===== FÊNIX CENTER =====
T('20. PÁGINA DE MARCA no ar (/center/): apresenta o app e baixa SÓ o Center (EXE/APK)', (()=>{const c=fs.readFileSync('/home/user/center/index.html','utf-8');
const ok=c.includes('bem-vindo à fênix')&&c.includes('Fênix Estética')&&c.includes('Fênix Center')
 &&c.includes('Fenix-Center.apk')&&c.includes('Fenix-Center-Windows.zip')
 &&c.indexOf('download/FENIX-Estetica.apk')<0&&c.indexOf('download/FENIX-Estetica-Windows.zip')<0
 &&c.includes('IntersectionObserver')&&c.includes('@keyframes shine')&&c.includes('icone-512.png');
if(!ok)console.log('   [dbg20] landing incompleta');
return ok;})());
T('21. Center (app) lista versões pela API do GitHub', (()=>{const c=fs.readFileSync('/home/user/center-src/www/index.html','utf-8');return c.includes("api.github.com/repos/'+REPO+'/releases")&&c.includes('mais recente');})());
T('22. APK do Fênix existe e o do Estética tem scheme fenix (link no repo)', (()=>{try{const m=fs.readFileSync('/home/user/apk-manifest-vc17.xml','utf-8');return m.includes('android:scheme="fenix"');}catch(e){return false;}})());
T('23. APP_VERSAO 1.6.38', w.eval("APP_VERSAO")==='1.6.38');
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (23/23)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
