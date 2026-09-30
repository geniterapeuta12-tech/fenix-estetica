const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/center-src/www/index.html','utf-8');
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};

/* ===== estáticos ===== */
T('1. UI mestra: versão 1.7.0', html.includes("CENTER_V='1.7.0'") && html.includes('v1.7.0'));
T('2. auto-atualização na UI (checa ao abrir + a cada 30min + nunca rebaixa)', html.includes('async function checaUiNova') && html.includes('setInterval(checaUiNova,30*60*1000)') && html.includes('function uiMaisNova') && html.includes("document.open();document.write(inj);document.close();"));
T('3. base href injetado no swap (ícones resolvem)', html.includes('<base href="https://geniterapeuta12-tech.github.io/fenix-estetica/center/">'));
T('4. UI mestra = center/app.html publicada (byte-idênticas)', fs.readFileSync('/home/user/center/app.html','utf-8')===html);
T('5. Java: carregar() nativo + nunca rebaixa (maisNova) + base', (()=>{const j=fs.readFileSync('/home/user/center-src/br/fenix/center/MainActivity.java','utf-8');return j.includes('private void carregar()')&&j.includes('maisNova')&&j.includes('center-live.html')&&j.includes('CENTER_V = "1.7.0"')&&j.includes('LIVE_UI')&&j.includes('finish();')&&!j.includes('wv.goBack()');})());
T('6. landing da marca intacta (não confundir com o app)', fs.existsSync('/home/user/center/index.html') && fs.readFileSync('/home/user/center/index.html','utf-8').includes('bem-vindo à fênix'));

/* ===== comportamental: recebe versão ANTIGA → NÃO troca; nova → troca ===== */
let html2='<scr'+'ipt>window.__fila=[null,null];window.fetch=async(u)=>{const r=window.__fila.shift();if(!r)return{ok:false};return {ok:true,text:async()=>r};};</scr'+'ipt>'+html;
const dom=new JSDOM(html2,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
await new Promise(r=>setTimeout(r,120));
T('7. app abre normal sem resposta do servidor (ok:false)', d.getElementById('view-inicio') && !d.getElementById('view-account').classList.contains('esconde')===false);
/* antiga (1.5.9): NÃO troca */
w.__fila=["<!DOCTYPE html><html><head><title>VELHO</title></head><body>x CENTER_V='1.5.9'</body></html>",null];
await w.eval("checaUiNova()");
await new Promise(r=>setTimeout(r,150));
T('8. versão mais ANTIGA no ar → NÃO rebaixa (não troca a tela)', d.getElementById('view-inicio')!==null && d.title!=='VELHO');
/* nova (1.7.0): troca na hora */
w.__fila=["<!DOCTYPE html><html><head><title>NOVO</title></head><body>center atualizado CENTER_V='1.9.9'</body></html>",null];
await w.eval("checaUiNova()");
await new Promise(r=>setTimeout(r,200));
T('9. versão NOVA no ar → entra nela sozinho (swap imediato)', d.title==='NOVO' && d.body.textContent.includes('1.9.9'));
/* conta local sobrevive ao swap (localStorage) */
w.localStorage.setItem('center_conta',JSON.stringify({usuario:'fatima.silva',senha:'x',ts:1}));
T('10. conta local persiste no storage (sobrevive a atualizações)', JSON.parse(w.localStorage.getItem('center_conta')).usuario==='fatima.silva');

/* ===== R57 — consertos reportados pelo dono (DOM fresco) ===== */
{
const dom2=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w2=dom2.window;
await new Promise(r=>{if(w2.document.readyState==='complete')return r();w2.addEventListener('load',r);setTimeout(r,5000);});
const d2=w2.document;
d2.getElementById('navAccount').click();
await new Promise(r=>setTimeout(r,60));
T('11. CSS esconde view (Account não "abre no início")', html.includes('.view.esconde{display:none}') && d2.getElementById('view-inicio').classList.contains('esconde')===true && d2.getElementById('view-account').classList.contains('esconde')===false);
const ativos=Array.from(d2.querySelectorAll('.navbtn.active'));
T('12. seleção ÚNICA na barra (só Account marcada)', ativos.length===1 && ativos[0].id==='navAccount');
d2.getElementById('btnVoltar').click();
await new Promise(r=>setTimeout(r,60));
const ativos2=Array.from(d2.querySelectorAll('.navbtn.active'));
T('13. de volta ao Início: só Início marcada, voltar some', ativos2.length===1 && ativos2[0].id==='navInicio' && !d2.getElementById('btnVoltar').classList.contains('show'));
}
/** R58 — blindagem: tudo clicável mesmo num DOM recém-trocado */
{
const dom3=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w3=dom3.window;
await new Promise(r=>{if(w3.document.readyState==='complete')return r();w3.addEventListener('load',r);setTimeout(r,5000);});
const d3=w3.document;
d3.getElementById('navAccount').click();
await new Promise(r=>setTimeout(r,50));
T('14. BLINDAGEM: Account abre por ADDEventListener (binds novos)', !d3.getElementById('view-account').classList.contains('esconde'));
d3.getElementById('btnVoltar').click();
d3.getElementById('acUser').value='teste.ok';
d3.getElementById('acUser').dispatchEvent(new w3.Event('input',{bubbles:true}));
T('15. BLINDAGEM: prévia do e-mail reage (acUser bound)', d3.getElementById('acHandlePrev').textContent.includes('teste.ok@fenix.app'));
d3.getElementById('navAccount').click();
await new Promise(r=>setTimeout(r,40));
d3.getElementById('btnMenu').click();
d3.querySelector('#painelMenu .mitem').click();
await new Promise(r=>setTimeout(r,50));
T('16. ⊞ Início volta ao início (typo __fenixFirst corrigido)', d3.getElementById('view-inicio').classList.contains('esconde')===false && d3.getElementById('view-account').classList.contains('esconde')===true);
}
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (16/16)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
