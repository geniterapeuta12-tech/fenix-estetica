(async()=>{
const chromium=require('@sparticuz/chromium');
const {chromium:pw}=require('playwright-core');
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});
const page=await browser.newPage({viewport:{width:1000,height:950},deviceScaleFactor:1.5});
await page.goto('file:///home/user/index.html');
await page.evaluate(()=>new Promise(r=>setTimeout(r,700)));
await page.screenshot({path:'/home/user/r7-login.png'});
await page.evaluate(`entrarLocal({nome:'Clínica Aurora'},'aurora')`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.evaluate(`setMode('equipe')`);
await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));
await page.screenshot({path:'/home/user/r7-equipe.png'});
await browser.close();
console.log('prints ok');
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1)});
