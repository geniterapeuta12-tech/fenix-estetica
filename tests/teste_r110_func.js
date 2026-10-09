/* R110 FUNC — MODO LOCAL (SB=null, como no FENIX-TESTE-LOCAL): 1º login cria acesso · senha errada recusa · cadastro offline · sync honesto · login na hora · R112 funciona local */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
const aSB="const SB=(window.supabase&&NUVEM_URL&&NUVEM_KEY)?window.supabase.createClient(NUVEM_URL,NUVEM_KEY):null;";
if(html.includes(aSB))html=html.replace(aSB,"const SB=null; /* LOCAL */");
html=html.replace("function checarAtualizacao(tentar){\ntry{","function checarAtualizacao(tentar){\nreturn; try{");
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✗ ')+n);if(!c)falhas++;};
const erros=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/',
  beforeParse(w){w.addEventListener('error',e=>erros.push(e.message));}});
const w=dom.window;
w.console.error=(...a)=>{erros.push(a.map(String).join(' ').slice(0,120))};
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,6000);});
const d=w.document;
await new Promise(r=>setTimeout(r,1000));
const subForm=(f)=>d.getElementById(f).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const entrar=(nome,senha)=>{d.getElementById('loginNome').value=nome;d.getElementById('loginSenha').value=senha;subForm('formLogin');};
T('1. boot SEM erros (SB=null bem declarado)',erros.length===0);
/* splash → COMEÇAR → login rápido */
d.getElementById('btnSplashGo').click();
await new Promise(r=>setTimeout(r,900));
T('2. login abriu rápido (sem acesso lembrado)',!d.getElementById('authScreen').classList.contains('hidden'));
/* 1º login CRIA acesso local e entra */
entrar('clinicaprincipal','Mercearia14@');
await new Promise(r=>setTimeout(r,700));
T('3. 1º login criou acesso local e ENTROU no app',!d.getElementById('appScreen').classList.contains('hidden'));
T('4. badge 💾 Modo local',(d.getElementById('cloudBadge')||{}).textContent==='💾 Modo local');
T('5. acesso salvo no aparelho (localStorage)',JSON.stringify(w.localStorage).includes('clinicaprincipal'));
/* dados + R112 no local */
w.eval("setCli([{id:'c1',nome:'Ana Local'}]);setCat([{id:'i1',tipo:'item',nome:'Limpeza',preco:120}]);setMode('gestao');state.view='financeiro';renderApp();");
await new Promise(r=>setTimeout(r,300));
d.getElementById('btnAnalise').click();
await new Promise(r=>setTimeout(r,120));
T('6. Análise (R112) abre no modo local',!d.getElementById('analiseModal').classList.contains('hidden'));
d.getElementById('anClose').click();
w.eval("openSellModalCat()");
await new Promise(r=>setTimeout(r,300));
const li=d.querySelector('#sellList [data-ref="i:i1"]');
if(li)li.click();
await new Promise(r=>setTimeout(r,100));
T('7. venda com soma automática (R112) no local',!!li&&d.getElementById('sellValor').value==='120,00');
w.eval("$('sellModal').classList.add('hidden');");
/* sync agora em local: mensagem honesta */
w.eval("setMode('dados');state.dsub='sync';renderApp();");
await new Promise(r=>setTimeout(r,250));
d.getElementById('btnSyncNow').click();
await new Promise(r=>setTimeout(r,120));
T('8. «Sincronizar agora» explica o modo local (sem falso ☁)',((d.getElementById('syncMsg')||{}).textContent||'').includes('modo local'));
T('9. syncAll() direto em local não faz nada nem quebra',w.eval("typeof syncAll()==='undefined'?'void-ok':'ok'")==='ok');
/* sair → senha errada recusa → certa entra */
w.eval("$('btnSair').click();");
await new Promise(r=>setTimeout(r,400));
entrar('clinicaprincipal','errada');
await new Promise(r=>setTimeout(r,400));
T('10. senha local errada recusa c/ mensagem clara',((d.getElementById('loginMsg')||{}).textContent||'').includes('senha local incorreta'));
entrar('clinicaprincipal','Mercearia14@');
await new Promise(r=>setTimeout(r,600));
T('11. senha certa entra de novo',!d.getElementById('appScreen').classList.contains('hidden'));
/* cadastro offline: cria + duplicado avisa */
w.eval("$('btnSair').click();");
await new Promise(r=>setTimeout(r,400));
d.getElementById('lnkCadastro').click();
const cad=(n)=>{d.getElementById('regNome').value=n;d.getElementById('regSenha').value='senha123';d.getElementById('regConf').value='senha123';subForm('formCadastro');};
cad('Clinica Aurora');
await new Promise(r=>setTimeout(r,600));
T('12. cadastro offline criou acesso e entrou',!d.getElementById('appScreen').classList.contains('hidden'));
w.eval("$('btnSair').click();");
await new Promise(r=>setTimeout(r,400));
d.getElementById('lnkCadastro').click();
cad('Clinica Aurora');
await new Promise(r=>setTimeout(r,500));
T('13. nome local duplicado avisa (não entra)',!d.getElementById('appScreen')||d.getElementById('appScreen').classList.contains('hidden'));
T('14. nenhum erro de rede/JS em TODA a volta local',erros.length===0);
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (14/14)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
