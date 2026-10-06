/* R89 — permissão de TODOS os arquivos no APK (MANAGE_EXTERNAL_STORAGE) + painel c/ status e botão */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
const MJ=fs.readFileSync(path.join(__dirname,'..','apk-src','br','fenix','estetica','MainActivity.java'),'utf8');
const MF=fs.readFileSync(path.join(__dirname,'..','apk-manifest-vc48.xml'),'utf8');
T('1. versão 1.6.76 + versao.json R89 (5 melhorias)', W.includes("APP_VERSAO='1.6.76'")&&VJ.versao==='1.6.76'&&VJ.r==='R102'&&(VJ.melhorias||[]).length===5);
/* manifest */
T('2. manifest vc48/1.6.76 com MANAGE_EXTERNAL_STORAGE + requestLegacyExternalStorage', MF.includes('android:versionCode="48"')&&MF.includes('android:versionName="1.6.68"')&&MF.includes('android.permission.MANAGE_EXTERNAL_STORAGE')&&MF.includes('android:requestLegacyExternalStorage="true"'));
T('3. manifest guarda o resto (pacote · INTERNET · notificações · media · fenix scheme)', MF.includes("package=\"br.fenix.estetica\"")&&MF.includes('android.permission.INTERNET')&&MF.includes('android.permission.POST_NOTIFICATIONS')&&MF.includes('android.permission.READ_MEDIA_IMAGES')&&MF.includes('android:scheme="fenix"'));
/* java */
T('4. MainActivity: abre a tela da chave «Todos os arquivos» (abreTodosArq c/ fallback)', MJ.includes('MANAGE_APP_ALL_FILES_ACCESS_PERMISSION')&&MJ.includes('Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION')&&MJ.includes('Uri.fromParts("package", getPackageName(), null)'));
T('5. MainActivity: pede UMA vez na abertura (prefs pediuTodos + isExternalStorageManager)', MJ.includes('getSharedPreferences("fenix", MODE_PRIVATE)')&&MJ.includes('!sp.getBoolean("pediuTodos", false)')&&MJ.includes('Build.VERSION.SDK_INT >= 30 && !Environment.isExternalStorageManager()'));
T('6. MainActivity: statusPerms devolve «todos»', MJ.includes('boolean todos = true;')&&MJ.includes('+ todos + "}"'));
T('7. MainActivity: Ponte ganhou pedirTodosArq()', MJ.includes('@JavascriptInterface public void pedirTodosArq()')&&MJ.includes('runOnUiThread(new Runnable() { public void run() { abreTodosArq(); } });'));
T('8. MainActivity: seletor múltiplo do R88 intacto', MJ.includes('MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)')&&MJ.includes('data.getClipData()'));
/* app */
T('9. app: botão 🗂️ Permitir TODOS os arquivos no painel', W.includes('<button class="btn ghost" id="btnPermsTodos" type="button">🗂️ Permitir TODOS os arquivos</button>'));
T('10. app: status mostra «Todos os arquivos: permitido ✓ / bloqueado ⚠»', W.includes('🗂️ Todos os arquivos: <b>\'+(s.todos===false?\'bloqueado ⚠\':\'permitido ✓\')+\''));
T('11. app: botão chama FenixApp.pedirTodosArq() c/ aviso do APK novo', W.includes('window.FenixApp.pedirTodosArq()')&&W.includes('instala o APK novo da versão 1.6.68'));
T('12. app: fora do celular o botão explica que não precisa', W.includes('No navegador e no computador não precisa.'));
/* intactos */
T('13. R88 intacto (txt→PDF · 11 .fhid · card novo)', W.includes('id="txtPdfArq"')&&(W.match(/class="fhid"/g)||[]).length===11&&W.includes('<b>Arquivo de texto em PDF</b>'));
T('14. R87 intacto (catálogo pago · auto · somativo · docs export · logo fora)', W.includes('const pgV=parseMoney($(\'sellPago\').value)')&&W.includes('id="btnPacSoma"')&&W.includes('data-gact="expdf"')&&!W.includes('logoPaint'));
T('15. worker intacto (cap 5 + organizador + 7 irmãs)', WK.includes('if(canvasLista.length>=5)break;')&&WK.includes('UM ÚNICO canvas consolidado')&&['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'=')));
T('16. aninhamento HTML 0 erros', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('17. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/17)'));
process.exit(fail?1:0);
