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
document.getElementById('usuInfo').value='Esteticista';
document.getElementById('btnUsuSave').click();})()`);
// DOC com guias
await page.evaluate(`setMode('studio')`);
await page.evaluate(`document.querySelector('#navStudio .navbtn[data-sview="docs"]').click()`);
await page.evaluate(`document.getElementById('btnNovoDoc').click()`);
await page.evaluate(`document.getElementById('docTitulo').value='Ficha de anamnese';
document.getElementById('docTexto').value='Dados da cliente:\\n— Pele mista, com manchas na zona T\\n— Sem alergias conhecidas';
document.getElementById('btnDocSave').click();
document.getElementById('btnGuiaAdd').click();
document.getElementById('docTexto').value='Histórico de sessões:\\n1. Limpeza de pele — 12/09\\n2. Peeling — 26/09';
document.getElementById('btnGuiaAdd').click();
document.getElementById('docTexto').value='Fotos antes e depois serão anexadas aqui.';
document.getElementById('btnDocFav').click();`);
await new Promise(r=>setTimeout(r,300));
await page.screenshot({path:'/home/user/novo-docs.png'});

// modal editar lançamento
await page.evaluate(`setMode('gestao')`);
await page.evaluate(`(function(){
getCli().unshift({id:'c5',nome:'Marina Duarte',criadoEm:'hoje',ts:1});setCli(getCli().slice());
getFin().unshift({id:'fx',tipo:'in',desc:'Combo Relaxar + Limpeza de Pele (promoção)',valor:290,data:'2026-09-20',link:{tipo:'cliente',id:'c5',clientId:'c5'},obs:'Catálogo: Combo Relaxar, Limpeza de Pele',origem:'cat'});
setFin(getFin().slice());
openClient('c5');openSub('financeiro');
document.querySelector('#finCliCat [data-act="finedit"]').click();})();
document.getElementById('efValor').value='250';`);
await new Promise(r=>setTimeout(r,300));
await page.screenshot({path:'/home/user/novo-editfin.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
