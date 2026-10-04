/* R67 — AUTO-UPDATE real: APK baixa da nuvem (padrão Center) + EXE carrega a nuvem sempre */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
const JV=fs.readFileSync(path.join(__dirname,'..','apk-src','br','fenix','estetica','MainActivity.java'),'utf8');
const EX=fs.readFileSync(path.join(__dirname,'..','exe-src','main.js'),'utf8');
/* APK */
T('1. APK: updater existe (checaNova)', JV.includes('private void checaNova()'));
T('2. APK: carrega app-live.html se existir (senão asset)', JV.includes('app-live.html')&&JV.includes('android_asset/www/index.html'));
T('3. APK: compara versao.json da nuvem com a instalada', JV.includes('versao.json')&&JV.includes('getPackageInfo(getPackageName(), 0).versionName'));
T('4. APK: nunca rebaixa (maisNova)', JV.includes('private boolean maisNova'));
T('5. APK: baixa index.html da nuvem e salva (openFileOutput)', JV.includes('NUVEM + "index.html"')&&JV.includes('openFileOutput("app-live.html"'));
T('6. APK: recarrega o WebView após baixar', JV.includes('runOnUiThread')&&JV.includes('wv.loadUrl("file://" + getFilesDir() + "/app-live.html")'));
T('7. APK: rede fora da UI thread (Thread + timeouts)', JV.includes('new Thread(new Runnable()')&&JV.includes('setConnectTimeout'));
T('8. APK: sem internet = nada quebra (try/catch geral)', /catch \(Exception e\) \{\}/.test(JV));
/* EXE */
T('9. EXE: carrega a NUVEM sempre (loadURL)', EX.includes("w.loadURL(NUVEM"));
T('10. EXE: no-cache pra pegar a versão nova', EX.includes("'Cache-Control': 'no-cache'"));
T('11. EXE: sem internet → cópia interna (fallback)', EX.includes('loadFile(path.join(__dirname')&&EX.includes('caiLocal'));
T('12. EXE: fonte versionada no repo (exe-src/)', fs.existsSync(path.join(__dirname,'..','exe-src','package.json')));
/* app */
T('13. APP_VERSAO 1.6.48', W.includes("APP_VERSAO='1.6.68'"));
T('14. Resumo da I.A embutido intacto (R66)', /sc\[0\]==='resumo'\?relIaBloco\(\):''/.test(W));
T('15. versao.json 1.6.49/R70', VJ.versao==='1.6.68'&&VJ.r==='R89'&&(VJ.melhorias||[]).length>=3);
T('16. JS do app válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('17. Center 1.8.0 intocado', fs.readFileSync(path.join(__dirname,'..','center-src','www','index.html'),'utf8').includes("CENTER_V='1.8.0'"));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/17)'));
process.exit(fail?1:0);
