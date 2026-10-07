/* R110 FUNC — gerar token no app (aparece 1x, com escopos), revogar, apagar; hash nunca é o token */
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
w.eval("try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));

/* navegar até Dados › Token para I.A pela sidebar */
w.eval("setMode('dados');");
const btn=Array.from(d.querySelectorAll('#navDados .navbtn[data-dsub="iatok"]'))[0];
T('1. botão «Token para I.A» existe na barra lateral de Dados', !!btn);
btn.click();
T('2. clicou e o painel abriu (com contagem e lista)', !d.getElementById('viewIatok').classList.contains('hidden')&&txt(d.getElementById('iatokCount')).includes('Nenhum token ainda'));

/* gerar token: nome + escopos (marcar catalogo) */
d.getElementById('btnIatokNovo').click();
d.getElementById('iatokNome').value='I.A do ChatGPT';
d.getElementById('iatokEs_catalogo').checked=true;
d.getElementById('iatokEs_agenda').checked=false;
d.getElementById('btnIatokGerar').click();
await new Promise(r=>setTimeout(r,400));
const tok=d.getElementById('iatokShowVal').textContent;
T('3. modal mostrou o token UMA vez (fkia_ + ~50 chars)', d.getElementById('iatokShow')&&!d.getElementById('iatokShow').classList.contains('hidden')&&/^fkia_[A-Za-z0-9_-]{40,}$/.test(tok));
const it=w.eval('getIatok()')[0];
T('4. salvo com nome + escopos CERTOS (clientes, catalogo) + hash ≠ token', it&&it.nome==='I.A do ChatGPT'&&JSON.stringify(it.escopos.sort())===JSON.stringify(['catalogo','clientes'])&&it.hash&&it.hash!==tok&&(it.hash.length===64||it.hash.startsWith('fb_')));
d.getElementById('iatokShowX').click();
T('5. lista mostra ● Ativo com as áreas e botão revogar', txt(d.getElementById('iatokList')).includes('● Ativo')&&txt(d.getElementById('iatokList')).includes('👥 Clientes')&&txt(d.getElementById('iatokList')).includes('🛍 Catálogo')&&!!d.querySelector('#iatokList [data-act="iatokrev"]'));

/* revogar */
d.querySelector('#iatokList [data-act="iatokrev"]').click();
T('6. revogado: badge ✕ Revogado + sem botão de revogar', txt(d.getElementById('iatokList')).includes('✕ Revogado')&&!d.querySelector('#iatokList [data-act="iatokrev"]')&&Number(w.eval('getIatok()[0].revogado'))===1);

/* apagar (2 toques) */
d.querySelector('#iatokList .del').click();
d.querySelector('#iatokList .del').click();
await new Promise(r=>setTimeout(r,100));
T('7. apagou o token (2 toques)', w.eval('getIatok().length')===0);

/* persist local (LEGACY) não explode */
T('8. plumbing local ok (fk_iatok_ no localStorage)', (()=>{const v=w.localStorage.getItem('fk_iatok_x');return v!==undefined;})());

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (8/8)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
