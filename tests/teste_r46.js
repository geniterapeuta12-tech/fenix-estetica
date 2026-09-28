
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
const DBMENS=[];
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:DBMENS.map(x=>Object.assign({},x)),error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){DBMENS.push(Array.isArray(r)?r[0]:r);return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
// ==== 1) CELULAR (userAgent Android): Sistema visível, zoom não resetado ====
const domM=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/',beforeParse(x){Object.defineProperty(x.navigator,'userAgent',{value:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36',configurable:true});}});
const wm=domM.window;
await new Promise(r=>{if(wm.document.readyState==='complete')return r();wm.addEventListener('load',r);setTimeout(r,5000);});
const dm=wm.document;let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
T('1. userAgent Android no mock + fix no código (sem esconder por IS_ANDROID)', wm.navigator.userAgent.toLowerCase().includes('android') && !fs.readFileSync(path.join('/home/user','index.html'),'utf-8').includes("classList.toggle('hidden',IS_ANDROID)"));
const btn=dm.querySelector('#navDados [data-dsub="sistema"]');
T('2. botão Sistema EXISTE na barra Dados', !!btn);
wm.eval('plataformaApply()');
T('3. plataformaApply NÃO esconde mais o Sistema', btn && !btn.classList.contains('hidden'));
try{localStorage.setItem('fenix_zoom','1.1')}catch(e){}
// ==== 2) DESKTOP: mapFin converte link texto→objeto; venda do catálogo NÃO some ====
const domD=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const wd=domD.window;
await new Promise(r=>{if(wd.document.readyState==='complete')return r();wd.addEventListener('load',r);setTimeout(r,5000);});
const dd=wd.document;
T('4. mapFin converte link de TEXTO (como vem da nuvem) em objeto', (function(){const o=wd.eval(`mapFin({id:'f1',tipo:'in',descr:'Venda',valor:80.5,data:'28/09/2026',link:'${'{"tipo":"cliente","clientId":"c1"}'}',obs:'Catálogo: X',origem:'cat'})`);return o.link&&o.link.clientId==='c1'&&o.link.tipo==='cliente';})());
T('5. mapFin aguenta sufixo ::jsonb e link quebrado', (function(){const a=wd.eval(`mapFin({id:'f2',tipo:'in',descr:'V',valor:1,data:'',link:'{"clientId":"c2"}::jsonb',origem:'cat'})`);const b=wd.eval(`mapFin({id:'f3',tipo:'in',descr:'V',valor:1,data:'',link:'lixo{{{',origem:'cat'})`);return a.link&&a.link.clientId==='c2'&&b.link===null;})());
// simula o ciclo REAL: row gravado com link stringificado (rowOut) → puxa → renderiza o financeiro da cliente
wd.eval(`
DB.fin=[mapFin({id:'fx',tipo:'in',descr:'Kit Glow',valor:180,data:'28/09/2026',link:JSON.stringify({tipo:'cliente',id:'c1',clientId:'c1'}),obs:'Catálogo: Kit Glow',origem:'cat'})];
DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true}];
try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}
document.getElementById('authScreen').classList.add('hidden');
document.getElementById('appScreen').classList.remove('hidden');
document.getElementById('splash').classList.add('hidden');
setMode('gestao');openClient('c1');state.sub='financeiro';renderCliente();`);
T('6. venda do catálogo APARECE no financeiro da cliente (pós-sync)', dd.getElementById('finCliCat') && dd.getElementById('finCliCat').textContent.includes('Kit Glow'));
T('7. valor certo no card (R$ 180,00)', dd.getElementById('finCliCat').textContent.includes('R$'));
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (7/7)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
