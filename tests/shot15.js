(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,700)));
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
// 1) Relatórios no Studio
await page.evaluate(`(function(){setMode('studio');state.sview='relatorios';renderApp();})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r9-relatorios.png'});
// 2) Aparência com os 5 temas
await page.evaluate(`(function(){setMode('dados');showDados('theme');})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r9-temas.png'});
// 3) Fênix Clients com acesso (uma pausada)
await page.evaluate(`(function(){
getCli().unshift({id:'cliMarina',nome:'Marina Costa',tel:'(31) 98888-1234',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:9});
getCli().unshift({id:'cliBia',nome:'Beatriz Nunes',tel:'(31) 97777-4321',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:8});
getCli().unshift({id:'cliRafa',nome:'Rafaela Lima',tel:'(31) 96666-0099',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',acesso:false,ts:7});
setCli(getCli().slice());setMode('clients');})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r9-clients-acesso.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
