(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const PUB={cliente:{nome:'Marina Costa'},clinica:'Clínica Aurora',pago_total:750,
 pacotes:[{nome:'Detox Glow',valor:900,qtd:8,feitas:3,pago:300},{nome:'Pós-Operatório',valor:450,qtd:4,feitas:4,pago:450}],
 proximas:[{data:'2026-10-02',num:4,obs:'Drenagem linfática',pacote:'Detox Glow'},{data:'2026-10-09',num:5,obs:'Peeling',pacote:'Detox Glow'}],
 realizadas:[{data:'2026-09-18',num:3,obs:'Peeling anterior',pacote:'Detox Glow'},{data:'2026-09-11',num:2,obs:'Drenagem',pacote:'Detox Glow'}],
 pagamentos:[{valor:300,data:'2026-09-15',metodo:'Pix'},{valor:450,data:'2026-09-10',metodo:'Cartão'}]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// 1) cliente no COMPUTADOR — sidebar
const desk=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
await desk.route('**/rest/v1/rpc/fenix_cliente_pub*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(PUB)}));
await desk.goto('file:///home/user/index.html#cli=cliMarina');
await wait(900);
await desk.screenshot({path:'/home/user/r12-cliente-desktop.png'});

// 2) cliente no CELULAR — barra inferior
const mob=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await mob.route('**/rest/v1/rpc/fenix_cliente_pub*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(PUB)}));
await mob.goto('file:///home/user/index.html#cli=cliMarina');
await wait(900);
await mob.screenshot({path:'/home/user/r12-cliente-celular.png'});
await mob.evaluate(`document.querySelector('#cpBody .cpbnav [data-cpt="pac"]').click()`);
await wait(250);
await mob.screenshot({path:'/home/user/r12-cliente-celular-pacotes.png'});

// 3) wizard do relatório — clínica
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await wait(700);
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await wait(300);
await page.evaluate(`(function(){
getCli().unshift({id:'cM',nome:'Marina Costa',tel:'(31) 98888-1234',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:9});
getPkg().unshift({id:'p1',clinicKey:currentKey,clientId:'cM',nome:'Detox Glow',valor:900,criadoEm:'',ts:9});
getPkg().unshift({id:'p2',clinicKey:currentKey,clientId:'cM',nome:'Pós-Operatório',valor:450,criadoEm:'',ts:8});
getSes().unshift({id:'s1',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',num:4,feita:false,data:'2026-10-02',obs:'Drenagem',ts:4});
getSes().unshift({id:'s2',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',num:3,feita:true,data:'2026-09-18',obs:'Peeling completo',ts:3});
getPay().unshift({id:'y1',clinicKey:currentKey,clientId:'cM',pacoteId:'p1',valor:300,data:'2026-09-15',metodo:'Pix',obs:'',sessaoId:null,ts:2});
getPay().unshift({id:'y2',clinicKey:currentKey,clientId:'cM',pacoteId:'p2',valor:450,data:'2026-09-10',metodo:'Cartão',obs:'',sessaoId:null,ts:1});
getAg().unshift({id:'g1',clinicKey:currentKey,clientId:'cM',cliente:'Marina Costa',data:'2026-10-02',hora:'14:00',proc:'Drenagem linfática',pacoteId:'p1',sessaoId:null,obs:'',ts:2});
getFin().unshift({id:'f1',clinicKey:currentKey,desc:'Almofadas',valor:120,tipo:'out',data:'2026-09-05',obs:'',ts:1});
setCli(getCli().slice());setPkg(getPkg().slice());setSes(getSes().slice());setPay(getPay().slice());setAg(getAg().slice());setFin(getFin().slice());})();`);
await page.evaluate(`setMode('studio')`);
await wait(200);
await page.evaluate(`document.querySelector('#navStudio [data-sview="relatorios"]').click()`);
await wait(250);
await page.evaluate(`document.getElementById('btnRelMontar').click()`);
await wait(250);
await page.evaluate(`document.getElementById('relPrev').scrollIntoView()`);
await wait(150);
await page.screenshot({path:'/home/user/r12-relatorio-clinica.png'});

// 4) wizard — cliente específica
await page.evaluate(`document.getElementById('relTipoCliente').click()`);
await wait(150);
await page.evaluate(`(function(){const o=[...document.getElementById('relCliSel').options].find(o=>o.textContent.includes('Marina'));document.getElementById('relCliSel').value=o.value;})();`);
await page.evaluate(`document.getElementById('btnRelMontar').click()`);
await wait(250);
await page.screenshot({path:'/home/user/r12-relatorio-cliente.png'});

// 5) documento PDF (mesma página, document.write)
await page.evaluate(`(function(){document.open();document.write(relDocHTML(relCore(null)));document.close();})();`);
await wait(500);
await page.screenshot({path:'/home/user/r12-relatorio-pdf.png'});

await browser.close();
console.log('prints r12 ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
