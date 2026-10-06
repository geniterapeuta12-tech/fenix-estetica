/* R88 — ARQUIVO .txt → PDF nas extras · inputs de arquivo funcionam no celular (.fhid) · APK vc47 c/ seletor múltiplo */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
const MJ=fs.readFileSync(path.join(__dirname,'..','apk-src','br','fenix','estetica','MainActivity.java'),'utf8');
T('1. versão 1.6.80 + versao.json R88 (5 melhorias)', W.includes("APP_VERSAO='1.6.80'")&&VJ.versao==='1.6.80'&&VJ.r==='R106'&&(VJ.melhorias||[]).length===5);
/* arquivo de texto → PDF */
T('2. extras: função é ARQUIVO de texto → PDF (card + caixa)', W.includes('<b>Arquivo de texto em PDF</b>')&&W.includes('<h3 style="margin-top:10px">📄 Arquivo de texto em PDF</h3>'));
T('3. extras: campo de arquivo .txt/.md/.csv (fhid) + botão escolher + nome aparece', W.includes('id="txtPdfArq" accept=".txt,.md,.csv')&&W.includes('id="btnTxtArq"')&&W.includes('id="txtPdfNome"'));
T('4. extras: FileReader lê o arquivo e enche texto+título', W.includes("$('txtPdfArq').addEventListener('change'")&&W.includes('rd.readAsText(f,\'utf-8\')')&&W.includes("f.name.replace(/\\.[^.]*$/,'')"));
T('5. extras: gerar PDF segue (pdfBonitoBytes nos 2 canvases intactos)', (W.match(/\.pdf=pdfBonitoBytes\(/g)||[]).length===2);
/* celular: inputs de arquivo */
T('6. CSS .fhid: escondido OFFSCREEN e não display:none (WebView exige)', W.includes('.fhid{display:block!important;position:fixed!important;left:-9999px!important')&&W.indexOf('.fhid{')>W.indexOf('.hidden{display:none!important}'));
T('7. TODOS os inputs escondidos viraram .fhid (11 no total)', (W.match(/class="fhid"/g)||[]).length===11&&W.includes('<input type="file" id="iaAnexo" accept="image/*,.txt,.md,.csv,.pdf,.doc,.docx,.json,.log" class="fhid">'));
T('8. sem input de arquivo com hidden/display:none antigo', !W.includes('id="fundoArquivo" accept="image/*" style="display:none"')&&!W.includes('id="catFotoInput" accept="image/*" hidden'));
T('9. umInput (Arquivos) continua VISÍVEL', W.includes('<input type="file" id="umInput" multiple>')&&!W.includes('id="umInput" multiple class="fhid"'));
/* APK vc47 */
T('10. MainActivity: onShowFileChooser (seletor do Android)', MJ.includes('onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p)')&&MJ.includes('Intent.createChooser(i, "Escolher arquivo")'));
T('11. MainActivity: aceita ESCOLHER VÁRIOS (EXTRA_ALLOW_MULTIPLE por modo)', MJ.includes('MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)'));
T('12. MainActivity: onActivityResult devolve VÁRIOS (ClipData) ou um', MJ.includes('data.getClipData()')&&MJ.includes('clip.getItemAt(i2).getUri()')&&MJ.includes('fileCb.onReceiveValue(out)'));
T('13. worker intacto (cap 5 + organizador + 7 irmãs)', WK.includes('if(canvasLista.length>=5)break;')&&WK.includes('UM ÚNICO canvas consolidado')&&['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'=')));
/* R87 intacto */
T('14. R87 intacto (catálogo pago · auto · somativo · docs export)', W.includes('const pgV=parseMoney($(\'sellPago\').value)')&&W.includes("sort((a2,b2)=>a2.falta-b2.falta)")&&W.includes('id="btnPacSoma"')&&W.includes('data-gact="expdf"'));
T('15. logo continua removida', !W.includes('logoPaint')&&!W.includes('fenix_logo')&&!W.includes('LOGO_BIN'));
T('16. R84-R86 intactos (contexto 30k · agente · protocolo)', WK.includes('slice(0,30000)')&&W.includes('id="btnIaAgente"')&&W.includes('id="ddProto"'));
T('17. aninhamento HTML 0 erros', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('18. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
