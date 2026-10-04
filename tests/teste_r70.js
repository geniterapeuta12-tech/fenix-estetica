/* R70 — FIX porta do chat + Gerador de Posts (card+legenda+PNG) */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* FIX da porta */
T('1. FIX: renderApp MOSTRA viewIa (toggle hidden)', W.includes("$('viewIa').classList.toggle('hidden',!(studio&&state.sview==='ia'))"));
T('2. FIX: renderApp MOSTRA viewPosts', W.includes("$('viewPosts').classList.toggle('hidden',!(studio&&state.sview==='posts'))"));
/* Gerador de Posts */
T('3. item Gerador de Posts no Lab', /data-sview="posts" data-area="lab"/.test(W));
T('4. tela viewPosts com comando + resultado', W.includes('id="gpCmd"')&&W.includes('id="gpOut"')&&W.includes('id="gpCard"')&&W.includes('id="gpLeg"'));
T('5. botões Gerar/PNG/Copiar', W.includes('id="gpGo"')&&W.includes('id="gpPng"')&&W.includes('id="gpCopy"'));
T('6. chama /ia em modo post', /modo:'post'/.test(W)&&/gpGera[\s\S]{0,700}NUVEM_URL\+'\/ia'/.test(W));
T('7. aceita resposta objeto E string (JSON)', /typeof rr==='object'/.test(W));
T('8. card no estilo da marca (escuro+dourado+serifa)', W.includes('#141414')&&W.includes('#d4af37')&&W.includes('Playfair,Georgia'));
T('9. PNG: motor canvas 1080 (gpDesenha + post-fenix.png)', /gpDesenha\(cv,gpData,fim\)/.test(W)&&W.includes("'post-fenix.png'"));
T('10. sem internet/login: mensagens claras', W.includes('Entre com sua conta pra usar a I.A')&&W.includes('tenta de novo'));
T('11. título Gerador de Posts', W.includes("'Laboratório I.A · Gerador de Posts'"));
T('12. ordem no Lab: Relatórios → Gerador → Conversar', W.indexOf('data-sview="relatorios"')<W.indexOf('data-sview="posts"')&&W.indexOf('data-sview="posts"')<W.indexOf('data-sview="ia"'));
T('13. versão 1.6.52', W.includes("APP_VERSAO='1.6.68'"));
T('14. worker: modo post com JSON estrito', WK.includes('IA_POST')&&WK.includes('SOMENTE com um JSON válido')&&WK.includes("modo==='post'"));
T('15. worker: cérebro estético (sem promessa médica)', WK.includes('NUNCA prometa resultado médico'));
T('16. chat R69 intacto', /data-sview="ia" data-area="lab"/.test(W)&&W.includes("'Laboratório I.A · Fênix I.A'"));
T('17. resumo R66 intacto', /sc\[0\]==='resumo'\?relIaBloco\(\):''/.test(W));
T('18. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('19. versao.json 1.6.49/R70', VJ.versao==='1.6.68'&&VJ.r==='R89'&&(VJ.melhorias||[]).length>=3);
T('20. Center 1.8.0 intocado', fs.readFileSync(path.join(__dirname,'..','center-src','www','index.html'),'utf8').includes("CENTER_V='1.8.0'"));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/20)'));
process.exit(fail?1:0);
