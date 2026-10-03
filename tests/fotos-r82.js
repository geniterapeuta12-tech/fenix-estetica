/* fotos R82: (1) fundo do app ativo · (2) modo claro com tema limão (sem fundo preto) */
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright-core');
const cr=require('@sparticuz/chromium');
(async()=>{
const exe=await cr.executablePath();
const b=await chromium.launch({executablePath:exe,args:cr.args,headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{const f=window.fetch;window.fetch=async(u,o)=>{if(String(u).includes('versao.json')){return new Response(JSON.stringify({versao:'1.6.61',r:'R82',melhorias:[]}),{status:200,headers:{'Content-Type':'application/json'}});}return f(u,o);};});
const cdp=await pg.context().newCDPSession(pg);
const shot=async(f)=>{const r=await cdp.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));};
await pg.goto('file:///home/user/index.html',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(2500);
await pg.evaluate(()=>{const bs=[...document.querySelectorAll('button')];const b=bs.find(x=>/mais tarde/i.test(x.textContent||''));if(b)b.click();});
await pg.waitForTimeout(600);
const go=await pg.$('#btnSplashGo');
if(go){await go.click().catch(()=>{});await pg.waitForTimeout(800);}
await pg.evaluate(()=>{try{entrarLocal({nome:'Dono',usuario:'dono'},'chave-local');}catch(e){}});
await pg.waitForTimeout(3500);
await pg.evaluate(()=>{const b=document.getElementById('btnWelcomeGo');if(b)b.click();});
await pg.waitForTimeout(600);
await pg.evaluate(()=>{['welcomeModal','splash','authScreen'].forEach(i=>{const e=document.getElementById(i);if(e)e.classList.add('hidden');});document.querySelectorAll('.pmodal,.pmodal-soft,.backdrop').forEach(x=>x.classList.add('hidden'));try{localStorage.setItem('fenix_termos_v1','1');const m=document.getElementById('termosAceite');if(m)m.classList.add('hidden');}catch(e){}});
await pg.waitForTimeout(800);
// fundo: usa uma imagem pequena real do workspace como se fosse do aparelho
const b64=fs.readFileSync('/home/user/uploads/imagem_2026-09-29_090329746.png').toString('base64');
await pg.evaluate((b64)=>{try{localStorage.setItem('fenix_fundo','data:image/png;base64,'+b64);applyFundo();}catch(e){}},b64);
await pg.evaluate(()=>{try{setMode('dados');state.dsub='theme';renderApp();}catch(e){}});
await pg.waitForTimeout(1000);
await shot('/home/user/ui-r82-fundo.png');
// modo claro + limão
await pg.evaluate(()=>{try{applyTheme('light');applyAccent('limao');}catch(e){}});
await pg.waitForTimeout(900);
await shot('/home/user/ui-r82-claro.png');
await b.close();
console.log('fotos R82 ok');
process.exit(0);
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1);});
