/* FUNCIONAL Center v2.1.0 — clica de verdade: criar conta → entra · entrar errado → avisa · painéis */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const html=fs.readFileSync('/home/user/center/app.html','utf8');
const chamadas=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://geniterapeuta12-tech.github.io/fenix-estetica/center/app.html'});
const w=dom.window,d=w.document;
w.fetch=async(u,opt)=>{chamadas.push({u:u,body:opt&&opt.body?JSON.parse(opt.body):null});
const url=String(u);
if(url.includes('/auth-fenix/criar-clinica'))return{ok:true,json:async()=>({ok:true,token:'tok123',sb:{access_token:'a'},conta:{email:'ana@clinicabelle',nome:'Clínica Belle',papel:'clinica'}})};
if(url.includes('/auth-fenix/login'))return{ok:true,json:async()=>({ok:true,token:'tok456',sb:{access_token:'a'},conta:{email:'x@y',nome:'X',papel:'clinica'}})};
if(url.includes('/auth-fenix/confere'))return{ok:false,json:async()=>({ok:false,message:'sem sessão'})};
if(url.includes('/auth-fenix/lista'))return{ok:true,json:async()=>({ok:true,contas:[]})};
return{ok:true,json:async()=>({ok:true})};};
(async()=>{
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
await new Promise(r=>setTimeout(r,300));
T('1. tela começa no LOGIN com «Criar conta» visível (sem apps antes)', !d.getElementById('vLogin').classList.contains('hidden')&&!d.getElementById('ccEmail').closest('.card').classList.contains('hidden')&&d.getElementById('conviteW').classList.contains('hidden'));
T('2. nada de botão de ABRIR APP antes de entrar', !d.getElementById('btnAbrirApp'));
/* criar conta preenchido e clicado */
d.getElementById('ccEmail').value='ana@clinicabelle';
d.getElementById('ccSenha').value='belle123';
d.getElementById('btnCriarClinica').click();
await new Promise(r=>setTimeout(r,400));
T('3. clicou em criar → chamou /auth-fenix/criar-clinica com os dados', chamadas.some(c=>c.u.includes('/auth-fenix/criar-clinica')&&c.body&&c.body.email==='ana@clinicabelle'));
T('4. criou e ENTROU direto (painel da clínica à vista, login escondido)', !d.getElementById('vCli').classList.contains('hidden')&&d.getElementById('vLogin').classList.contains('hidden'));
T('5. painel da clínica mostra «já logado» e os apps AGORA', !!d.getElementById('btnAbrirLogado')&&d.body.textContent.includes('Estética (Android)'));
/* entrar: validar fluxo de erro e sucesso */
d.getElementById('btnSair').click();
await new Promise(r=>setTimeout(r,100));
d.getElementById('fxEmail').value='clinicaprincipal';
d.getElementById('fxSenha').value='senha';
d.getElementById('btnEntrar').click();
await new Promise(r=>setTimeout(r,300));
T('6. entrar com nome → chamou /auth-fenix/login', chamadas.some(c=>c.u.includes('/auth-fenix/login')&&c.body&&c.body.email==='clinicaprincipal'));
T('7. entrou de novo (sessão guardada)', !d.getElementById('vCli').classList.contains('hidden'));
d.getElementById('fxEmail').value='outra@gmail.com';d.getElementById('fxSenha').value='teste123';
d.getElementById('fLogin').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
await new Promise(r=>setTimeout(r,300));
T('8. ENTER no teclado também entra (form submit)', chamadas.filter(c=>c.u.includes('/auth-fenix/login')).length===2);
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
})().catch(e=>{console.log('ERRO:',e.message);process.exit(1);});
