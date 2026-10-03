const fs=require('fs');
const {JSDOM}=(function(){return {JSDOM:null}})(); // placeholder, não usado
void JSDOM;
(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const src=fs.readFileSync(__dirname+'/cat_fotos.js','utf8');
const CAT_FOTOS=new Function(src+'\n;return CAT_FOTOS;')();
const fotos=Object.values(CAT_FOTOS);
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});

// ---- RPC público interceptado (tela do cliente funciona sem SQL rodado) ----
await page.route('**/rest/v1/rpc/fenix_cliente_pub*',r=>r.fulfill({status:200,contentType:'application/json',
 body:JSON.stringify({cliente:{nome:'Marina Costa'},clinica:'Clínica Aurora',
  pacotes:[{nome:'Detox Glow',valor:900,qtd:8,feitas:3},{nome:'Pós-Operatório',valor:450,qtd:4,feitas:4}],
  proximas:[{data:'2026-10-02',num:4,obs:'Drenagem linfática',pacote:'Detox Glow'},{data:'2026-10-09',num:5,obs:'Peeling',pacote:'Detox Glow'}],
  pagamentos:[{valor:300,data:'2026-09-15',metodo:'Pix'},{valor:300,data:'2026-08-30',metodo:'Cartão'}]})}));

// 1) Catálogo vitrine
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,700)));
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await page.evaluate((fotos)=>{(function(){
const itens=[['Drenagem Linfática',620,'procedimento','Modeladora corporal · 50 min'],
['Peeling de Diamante',480,'procedimento','Renovação celular profunda'],
['Limpeza de Pele Premium',390,'procedimento','Com extração e máscara calmante'],
['Sérum Vitamina C',189.9,'produto','Antioxidação e brilho'],
['Protetor Solar FPS 60',129.9,'produto','Toque seco, uso diário'],
['Massagem Modeladora',540,'procedimento','Contorno corporal · pacote 5x']];
itens.forEach((it,i)=>{getCat().unshift({id:'catDemo'+i,tipo:it[2],nome:it[0],descr:it[3],preco:it[1],foto:i<fotos.length?fotos[i]:null,criadoEm:'',atualizadoEm:'',ts:10-i});});
setCat(getCat().slice());
getKit().unshift({id:'kitDemo',nome:'Combo Pós-Verão',descr:'Peeling + sérum + protetor',preco:599,itens:['catDemo2','catDemo3','catDemo4'],criadoEm:'',atualizadoEm:'',ts:1});
setKit(getKit().slice());setMode('catalogo');})();},fotos);
await page.evaluate(()=>new Promise(r=>setTimeout(r,400)));
await page.screenshot({path:'/home/user/r8-catalogo.png'});

// 2) Fênix Clients (lado da clínica)
await page.evaluate(`(function(){
getCli().unshift({id:'cliMarina',nome:'Marina Costa',tel:'(31) 98888-1234',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:9});
getCli().unshift({id:'cliBia',nome:'Beatriz Nunes',tel:'(31) 97777-4321',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:8});
setCli(getCli().slice());setMode('clients');})();`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r8-clients.png'});

// 3) Tela pública do cliente (link #cli=)
const page2=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page2.route('**/rest/v1/rpc/fenix_cliente_pub*',r=>r.fulfill({status:200,contentType:'application/json',
 body:JSON.stringify({cliente:{nome:'Marina Costa'},clinica:'Clínica Aurora',
  pacotes:[{nome:'Detox Glow',valor:900,qtd:8,feitas:3},{nome:'Pós-Operatório',valor:450,qtd:4,feitas:4}],
  proximas:[{data:'2026-10-02',num:4,obs:'Drenagem linfática',pacote:'Detox Glow'},{data:'2026-10-09',num:5,obs:'Peeling',pacote:'Detox Glow'}],
  pagamentos:[{valor:300,data:'2026-09-15',metodo:'Pix'},{valor:300,data:'2026-08-30',metodo:'Cartão'}]})}));
await page2.goto('file:///home/user/index.html#cli=cliMarina');
await page2.evaluate(()=>new Promise(r=>setTimeout(r,900)));
await page2.screenshot({path:'/home/user/r8-cliente-pub.png'});

await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
