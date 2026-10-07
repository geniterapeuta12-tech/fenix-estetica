/* R107 FUNC — a venda ANTIGA (sem origem) agora: aparece, abre valor pago, fica Em aberto, recebe, e APAGA dentro e fora da cliente + Vendas na barra lateral */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1"}},error:null}),signOut:async()=>{}},from:function(){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:[],error:null});},delete(){return {lt:async()=>({error:null}),in:async()=>({error:null})};},insert(){return {error:null};},update(){return {eq:async()=>({error:null})};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
const txt=el=>el.textContent.replace(/\u00A0/g,' ');
w.eval("DB.cli=[{id:'c1',nome:'Fatima Souza',acesso:true}];DB.cat=[{id:'it1',tipo:'produto',nome:'Acelerador',preco:300,ts:1}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));
/* a venda ANTIGA da Fatima: SEM origem, SEM pago — como eram as de antes das correções */
w.eval("DB.fin=[{id:'antiga1',tipo:'in',desc:'Acelerador (antiga)',valor:300,data:'20/08/2026',pago:null,link:{tipo:'cliente',id:'c1',clientId:'c1'},obs:'Catálogo: Acelerador'}];");

/* ===== 1) VENDAS na barra lateral do Catálogo ===== */
w.eval("setMode('catalogo');state.cview='loja';renderApp();");
const navB=Array.from(d.querySelectorAll('#navCatalogo .navbtn[data-cview]'));
T('1. barra lateral tem LOJA e VENDAS', navB.length===2&&navB[1].textContent.includes('Vendas'));
navB[1].click();
T('2. clicou Vendas: loja some e o card fica em foco (título «Vendas do catálogo»)', d.getElementById('catLojaPanel').classList.contains('hidden')&&d.getElementById('catTitle').textContent==='Vendas do catálogo'&&!d.getElementById('quemCard').classList.contains('hidden'));
T('3. a venda ANTIGA aparece nas Vendas do catálogo (antes nem aparecia!)', txt(d.getElementById('quemList')).includes('Acelerador (antiga)')&&txt(d.getElementById('quemList')).includes('Fatima Souza'));
T('4. tem Editar + Remover + status nela (antiga incluída)', !!d.querySelector('#quemList [data-act="finedit"]')&&!!d.querySelector('#quemList .del'));
navB[0].click();
T('5. clicou Loja: loja volta', !d.getElementById('catLojaPanel').classList.contains('hidden')&&d.getElementById('catTitle').textContent==='Catálogo');

/* ===== 2) finança da cliente: antiga aparece com valor, edita com campo do pago ===== */
w.eval("openClient('c1');state.view='cliente';state.sub='financeiro';renderCliente();");
T('6. financeiro da cliente: venda ANTIGA aparece (⚠ Conferir · R$ 109: NUNCA Quitado sozinha)', txt(d.getElementById('finCliCat')).includes('Acelerador (antiga)')&&txt(d.getElementById('finCliCat')).includes('⚠ Conferir se pagou · R$ 300,00'));
d.querySelector('#finCliCat [data-act="finedit"]').click();
T('7. edição da ANTIGA abre COM o campo do valor pago (o bug de sempre!)', !d.getElementById('editFinModal').classList.contains('hidden')&&!d.getElementById('efPagoRow').classList.contains('hidden'));
d.getElementById('efPago').value='';
d.getElementById('btnEfOk').click();
T('8. esvaziou o pago → EM ABERTO · falta R$ 300,00', txt(d.getElementById('finCliCat')).includes('⏳ Em aberto · falta R$ 300,00'));

/* ===== 3) apagar dentro da cliente ===== */
d.querySelector('#finCliCat .del').click();
d.querySelector('#finCliCat .del').click();
await new Promise(r=>setTimeout(r,100));
T('9. APAGOU dentro da cliente (2 toques)', w.eval('getFin().length')===0&&txt(d.getElementById('finCliCat')).includes('Nenhuma venda do catálogo ainda'));

/* ===== 4) apagar no financeiro GERAL (fora da cliente) ===== */
w.eval("DB.fin=[{id:'antiga2',tipo:'in',desc:'Acelerador (antiga 2)',valor:150,data:'21/08/2026',pago:null,link:{tipo:'cliente',id:'c1',clientId:'c1'},obs:'Catálogo: Acelerador'}];setMode('gestao');state.view='financeiro';renderApp();");
T('10. financeiro geral: venda antiga como «Venda do catálogo» com ⚠ Conferir se pagou (R109)', txt(d.getElementById('finList')).includes('Venda do catálogo')&&txt(d.getElementById('finList')).includes('⚠ Conferir se pagou'));
d.querySelector('#finList .del').click();
d.querySelector('#finList .del').click();
await new Promise(r=>setTimeout(r,100));
T('11. APAGOU no financeiro geral (2 toques)', w.eval('getFin().length')===0&&txt(d.getElementById('finList')).includes('Nenhuma movimentação ainda'));

/* ===== 5) pacote: antiga vinculada ao pacote também conta/aparece ===== */
w.eval("DB.fin=[{id:'antiga3',tipo:'in',desc:'Acelerador (pacote antigo)',valor:120,data:'22/08/2026',pago:null,link:{tipo:'pacote',id:'p1',clientId:'c1'},obs:'Catálogo: Acelerador'}];DB.pkg=[{id:'p1',clientId:'c1',nome:'Detox',valor:600,sessoes:4,criadoEm:'01/08/2026',itens:[]}];");
w.eval("state.view='cliente';state.sub='pacote';state.pacoteId='p1';state.psub='catalogo';renderCliente();");
T('12. pacote: venda antiga aparece na lista do pacote', txt(d.getElementById('pkgCatList')).includes('Acelerador (pacote antigo)'));
d.querySelector('#pkgCatList .del').click();
d.querySelector('#pkgCatList .del').click();
await new Promise(r=>setTimeout(r,100));
T('13. APAGOU na lista do pacote', w.eval('getFin().length')===0);

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (13/13)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
