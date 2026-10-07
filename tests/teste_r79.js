/* R79 — BIBLIOTECA na barra da Fênix I.A + CANVAS (texto/pdf) + PENSAMENTO da I.A visível */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* pensamento */
T('1. worker: IA lê o arquivo (modo geral)', WK.includes('const ehGeral=')&&WK.includes("modo==='doc'||modo==='rel'"));
T('2. worker: formato <pensamento>+<resposta>', WK.includes('FORMATO OBRIGATÓRIO')&&WK.includes('<pensamento>')&&WK.includes('pensamento:pensa'));
T('3. worker: modos rel/doc/post/resumo SEM pensamento (intactos)', (WK.match(/return j\(\{resposta:\(out&&out\.resposta\)\|\|'',motor\}\);/g)||[]).length===1);
T('4. app: pushMsg guarda o pensamento', W.includes('function pushMsg(papel,texto,pensa')&&W.includes("pushMsg('ia',rt,pc,arq)"));
T('5. app: bolha 💭 Pensamento abre o raciocínio', W.includes('class="ia-pensa-btn"')&&W.includes('class="ia-pensa-corpo"')&&W.includes("b.textContent=ab?'💭 Esconder pensamento':'💭 Pensamento'"));
T('6. worker sintaxe + 6 cérebros intactos', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return['const IA_POST','const IA_DOC','const IA_SYS','const IA_RESUMO','const IA_CLIENTE','const IA_REL','/ia-imagem','/ia-cliente','/ia-vis','/clinic-contato','/doc-texto'].every(k=>WK.includes(k))&&WK.split('async function aiChat(').length===2;}catch(e){return false}})());
/* biblioteca */
T('7. abas Conversas | Biblioteca na barra', W.includes('id="iaTabConv"')&&W.includes('id="iaTabBib"')&&W.includes('📚 Biblioteca'));
T('8. acervo próprio por clínica (localStorage)', W.includes("localStorage.getItem('fenix_ia_can_'+(currentKey||'local')")&&W.includes('function getCans'));
T('9. lista da biblioteca + apagar', W.includes('id="iaBibList"')&&W.includes("data-act=\"delcan\"")&&W.includes('function renderIaBib'));
/* canvas */
T('10. (R84) canvas é SÓ da I.A — botão ✦ Funções removido', !W.includes('id="btnIaFun"')&&!W.includes('iaFunPop'));
T('11. (R84) modal de criação manual removido', !W.includes('iaCanModal')&&!W.includes('btnIaCanCriar'));
T('12. tela do canvas: salva sozinho + título', W.includes('id="iaCanvas"')&&W.includes('id="iaCanTexto"')&&W.includes('iaCanTmr=setTimeout(canSave,400)'));
T('13. (R84) sem botão Gerar PDF — a I.A entrega o PDF pronto; motor do PDF continua', !W.includes('btnIaCanPdf')&&W.includes('function iaCanPdfBytes')&&W.includes('id="btnIaCanBaixar"'));
T('14. PDF do canvas: título grande + SEM Courier (regra do dono)', (()=>{const i=W.indexOf('function iaCanPdfBytes'),j=W.indexOf('return pdf;}',i);if(i<0||j<0)return false;const b=W.slice(i,j);return b.includes('/BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding')&&b.includes('/BaseFont /Helvetica /Encoding /WinAnsiEncoding')&&!b.includes('/Courier');})());
T('15. canvas NÃO usa o /doc-texto nem altera anexo', W.includes("NUVEM_URL+'/doc-texto'")&&W.includes('id="btnIaAnexo"')&&W.includes('id="iaAnexoChip"'));
/* intactos */
T('16. chat/rel/posts/documentos intactos', ['iaSend','relIaAuto','gpAplica','iaDocGera','relPdfModelo','buildIaCtx'].every(f=>W.includes(f)));
T('17. versão 1.6.58 + versao.json R79 (3+)', W.includes("APP_VERSAO='1.6.84'")&&VJ.versao==='1.6.84'&&VJ.r==='R110'&&(VJ.melhorias||[]).length>=3);
T('18. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('19. worker aceita modo vazio (chat) com pensamento e rota /ia única', WK.includes("const modo=String(b&&b.modo||'').slice(0,20);")&&WK.split("p === '/ia'").length===2);
T('20. cliente não afetada (só conversa)', (()=>{try{return fs.readFileSync(path.join(__dirname,'..','clients','index.html'),'utf8').includes('/ia-cliente')}catch(e){return true}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/20)'));
process.exit(fail?1:0);
