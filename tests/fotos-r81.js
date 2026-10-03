/* fotos R81: (1) Aparência com tema Lava ativo · (2) Uso e limites · (3) modal de termos */
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright-core');
const cr=require('@sparticuz/chromium');
(async()=>{
const exe=await cr.executablePath();
const b=await chromium.launch({executablePath:exe,args:cr.args,headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{const f=window.fetch;window.fetch=async(u,o)=>{if(String(u).includes('versao.json')){return new Response(JSON.stringify({versao:'1.6.60',r:'R81',melhorias:[]}),{status:200,headers:{'Content-Type':'application/json'}});}return f(u,o);};});
const cdp=await pg.context().newCDPSession(pg);
const shot=async(f)=>{const r=await cdp.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));};
await pg.goto('file:///home/user/index.html',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2500);
// fecha o modal de atualização (o Pages ainda está na 1.6.59; a local é 1.6.60)
await pg.evaluate(()=>{const bs=[...document.querySelectorAll('button')];const b=bs.find(x=>/mais tarde/i.test(x.textContent||''));if(b)b.click();document.querySelectorAll('.pmodal,.backdrop').forEach(x=>x.classList.add('hidden'));});
await pg.waitForTimeout(600);
// passa do splash
const go=await pg.$('#btnSplashGo');
if(go){await go.click().catch(()=>{});await pg.waitForTimeout(800);}
// entra local ( igual teste anterior )
await pg.evaluate(()=>{try{const u=JSON.parse(localStorage.getItem('fenix_usu')||'null');if(u)entrarLocal(u,'local');}catch(e){}});
await pg.waitForTimeout(1200);
if(await pg.$('#authScreen:not(.hidden)')){
  await pg.evaluate(()=>{document.getElementById('splash').classList.add('hidden');document.getElementById('authScreen').classList.add('hidden');});
}
await pg.evaluate(()=>{try{
  window.usuarios=window.usuarios||[];
  entrarLocal({nome:'Dono',usuario:'dono'},'chave-local');
}catch(e){console.log(e.message)}});
await pg.waitForTimeout(3500);
// fecha o «Bem-vinda, Dono — COMEÇAR» (id próprio, classe pmodal-soft)
await pg.evaluate(()=>{const b=document.getElementById('btnWelcomeGo');if(b)b.click();});
await pg.waitForTimeout(600);
await pg.evaluate(()=>{['welcomeModal','splash','authScreen'].forEach(i=>{const e=document.getElementById(i);if(e)e.classList.add('hidden');});
document.querySelectorAll('.pmodal,.pmodal-soft,.backdrop').forEach(x=>x.classList.add('hidden'));});
await pg.waitForTimeout(800);
// aceita termos (já viu)
await pg.evaluate(()=>{try{localStorage.setItem('fenix_termos_v1','1')}catch(e){};const m=document.getElementById('termosAceite');if(m)m.classList.add('hidden');});
// FOTO 1: Dados → Aparência com tema Lava (API real do app)
await pg.evaluate(()=>{setMode('dados');state.dsub='theme';renderApp();});
await pg.waitForTimeout(1000);
await pg.evaluate(()=>{try{applyAccent('lava');}catch(e){}});
await pg.waitForTimeout(800);
await shot('/home/user/ui-r81-temas.png');
// FOTO 2: Uso e limites (ainda em lava — prova coerência total do tema)
await pg.evaluate(()=>{state.dsub='uso';renderApp();});
await pg.waitForTimeout(2500);
await shot('/home/user/ui-r81-uso.png');
// FOTO 3: modal de termos (dourado de volta)
await pg.evaluate(()=>{try{applyAccent('gold');}catch(e){}});
await pg.evaluate(()=>{try{localStorage.removeItem('fenix_termos_v1');checarTermosAceite();}catch(e){}});
await pg.waitForTimeout(800);
await shot('/home/user/ui-r81-termos.png');
await b.close();
console.log('fotos ok');
process.exit(0);
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1);});
