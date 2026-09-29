
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:[],error:null});},delete(){return {lt:async()=>({error:null})};},insert(){return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
w.eval("try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');setMode('gestao')");
await new Promise(r=>setTimeout(r,350));
// ===== CONTRASTE DAS ABAS (cores fixas por tema) =====
T('1. chips da barra: texto claro fixo no escuro', html.includes('.aba-chip b{color:#f7f2e3!important;font-weight:700'));
T('2. chips da barra: texto escuro fixo no claro', html.includes('html[data-theme="light"] .aba-chip b{color:#241f13!important}'));
T('3. popup: cartões com texto claro fixo (pmcard é sempre escuro)', html.includes('.abas-meta b{color:#f7f2e3!important') && html.includes('.abas-meta small{color:#b9b09a!important') && html.includes('.abas-del{border:0;background:transparent;color:#b9b09a!important'));
T('4. vazio do popup com cor garantida', html.includes('#abasVazio2.fempty{color:#b9b09a!important}'));
// ===== SALVAR ABA + ABRIR POPUP (fluxo continua funcionando) =====
w.eval("showView('clientes')");
d.getElementById('btnAbaAdd').click();
d.getElementById('btnAbasTodas').click();
T('5. popup abre com o cartão salvo', !d.getElementById('abasModal2').classList.contains('hidden') && d.querySelectorAll('#abasGrid2 .abas-card').length===1);
d.querySelector('#abasGrid2 .abas-del').click();
T('6. lixeira funciona', d.querySelectorAll('#abasGrid2 .abas-card').length===0);
d.getElementById('abasClose2').click();
// ===== PERMISSÕES com STATUS REAL (ponte) + CONFIGURAÇÃO =====
let abriuConfig=0;
w.eval("window.FenixApp={statusPerms:function(){return JSON.stringify({noti:true,arq:false})},abrirConfig:function(){window.__cfg=1},pedirPerms:function(){}}");
w.eval("setMode('dados');showDados('sistema')");
T('7. painel mostra STATUS REAL da ponte (noti ✓, arq ⚠)', (()=>{const s=d.getElementById('permsStatus').textContent;return s.includes('Notificações')&&s.includes('permitidas ✓')&&s.includes('bloqueados ⚠');})());
d.getElementById('btnPermsConfig').click();
T('8. ⚙️ chama abrirConfig da ponte', w.eval("window.__cfg")===1 && d.getElementById('permsMsg').textContent.includes('configuração do aparelho'));
T('9. sem ponte (PC): status orientando o teste', (()=>{w.eval("delete window.FenixApp");w.eval("permsPintaStatus()");const s=d.getElementById('permsStatus').textContent;return s.includes('Notificações do sistema')||s.includes('arquivos');})());
// ===== VERSÃO =====
T('10. APP_VERSAO 1.6.36', w.eval("APP_VERSAO")==='1.6.36');
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (10/10)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
