/* R64/R66 — Resumo da I.A EMBUTIDO no relatório (prévia + PDF + txt), automático */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. card antigo REMOVIDO (relIaCard/Box/Msg/Acts zerados)', !W.includes('relIaCard')&&!W.includes('relIaBox')&&!W.includes('relIaActs'));
T('2. botão ✨ Resumo da I.A ao lado de Baixar PDF', /id="btnRelPdfDl"[\s\S]{0,220}id="btnRelIa"/.test(W));
T('3. relIaBloco renderiza os 3 estados', W.includes('function relIaBloco')&&W.includes('relIaPend')&&W.includes('✍️ A I.A está escrevendo'));
T('4. PRÉVIA: bloco entra na seção resumo', /sc\[0\]==='resumo'\?relIaBloco\(\):''/.test(W));
T('5. PDF (relDocHTML): bloco entra após resumo geral, antes de Financeiro', /emAberto\)[\s\S]{0,80}relIaBloco\(\)\+[\s\S]{0,20}secDoc\(2,'Financeiro'/.test(W));
T('6. TXT: bloco entra antes de FINANCEIRO', /if\(relIaTexto\)\{L\.push\(''\);L\.push\('--- RESUMO DA I\.A ---'\);L\.push\(relIaTexto\);\}/.test(W));
T('7. montar relatório dispara a I.A automático', /relIaTexto='';relIaPend=false;try\{relIaAuto\(\);\}catch\(e\)\{\}/.test(W));
T('8. chama o worker /ia em modo resumo c/ o texto do relatório', /relIaAuto[\s\S]{0,800}modo:'resumo'/.test(W)&&/relIaAuto[\s\S]{0,900}String\(relLastTxt\)\.slice\(0,6000\)/.test(W));
T('9. chegada da I.A regenera prévia+PDF+txt (respeita personalizado)', /if\(relPers\)\{relLastDoc=relFiltraDoc\(relDocHTML[\s\S]{0,120}relTxtFiltrado/.test(W));
T('10. botão ✨ regenera (limpa e chama de novo)', /\$\('btnRelIa'\)\.addEventListener\('click',\(\)=>\{if\(!relLastTxt\)return msg[\s\S]{0,120}relIaTexto='';relIaAuto\(\);/.test(W));
T('11. sem HTML injetado (esc nos parágrafos)', /esc\(p\)\.replace\(\/\\n\/g,'<br>'\)/.test(W));
T('12. versão 1.6.47', W.includes("APP_VERSAO='1.6.68'"));
T('13. worker: modo resumo com prompt elegante', WK.includes('IA_RESUMO')&&WK.includes("modo==='resumo'"));
T('14. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('15. versao.json 1.6.45/R66', VJ.versao==='1.6.68'&&VJ.r==='R89'&&v_j_ok());
function v_j_ok(){try{return (VJ.melhorias||[]).length>=3}catch(e){return false}}
T('16. Center 1.8.0 intocado', fs.readFileSync(path.join(__dirname,'..','center-src','www','index.html'),'utf8').includes("CENTER_V='1.8.0'"));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/16)'));
process.exit(fail?1:0);
