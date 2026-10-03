/* R75 — POST REAL: fundos do pacote + galeria + I.A de imagem + motor de encaixe */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* fundos do pacote */
T('1. 5 fundos embutidos (base64)', (W.match(/data:image\/jpeg;base64,/g)||[]).length>=5);
T('2. nomes dos fundos (mármore/seda/folhas/fumaça/pedras)', ['marmore','seda','folhas','fumaca','pedras'].every(k=>W.includes("'"+k+"':")));
T('3. escolha persiste (fenix_gpfundo)', W.includes("localStorage.getItem('fenix_gpfundo'")&&W.includes("localStorage.setItem('fenix_gpfundo'"));
/* galeria + IA */
T('4. foto da galeria (file input + leitura reduzida)', W.includes('id="gpFoto"')&&W.includes('id="edFoto"')&&W.includes('function leImagemReduz('));
T('5. seletor nos dois lugares (gpFundos + edFundos)', W.includes('id="gpFundos"')&&W.includes('id="edFundos"')&&/montaFundoRow\('gpFundos','gpFoto',false\)/.test(W)&&/montaFundoRow\('edFundos','edFoto',true\)/.test(W));
T('6. Fundo I.A no app (gpFundoIA + edFundoIA)', /async function gpFundoIA\(/.test(W)&&/function edFundoIA\(\)/.test(W)&&W.includes("NUVEM_URL+'/ia-imagem'"));
T('7. worker: rota /ia-imagem com flux + sem pessoas/texto', WK.includes("p === '/ia-imagem'")&&WK.includes('@cf/black-forest-labs/flux-1-schnell')&&WK.includes('no people, no faces')&&WK.includes('no text'));
T('8. worker: IA de imagem exige login (verifyJWT)', WK.includes("if (p === '/ia-imagem' && req.method === 'POST') {")&&WK.split('/ia-imagem')[1].slice(0,400).includes('verifyJWT'));
/* motor de encaixe */
T('9. véu de legibilidade no PNG e no preview', W.includes('function veu(ctx)')&&W.includes('linear-gradient(180deg,rgba(8,8,8,.24)'));
T('10. auto-ajuste sem distorção (fitLines)', /function fitLines\(ctx,texto,maxW,maxH,zMin,zMax/.test(W));
T('11. fundo cobre sem distorcer (drawCover)', /function drawCover\(ctx,img,W,H\)/.test(W));
T('12. zonas do post (kicker/título/benefícios/rodapé)', W.includes("'✦ ESTÚDIO DE ESTÉTICA ✦',90,128")&&W.includes("'✓  '+j2")&&W.includes("ctx.fillText(nome,160,1014)"));
T('13. PNG novo ligado (gpPngV2/edPngV2)', /\$\('gpPng'\)\.addEventListener\('click',gpPngV2\)/.test(W)&&/\$\('edPng'\)\.addEventListener\('click',edPngV2\)/.test(W));
T('14. motores SVG antigos REMOVIDOS', !W.includes('gpSVG')&&!W.includes('edSVG'));
T('15. elementos do editor acima do véu (z-index)', W.includes('style="position:absolute;z-index:2;'));
T('16. fonte esperada antes de desenhar (document.fonts)', /await prontoFontes\(\)/.test(W));
/* nada quebrou */
T('17. gerador/melhorar/documentos/pdf/chat intactos', ['function gpAplica(j){','async function gpMelhora(){','iaDocGera','relPdfModelo',"$('viewIa').classList.toggle"].every(f=>W.includes(f)));
T('18. versão 1.6.56 + versao.json R75 (3+ melhorias)', W.includes("APP_VERSAO='1.6.60'")&&VJ.versao==='1.6.60'&&VJ.r==='R81'&&(VJ.melhorias||[]).length>=3);
T('19. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('20. worker sintaxe (node --check)', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/20)'));
process.exit(fail?1:0);
