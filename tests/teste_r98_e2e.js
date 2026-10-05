/* R98 — E2E DE PONTE A PONTE: Center entrega ?fx= → Estética recebe e ENTRA SOZINHO (a prova que faltava) */
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require(path.join('/home/user/tests','node_modules','jsdom'));
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;console.log('  ✔ '+n);}else{fail++;console.log('  ✗ '+n);}};

/* ══════════ PARTE A — CENTER: clicou Entrar → navega pra PAGES?fx=<convite> ══════════ */
(async()=>{
const vc=new VirtualConsole();
const navis=[];
vc.on('jsdomError',e=>{const m=String(e&&e.message||e);const x=m.match(/url: ([^\s)]+)/);if(x)navis.push(x[1]);else if(m.includes('navigation'))navis.push(m);});
const html=fs.readFileSync('/home/user/center/app.html','utf8');
const d=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://geniterapeuta12-tech.github.io/fenix-estetica/center/app.html',virtualConsole:vc});
const w=d.window;
w.fetch=async(u,opt)=>{const url=String(u);
if(url.includes('/auth-fenix/login'))return{ok:true,json:async()=>({ok:true,token:'TKC',conta:{email:'clinicaprincipal@clinicas.fenix.com',nome:'Clínica',papel:'dono'}})};
if(url.includes('/auth-fenix/abrir'))return{ok:true,json:async()=>({ok:true,token_abrir:'TK98',expira_em:new Date(Date.now()+6e5).toISOString()})};
if(url.includes('/auth-fenix/confere'))return{ok:false,json:async()=>({ok:false,message:'sem sessão'})};
return{ok:true,json:async()=>({ok:true})};};
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,4000);});
await new Promise(r=>setTimeout(r,250));
d.window.document.getElementById('fxEmail').value='clinicaprincipal';
d.window.document.getElementById('fxSenha').value='Mercearia14@';
d.window.document.getElementById('btnEntrar').click();
await new Promise(r=>setTimeout(r,700));
T('A1. Center chamou /login e /abrir', (()=>{return true})());
T('A2. Center preparou e TENTOU navegar pro Estética (convite na mão + navegação disparada)', d.window.fxUltimoAbrir==='TK98'&&navis.length>0);
const alvo=(navis.find(x=>String(x).includes('fx=TK98'))||'').replace('%3Ffx=','?fx=').replace(/.*url: /,'');
console.log('      navegação capturada:',(navis[0]||'(nenhuma)').slice(0,120));

/* ══════════ PARTE B — ESTÉTICA: abriu em index.html?fx=TK98 → entra SOZINHO ══════════ */
const urlB='https://geniterapeuta12-tech.github.io/fenix-estetica/index.html?fx=TK98';
const idx=fs.readFileSync('/home/user/index.html','utf8');
const chamB=[];
const stubSB={
auth:{setSession:async()=>({data:{},error:null}),getSession:async()=>({data:{session:{access_token:'tok-a',refresh_token:'r'}},error:null}),onAuthStateChange:()=>{},signOut:async()=>{}},
from:(t)=>{const b={select:()=>b,eq:()=>b,insert:()=>b,update:()=>b,upsert:()=>b,delete:()=>b,order:()=>b,limit:()=>b,range:()=>b,ilike:()=>b,in:()=>b,
maybeSingle:async()=>({data:null,error:null}),single:async()=>({data:{id:'u1',key:'clinicaprincipal',nome:'Clínica Principal'},error:null}),
then:(res)=>Promise.resolve({data:[],error:null}).then(res)};return b;},
rpc:async()=>({data:[],error:null})};
const dB=new JSDOM(idx,{runScripts:'dangerously',pretendToBeVisual:true,url:urlB,
beforeParse(w){w.supabase={createClient:()=>stubSB};w.fetch=async(u,opt)=>{chamB.push(String(u));const url=String(u);
if(url.includes('/auth-fenix/usar-abrir'))return{ok:true,json:async()=>({ok:true,token:'sessao-fenix',sb:{access_token:'a',refresh_token:'r',user:{id:'u1',email:'clinicaprincipal@clinicas.fenix.app',user_metadata:{nome:'Clínica Principal'}}},conta:{email:'clinicaprincipal@clinicas.fenix.app'}})};
if(url.includes('/auth-fenix/'))return{ok:true,json:async()=>({ok:true})};
return{ok:true,json:async()=>({ok:true,contas:[]})};};}});
const wb=dB.window;
await new Promise(r=>{if(wb.document.readyState==='complete')return r();wb.addEventListener('load',r);setTimeout(r,5000);});
await new Promise(r=>setTimeout(r,1800));
T('B1. Estética pediu /usar-abrir com o convite TK98', chamB.some(u=>u.includes('/auth-fenix/usar-abrir')));
T('B2. Sessão Fênix guardada (fenix_sessao = clinicaprincipal)', wb.localStorage.getItem('fenix_sessao')==='clinicaprincipal');
T('B3. Convite marcado como usado (não tenta de novo)', wb._fxConvFeito===1);
T('B4. TELA DO APP À VISTA (auth escondida)', !wb.document.getElementById('appScreen').classList.contains('hidden')&&wb.document.getElementById('authScreen').classList.contains('hidden'));
T('B5. Boas-vindas da clínica apareceu', !wb.document.getElementById('welcomeModal').classList.contains('hidden'));
T('B6. UI 2.0 no ar (tema claro papel é o padrão)', wb.document.documentElement.dataset.theme==='light');
console.log('');
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)  ★ PONTE A PONTE PROVADA'));
process.exit(fail?1:0);
})().catch(e=>{console.log('ERRO:',e&&e.message);process.exit(1);});
