(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,500)));
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
// fecha modal "quem está usando" preenchendo
await page.evaluate(`(function(){document.getElementById('usuNome').value='Rafaela Lima';
document.getElementById('usuUser').value='rafaela.lima';
document.getElementById('usuInfo').value='Esteticista · sócia';
document.getElementById('btnUsuSave').click();})()`);
// catálogo: prontos + preços + kit
await page.evaluate(`setMode('catalogo')`);
await page.evaluate(`(function(){
document.getElementById('btnCatPresets').click();
document.getElementById('btnPresetAll').click();
document.getElementById('presetClose').click();
getCat().find(x=>x.nome==='Limpeza de Pele').preco=120;
getCat().find(x=>x.nome==='Peeling Químico').preco=180;
getCat().find(x=>x.nome==='Drenagem Linfática').preco=95;
getCat().find(x=>x.nome==='Massagem com Pedras Quentes').preco=140;
setCat(getCat().slice());})();
openKitEd(null);catDraft.nome='Combo Relaxar';catDraft.descr='Massagem + drenagem em 1 pacote fechado';
catDraft.itens=[getCat().find(x=>x.nome==='Massagem com Pedras Quentes').id,getCat().find(x=>x.nome==='Drenagem Linfática').id];
catDraft.preco=200;catDraft.isNew=false;catDraft.criadoEm='hoje';catDraft.atualizadoEm='hoje';catDraft.ts=Date.now();
getKit().length?getKit()[0]=catDraft:getKit().unshift(catDraft);setKit(getKit().slice());catDraft=null;goBack();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.evaluate(`applyTheme('light')`);
await new Promise(r=>setTimeout(r,300));
await page.screenshot({path:'/home/user/novo-catalogo.png'});

// tema verde coral (catálogo)
await page.evaluate(`applyAccent('coral')`);
await new Promise(r=>setTimeout(r,350));
await page.screenshot({path:'/home/user/novo-coral.png'});
await page.evaluate(`applyAccent('gold')`);

// modal vender do catálogo na cliente
await page.evaluate(`(function(){
getCli().unshift({id:'c9',nome:'Marina Duarte',tel:'',criadoEm:'hoje',ts:Date.now()});setCli(getCli().slice());
openClient('c9');openSub('financeiro');})();
`);
await new Promise(r=>setTimeout(r,250));
await page.evaluate(`document.getElementById('btnCatSell').click()`);
await page.evaluate(`(function(){
const k='k:'+getKit()[0].id,i='i:'+getCat().find(x=>x.nome==='Limpeza de Pele').id;
const li1=document.querySelector('[data-ref="'+k+'"]');if(li1)li1.click();
const li2=document.querySelector('[data-ref="'+i+'"]');if(li2)li2.click();})();
sellTouched=true;document.getElementById('sellValor').value='290';
document.getElementById('sellDesc').value='Combo Relaxar + Limpeza de Pele (promoção)';`);
await new Promise(r=>setTimeout(r,250));
await page.screenshot({path:'/home/user/novo-venda.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
