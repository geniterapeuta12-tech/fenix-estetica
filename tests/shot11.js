(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,600)));
// A) login com as 3 abas — aba "Sou da equipe" ativa
await page.evaluate(`(function(){
document.querySelector('#authScreen .tab[data-tab="equip"]').click();
document.getElementById('eqEmail').value='bia@mendes.com';
})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r6-login-equipe.png'});
// B) painel de estado (pedido / bloqueado)
await page.evaluate(`(function(){
msPanel('Acesso removido','Você foi removido(a) desta clínica pelo administrador. Se quiser voltar, toque em "Pedir para entrar" abaixo e envie um novo pedido — quem decide é o administrador.',true);
document.getElementById('msTitulo').textContent='Acesso removido';
})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r6-pedido.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
