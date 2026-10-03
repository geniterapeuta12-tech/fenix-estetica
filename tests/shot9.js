(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,500)));
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await page.evaluate(`(function(){document.getElementById('usuNome').value='Rafaela Lima';
document.getElementById('usuSenha').value='1234';
document.getElementById('btnUsuSave').click();})();
(function(){
getUsu().unshift({id:'uBI',username:'bia.mendes',nome:'Bia Mendes',info:'Manicure',senha:encSenha('bia.mendes','bibi2024'),cargo:'',criadoEm:'hoje',visto:'',ts:2});
getUsu().unshift({id:'uCA',username:'carlos',nome:'Carlos Nunes',info:'Recepção',senha:encSenha('carlos','c@rlos'),cargo:'admin',criadoEm:'hoje',visto:'',ts:1});
setUsu(getUsu().slice());
localStorage.setItem('fenix_eu_aurora',getUsu().find(x=>x.username==='rafaela.lima').id);
setMode('equipe');})();`);
await new Promise(r=>setTimeout(r,300));
await page.screenshot({path:'/home/user/novo-admin.png'});
// chat
await page.evaluate(`document.querySelector('#navEquipe .navbtn[data-esub="msg"]').click()`);
await page.evaluate(`document.querySelector('[data-u="uBI"]').click();`);
await page.evaluate(`(function(){
const me=getUsu().find(x=>x.username==='rafaela.lima').id;
getMsg().unshift({id:'a1',from:'uBI',to:me,texto:'Rafa, já mandei as fotos do before and after por email 👍',url:null,nome:null,tamanho:0,criadoEm:'',ts:Date.now()-240000});
getMsg().unshift({id:'a2',from:me,to:'uBI',texto:'Vi! Amanhã confirmo o horário da Marina 💛',url:null,nome:null,tamanho:0,criadoEm:'',ts:Date.now()-180000});
getMsg().unshift({id:'a3',from:'uBI',to:me,texto:'Fechou! Qualquer coisa me chama aqui',url:null,nome:null,tamanho:0,criadoEm:'',ts:Date.now()-60000});
setMsg(getMsg().slice());renderThread();})();`);
await new Promise(r=>setTimeout(r,300));
await page.screenshot({path:'/home/user/novo-chat2.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
