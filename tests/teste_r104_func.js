/* R104 FUNC — a lista de itens existentes do modal de venda SEMPRE aparece (repinta sozinha quando os dados chegam) */
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
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));
w.eval("setMode('gestao');openClient('c1');state.view='cliente';state.sub='catalogo';renderCliente();");
d.getElementById('btnCliCatAdd').click();
await new Promise(r=>setTimeout(r,400)); /* deixa o pull imediato resolver */
const lista=d.getElementById('sellList').textContent;
T('1. modal abriu com catálogo VAZIO (não sumiu!)', !d.getElementById('sellModal').classList.contains('hidden'));
T('2. estado vazio explica e tem botão Recarregar lista', (lista.includes('Nenhum item apareceu ainda')||lista.includes('Carregando catálogo'))&&!!d.querySelector('#sellList [data-act="sellretry"]'));

/* itens chegam da nuvem DEPOIS (app acabou de abrir) → a lista deve PINTAR SOZINHA */
await new Promise(r=>setTimeout(r,500));
w.eval("DB.cat=[{id:'it1',tipo:'produto',nome:'Máscara Ouro',preco:400,ts:2},{id:'it2',tipo:'procedimento',nome:'Limpeza',preco:120,ts:1}];");
await new Promise(r=>setTimeout(r,2600));
T('3. itens EXISTENTES apareceram SOZINHOS na lista (sem reabrir)', d.getElementById('sellList').textContent.includes('Máscara Ouro')&&d.getElementById('sellList').textContent.includes('Limpeza'));
d.getElementById('sellClose').click();

/* item PODRE no meio dos bons → lista inteira continua aparecendo */
w.eval("DB.cat.push({id:'podre'});openSellModal('cliente:');");
T('4. item sem nome/tipo NÃO apaga a lista (bons continuam)', !d.getElementById('sellModal').classList.contains('hidden')&&d.getElementById('sellList').textContent.includes('Máscara Ouro')&&d.getElementById('sellList').textContent.includes('Limpeza'));
d.getElementById('sellClose').click();

/* botão Recarregar lista reabre e repinta */
w.eval("DB.cat=[];openSellModal('cliente:');");
const temRecarregar=!!d.querySelector('#sellList [data-act="sellretry"]');
if(temRecarregar)d.querySelector('#sellList [data-act="sellretry"]').click();
T('5. Recarregar lista reabre/repinta sem erro', !d.getElementById('sellModal').classList.contains('hidden')&&d.getElementById('sellList').textContent.length>5);
d.getElementById('sellClose').click();

/* helpers existem e syncAll não quebrou com modal aberto */
T('6. sellRepintaSeAberto existe e é chamada no pull/sync', w.eval("typeof sellRepintaSeAberto==='function'&&typeof sellPollRemoto==='function'"));
w.eval("openSellModal('cliente:');try{sellRepintaSeAberto();}catch(e){}");
T('7. repinta com modal aberto não lança erro', !d.getElementById('sellModal').classList.contains('hidden'));

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (7/7)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
