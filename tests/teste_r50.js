
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
w.eval("try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');setMode('gestao');showView('clientes')");
await new Promise(r=>setTimeout(r,350));
// ===== ABAS: popup com todas =====
T('1. barra tem + e ⊞ (todas)', !!d.getElementById('btnAbaAdd') && !!d.getElementById('btnAbasTodas'));
T('2. popup de abas existe (abasModal2 com grade, contador e salvar)', !!d.getElementById('abasModal2') && !!d.getElementById('abasGrid2') && !!d.getElementById('abasCount2') && !!d.getElementById('btnAbaSalvar2'));
d.getElementById('btnAbaSalvar2')&&w.eval("abasPintaModal()");
d.getElementById('btnAbaSalvar2').click();
d.getElementById('btnAbaSalvar2').click(); // mesma tela = dedupe
T('3. salvar pelo popup adiciona (dedupe por tela)', d.querySelectorAll('#abasGrid2 .abas-card').length===1 && d.getElementById('abasCount2').textContent==='1');
d.getElementById('btnAbasTodas').click();
T('4. ⊞ abre o popup (visível, cartão com ícone e título)', !d.getElementById('abasModal2').classList.contains('hidden') && !!d.querySelector('#abasGrid2 .abas-ico') && d.querySelector('#abasGrid2 .abas-meta b').textContent.length>0);
w.eval("setMode('studio')");
d.querySelector('#abasGrid2 .abas-card').click();
T('5. cartão abre a aba e fecha o popup', w.eval("state.mode")==='gestao' && d.getElementById('abasModal2').classList.contains('hidden'));
d.getElementById('btnAbasTodas').click();
d.querySelector('#abasGrid2 .abas-del').click();
T('6. lixeira do popup tira a aba (e some da barra)', d.querySelectorAll('#abasGrid2 .abas-card').length===0 && d.querySelectorAll('#abasChips .aba-chip').length===0 && d.getElementById('abasVazio2').textContent.includes('Nenhuma aba'));
d.getElementById('abasClose2').click();
T('7. fechar popup funciona', d.getElementById('abasModal2').classList.contains('hidden'));
// ===== CORES NOVAS =====
T('8. applyAccent aceita agua e lilas', (()=>{w.eval("applyAccent('acqua')");return w.document.documentElement.dataset.accent==='acqua';})() && (()=>{w.eval("applyAccent('lilas')");return w.document.documentElement.dataset.accent==='lilas';})());
T('9. botões das novas cores existem (e marcam current)', !!d.getElementById('accAcqua') && !!d.getElementById('accLilas') && (()=>{w.eval("applyAccent('acqua')");return d.getElementById('accAcqua').classList.contains('current')&&!d.getElementById('accLilas').classList.contains('current');})());
T('10. CSS das novas cores presente (dark+light+swatch)', html.includes('html[data-accent="acqua"]{--gold:#2ba3b0}') && html.includes('html[data-theme="light"][data-accent="lilas"] body') && html.includes('.sw-acqua') && html.includes('.sw-lilas'));
w.eval("applyAccent('gold')");
// ===== NOTIFICAÇÕES DE SISTEMA =====
let notiCriada=null;
w.Notification=function(t,o){notiCriada={t,o};this.permission='granted';};
Object.defineProperty(w.Notification,'permission',{value:'granted',configurable:true});
Object.defineProperty(w.document,'hidden',{value:true,configurable:true});
d.getElementById('notiWrap').innerHTML='';
w.eval("notiMsgs([{id:'n1',de:'Joana',para:'Fatima Dono',texto:'aviso teste',ts:Date.now()}])");
T('11. msg com app escondido dispara notificação do SISTEMA', !!notiCriada && notiCriada.t.includes('Joana') && notiCriada.o.body.includes('aviso teste'));
Object.defineProperty(w.document,'hidden',{value:false,configurable:true});
notiCriada=null;
d.getElementById('notiWrap').innerHTML='';
w.eval("notiMsgs([{id:'n2',de:'Pedro',para:'Fatima Dono',texto:'oi x2',ts:Date.now()}])");
T('12. app VISÍVEL: só popup interno (sem notificação do sistema)', d.querySelectorAll('#notiWrap .noti').length===1 && notiCriada===null);
T('13. botão 🔔 permitir + status na Aparência', !!d.getElementById('btnNotiPerm') && !!d.getElementById('notiPermHint') && d.getElementById('notiPermHint').textContent.length>2);
// ===== PERMISSÕES DO APARELHO (Sistema) =====
T('14. Dados›Sistema tem Permissões do aparelho (pedir + testar arquivo)', (()=>{w.eval("setMode('dados');showDados('sistema')");return !!d.getElementById('btnPermsAparelho') && !!d.getElementById('btnArqTeste') && !!d.getElementById('arqTesteInput');})());
w.eval("window.FenixApp={chamadas:0,pedirPerms:function(){window.FenixApp.chamadas++}}");
d.getElementById('btnPermsAparelho').click();
T('15. pedir permissões chama a ponte nativa (APK)', w.eval("window.FenixApp.chamadas")>=1 && d.getElementById('permsMsg').textContent.includes('Pedido enviado'));
// ===== VERSÃO =====
T('16. APP_VERSAO 1.6.36', w.eval("APP_VERSAO")==='1.6.36');
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (16/16)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
