(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/tests/off.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,400)));
await page.evaluate(`entrarLocal({nome:'Clínica Teste'},'teste')`);
await page.evaluate(`setMode('catalogo')`);
await page.evaluate(`
setCat([
 {id:'c1',tipo:'produto',nome:'Sérum Vitamina C 10%',descr:'Antioxidante noturno',preco:89.9,criadoEm:'',atualizadoEm:'',ts:3},
 {id:'c2',tipo:'produto',nome:'Protetor Solar FPS 50',descr:'',preco:null,criadoEm:'',atualizadoEm:'',ts:2},
 {id:'c3',tipo:'produto',nome:'Máscara de Argila',descr:'Uso semanal',preco:45,criadoEm:'',atualizadoEm:'',ts:1}
]);
renderCat();`);
await new Promise(r=>setTimeout(r,300));
await page.evaluate(`applyTheme('light')`);
await new Promise(r=>setTimeout(r,250));
await page.screenshot({path:'/home/user/catalogo-light.png'});
await browser.close();
console.log('print ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
