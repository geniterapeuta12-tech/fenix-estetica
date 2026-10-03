(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// 1) Painel Dados · Sistema (zoom)
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await wait(700);
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await wait(300);
await page.evaluate(`(function(){
getCli().unshift({id:'cM',nome:'Marina Costa Pereira Souza',tel:'(31) 98888-1234',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:9});
getPkg().unshift({id:'p1',clinicKey:currentKey,clientId:'cM',nome:'Detox Glow Premium',valor:900,criadoEm:'',ts:9});
setCli(getCli().slice());setPkg(getPkg().slice());})();`);
await page.evaluate(`setMode('dados');showDados('sistema')`);
await wait(250);
await page.evaluate(`document.getElementById('zoomMais').click()`);
await wait(200);
await page.screenshot({path:'/home/user/r13-sistema.png'});

// 2) Fênix Clients no celular — texto longo não pode mais sair da tela
const mob=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await mob.goto('file:///home/user/index.html');
await wait(700);
await mob.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await wait(300);
await mob.evaluate(`(function(){
getCli().unshift({id:'cM',nome:'Marina Costa Pereira Souza Amaral',tel:'(31) 98888-1234',info:'Pacote Detox Glow premium com 8 sessões de drenagem linfática',nasc:'',cpf:'',email:'marina.souza.amaral@gmail.com',end:'',obs:'',criadoEm:'',ts:9});
getPkg().unshift({id:'p1',clinicKey:currentKey,clientId:'cM',nome:'Detox Glow Premium',valor:900,criadoEm:'',ts:9});
getPay().unshift({id:'y1',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',valor:300,data:'2026-09-15',metodo:'Pix',obs:'',sessaoId:null,ts:2});
setCli(getCli().slice());setPkg(getPkg().slice());setPay(getPay().slice());})();`);
await mob.evaluate(`setMode('clients')`);
await wait(300);
await mob.screenshot({path:'/home/user/r13-clients-celular.png'});
const ov=await mob.evaluate(`(function(){return {sw:document.documentElement.scrollWidth,iw:window.innerWidth};})()`);
console.log('scrollWidth',ov.sw,'innerWidth',ov.iw,ov.sw<=ov.iw+1?'SEM ESTOURO ✓':'AINDA ESTOURA ✘');

await browser.close();
console.log('prints r13 ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
