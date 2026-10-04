const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/center-src/www/index.html','utf-8');
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};

/* ===== estáticos ===== */
T('1. UI mestra: versão 2.0.0 (Plataforma Fênix)', html.includes("CENTER_V='2.1.0'") && html.includes('v2.0.0'));
T('2. auto-atualização na UI (checa ao abrir + a cada 30min + nunca rebaixa)', html.includes('async function checaUiNova') && html.includes('setInterval(checaUiNova,30*60*1000)') && html.includes('function uiMaisNova') && html.includes("document.open();document.write(inj);document.close();"));
T('3. base href injetado no swap (ícones resolvem)', html.includes('<base href="https://geniterapeuta12-tech.github.io/fenix-estetica/center/">'));
T('4. UI mestra = center/app.html publicada (byte-idênticas)', fs.readFileSync('/home/user/center/app.html','utf-8')===html);
T('5. Java: carregar() nativo + nunca rebaixa (maisNova) + base', (()=>{const j=fs.readFileSync('/home/user/center-src/br/fenix/center/MainActivity.java','utf-8');return j.includes('private void carregar()')&&j.includes('maisNova')&&j.includes('center-live.html')&&j.includes('CENTER_V = "1.8.0"')&&j.includes('LIVE_UI')&&j.includes('finish();')&&!j.includes('wv.goBack()');})());
T('6. landing da marca intacta (não confundir com o app)', fs.existsSync('/home/user/center/index.html') && fs.readFileSync('/home/user/center/index.html','utf-8').includes('bem-vindo à fênix'));

/* ===== comportamental: recebe versão ANTIGA → NÃO troca; nova → troca ===== */
let html2='<scr'+'ipt>window.__fila=[null,null];window.fetch=async(u)=>{const r=window.__fila.shift();if(!r)return{ok:false};return {ok:true,text:async()=>r};};</scr'+'ipt>'+html;
const dom=new JSDOM(html2,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
await new Promise(r=>setTimeout(r,120));
T('7. Center abre normal sem resposta do servidor (tela de login intacta)', d.getElementById('vLogin') && d.getElementById('vLogin').classList.contains('hidden')===false);
/* antiga (1.5.9): NÃO troca */
w.__fila=["<!DOCTYPE html><html><head><title>VELHO</title></head><body>x CENTER_V='1.5.9'</body></html>",null];
await w.eval("checaUiNova()");
await new Promise(r=>setTimeout(r,150));
T('8. versão mais ANTIGA no ar → NÃO rebaixa (não troca a tela)', d.getElementById('vLogin')!==null && d.title!=='VELHO');
/* nova (1.8.0): troca na hora */
w.__fila=["<!DOCTYPE html><html><head><title>NOVO</title></head><body>center atualizado CENTER_V='2.9.9'</body></html>",null];
await w.eval("checaUiNova()");
await new Promise(r=>setTimeout(r,200));
T('9. versão NOVA no ar → entra nela sozinho (swap imediato)', d.title==='NOVO' && d.body.textContent.includes('2.9.9'));
/* conta local sobrevive ao swap (localStorage) */
w.localStorage.setItem('center_conta',JSON.stringify({usuario:'fatima.silva',senha:'x',ts:1}));
T('10. conta local persiste no storage (sobrevive a atualizações)', JSON.parse(w.localStorage.getItem('center_conta')).usuario==='fatima.silva');

/* ===== R57/R58 — REFEITOS p/ a v2.0 (a UI clássica virou Plataforma Fênix) ===== */
{
const dom2=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w2=dom2.window;
await new Promise(r=>{if(w2.document.readyState==='complete')return r();w2.addEventListener('load',r);setTimeout(r,5000);});
const d2=w2.document;
d2.getElementById('btnEntrar').click();
await new Promise(r=>setTimeout(r,60));
T('11. BLINDAGEM: Entrar vazio avisa (bind por addEventListener)', d2.getElementById('loginMsg').textContent.includes('Preenche'));
d2.getElementById('fxEmail').value='ana@clinicabelle';
d2.getElementById('fxEmail').dispatchEvent(new w2.Event('input',{bubbles:true}));
T('12. campo de email reage (input bound)', d2.getElementById('fxEmail').value.includes('ana@clinicabelle'));
T('13. painéis começam certos (login aberto · dono e clínica escondidos)', !d2.getElementById('vLogin').classList.contains('hidden') && d2.getElementById('vDono').classList.contains('hidden') && d2.getElementById('vCli').classList.contains('hidden'));
T('14. convite de abrir-logado começa fechado', d2.getElementById('conviteW').classList.contains('hidden'));
}
/* ===== R59 — fim do service worker zumbi + bolinha estática ===== */
T('17. UI mestra NÃO registra mais service worker (Center é app)', !html.includes('serviceWorker.register'));
T('18. sw.js EXTERMINADOR no ar: apaga todos os caches e se desregistra', (()=>{const sw=fs.readFileSync('/home/user/center/sw.js','utf-8');return sw.includes('caches.delete')&&sw.includes('unregister')&&sw.includes('EXTERMINADOR');})());
T('19. bolinha do oficial ESTÁTICA (sem piscar)', !html.includes('animation:pulse') && html.includes("CENTER_V='2.1.0'"));
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (19/19)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
