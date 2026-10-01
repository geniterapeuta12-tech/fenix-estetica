/* R71/R72 — I.A nos Documentos (4 botões) + Editor no Studio (canva) + Editar no Studio */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* PORTAS (a lição R69/R70: seção sem toggle = função invisível) */
T('1. PORTA: renderApp mostra viewEditor', W.includes("$('viewEditor').classList.toggle('hidden',!(studio&&state.sview==='editor'))"));
T('2. nav Editor no Studio (data-area=studio)', /data-sview="editor" data-area="studio"/.test(W));
T('3. handler do nav + título Editor', W.includes("b.dataset.sview==='editor'")&&W.includes("'Studio · Editor'"));
T('4. seção viewEditor com card e botões', W.includes('id="viewEditor"')&&W.includes('id="edCard"')&&W.includes('id="edPng"'));
T('5. renderApp inicializa e desenha o editor', W.includes("if(!edData)edData=edBlank();edRender();"));
/* R71 — I.A nos Documentos */
T('6. painel Gerar documento na lista (ddCmd/ddGo)', W.includes('id="ddCmd"')&&W.includes('id="ddGo"')&&W.includes('I.A nos Documentos'));
T('7. 3 botões no editor de texto (Melhorar/Resumir/Corrigir)', W.includes('id="docIaM"')&&W.includes('id="docIaR"')&&W.includes('id="docIaC"'));
T('8. usa modo doc no worker', /modo:'doc'/.test(W)&&W.includes('iaFetch'));
T('9. gerar cria documento p/ revisão (rascunho aberto)', W.includes('Rascunho da I.A pronto')&&/state\.docId=d\.id/.test(W));
T('10. melhorar/resumir/corrigir no trecho selecionado ou texto todo', /ta\.selectionStart\|\|0/.test(W)&&W.includes('slice(i0,i1)'));
T('11. resultado marca «Alterações não salvas» (dono revisa e salva)', W.includes("setDocBadge('Alterações não salvas','b-red')")&&W.includes('confira e SALVE'));
/* R72 — Editor */
T('12. toque duplo edita texto', /now-lastTap<350/.test(W)&&W.includes('edEdTxt'));
T('13. arrastar move elemento (pointer + clamp)', W.includes('pointerdown')&&W.includes('edRenderSoft')&&W.includes('Math.min(92'));
T('14. A+/A− alteram tamanho (clamp 18-150)', W.includes('Math.min(150,el.s+8)')&&W.includes('Math.max(18,el.s-8)'));
T('15. paleta da marca (4 cores dourado/creme)', W.includes("ED_CORES=['#d4af37','#f0e6c0','#ffffff','#cfc9bb']")&&W.includes('(el.c+1)%ED_CORES.length'));
T('16. duplicar e apagar (mínimo 1 texto)', W.includes('edData.els.push(c)')&&W.includes('pelo menos um texto'));
T('17. PNG do editor (SVG→canvas→design-fenix.png)', W.includes('edSVG(edData.els,1080)')&&W.includes("'design-fenix.png'"));
T('18. designs salvos (fenix_designs: salvar/listar/abrir/apagar)', W.includes("localStorage.getItem('fenix_designs'")&&W.includes('edListDesigns'));
T('19. ligação Gerador→Editor (Editar no Studio)', W.includes('id="gpEdit"')&&/edData=edFromPost\(gpData\)/.test(W));
T('20. v1 SEM foto de fundo (fundo é cor, não imagem)', !/edCard[\s\S]{0,200}background(-image)?\s*:\s*url/.test(W));
/* nada quebrou */
T('21. chat/gerador intactos (portas viewIa/viewPosts)', W.includes("$('viewIa').classList.toggle")&&W.includes("$('viewPosts').classList.toggle"));
T('22. worker IA_DOC (sem promessa médica)', WK.includes('IA_DOC')&&WK.includes('NUNCA dê orientação médica')&&WK.includes("modo==='doc'"));
T('23. resumo R66 intacto', /sc\[0\]==='resumo'\?relIaBloco\(\):''/.test(W));
T('24. versão 1.6.52 + versao.json', W.includes("APP_VERSAO='1.6.52'")&&VJ.versao==='1.6.52'&&VJ.r==='R73'&&(VJ.melhorias||[]).length>=3);
T('25. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('26. worker sintaxe (node --check)', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/26)'));
process.exit(fail?1:0);
