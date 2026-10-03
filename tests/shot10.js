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
getUsu().unshift({id:'uBI',username:'bia.mendes',nome:'Bia Mendes',info:'',senha:encSenha('bia','bibi1'),cargo:'testador',status:'ativo',criadoEm:'hoje',visto:'',ts:3});
getUsu().unshift({id:'uCA',username:'carlos',nome:'Carlos Nunes',info:'Recepção',senha:encSenha('carlos','c1'),cargo:'trabalhador',status:'pendente',pediuEm:'hoje, 21:40',criadoEm:'hoje',visto:'',ts:2});
getUsu().unshift({id:'uDUDU',username:'duda',nome:'Duda Prado',info:'',senha:'',cargo:'trabalhador',status:'bloqueado',criadoEm:'hoje',visto:'',ts:1});
setUsu(getUsu().slice());
setMode('equipe');})();
document.querySelector('#navEquipe .navbtn[data-esub="caixa"]').click();`);
await new Promise(r=>setTimeout(r,300));
await page.screenshot({path:'/home/user/novo-caixa.png'});
await browser.close();
console.log('print ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
