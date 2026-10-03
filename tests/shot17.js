(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,700)));
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
// 1) tela pública do cliente — abas
const page2=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page2.route('**/rest/v1/rpc/fenix_cliente_pub*',r=>r.fulfill({status:200,contentType:'application/json',
 body:JSON.stringify({cliente:{nome:'Marina Costa'},clinica:'Clínica Aurora',pago_total:750,
  pacotes:[{nome:'Detox Glow',valor:900,qtd:8,feitas:3,pago:300},{nome:'Pós-Operatório',valor:450,qtd:4,feitas:4,pago:450}],
  proximas:[{data:'2026-10-02',num:4,obs:'Drenagem linfática',pacote:'Detox Glow'},{data:'2026-10-09',num:5,obs:'Peeling',pacote:'Detox Glow'}],
  realizadas:[{data:'2026-09-18',num:3,obs:'Peeling anterior',pacote:'Detox Glow'},{data:'2026-09-11',num:2,obs:'Drenagem',pacote:'Detox Glow'}],
  pagamentos:[{valor:300,data:'2026-09-15',metodo:'Pix'},{valor:450,data:'2026-09-10',metodo:'Cartão'}]})}));
await page2.goto('file:///home/user/index.html#cli=cliMarina');
await page2.evaluate(()=>new Promise(r=>setTimeout(r,900)));
await page2.screenshot({path:'/home/user/r11-cliente-inicio.png'});
await page2.evaluate(`document.querySelector('[data-cpt="ses"]').click()`);
await page2.evaluate(()=>new Promise(r=>setTimeout(r,250)));
await page2.screenshot({path:'/home/user/r11-cliente-sessoes.png'});

// 2) relatório novo
await page.evaluate(`(function(){
getCli().unshift({id:'cM',nome:'Marina Costa',tel:'(31) 98888-1234',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:9});
getPkg().unshift({id:'p1',clinicKey:currentKey,clientId:'cM',nome:'Detox Glow',valor:900,criadoEm:'',ts:9});
getSes().unshift({id:'s1',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',num:4,feita:false,data:'2026-10-02',obs:'Drenagem',ts:4});
getSes().unshift({id:'s2',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',num:3,feita:true,data:'2026-09-18',obs:'Peeling completo',ts:3});
getPay().unshift({id:'y1',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',valor:300,data:'2026-09-15',metodo:'Pix',obs:'',sessaoId:null,ts:2});
getAg().unshift({id:'g1',clinicKey:currentKey,clientId:'cM',cliente:'Marina Costa',data:'2026-10-02',hora:'14:00',proc:'Drenagem linfática',pacoteId:'p1',sessaoId:null,obs:'',ts:2});
setCli(getCli().slice());setPkg(getPkg().slice());setSes(getSes().slice());setPay(getPay().slice());setAg(getAg().slice());})();`);
await page.evaluate(`(function(){
const html=relatorioHTML().replace('<div class="barraprint"><button onclick="window.print()">⬇ Salvar como PDF</button></div>','');
document.open();document.write(html);document.close();})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,500)));
await page.screenshot({path:'/home/user/r11-relatorio.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
