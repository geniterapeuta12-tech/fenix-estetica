/* R64 — IA nos RELATÓRIOS (resumo bonito) + chat da IA removido */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* app — chat fora */
T('1. botão Fênix I.A removido do Studio', !W.includes('data-sview="ia"'));
T('2. handler/render/título do chat IA removidos', !W.includes("state.sview='ia'")&&!W.includes("'Studio · Fênix I.A'"));
T('3. viewIa segue como base das funções (sem porta)', W.includes('id="viewIa"')&&W.includes("viewIa:'studio'"));
T('4. versão 1.6.43', W.includes("APP_VERSAO='1.6.43'"));
/* app — IA nos relatórios */
T('5. card do Resumo da I.A no relatório', W.includes('id="relIaCard"')&&W.includes('Resumo da I.A'));
T('6. botão Gerar resumo bonito', W.includes('id="btnRelIa"'));
T('7. chama o worker /ia em modo resumo', /relIaGera[\s\S]{0,900}modo:'resumo'/.test(W));
T('8. usa o texto do relatório (relLastTxt) como contexto', /relIaGera[\s\S]{0,900}String\(relLastTxt\)\.slice\(0,6000\)/.test(W));
T('9. render em parágrafos com esc (sem HTML injetado)', /j\.resposta\.split\(\/\\n\{2,\}\/\)\.map\(p=>'<p>'\+esc\(p\)/.test(W));
T('10. botão copiar texto', W.includes('id="btnRelIaCopy"')&&W.includes('clipboard.writeText(relIaTexto)'));
T('11. montar novo relatório reseta o resumo IA', /relIaCard'\)\.classList\.add\('hidden'\)[\s\S]{0,400}Relatório montado/.test(W));
T('12. estado ocupado trava 2º clique (relIaBusy)', W.includes('let relIaBusy=false')&&W.includes('if(relIaBusy)return'));
T('13. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
/* worker */
T('14. worker: modo resumo com prompt elegante', WK.includes('IA_RESUMO')&&WK.includes('assistente pessoal')&&WK.includes('NUNCA invente números'));
T('15. worker: resumo usa o relatório do contexto', WK.includes("IA_RESUMO+'\\n\\nRELATÓRIO:\\n'+ctx"));
T('16. worker: chat normal segue (IA_SYS)', WK.includes('DADOS ATUAIS DA CLÍNICA'));
T('17. worker: R60/R61 intactos (R2 + /ia)', WK.includes('/r2-ok')&&WK.includes("p === '/ia'"));
/* versao.json */
T('18. versao.json 1.6.43/R64', VJ.versao==='1.6.43'&&VJ.r==='R64');
T('19. Center 1.8.0 intocado', fs.readFileSync(path.join(__dirname,'..','center-src','www','index.html'),'utf8').includes("CENTER_V='1.8.0'"));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/19)'));
process.exit(fail?1:0);
