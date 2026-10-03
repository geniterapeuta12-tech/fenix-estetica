/* R76 — fundo junto da imagem + I.A lê relatório + anexos no chat + I.A da cliente + contatos */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const C=fs.readFileSync(path.join(__dirname,'..','clients','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* fundo JUNTO da imagem (dono: «a i.a não gera fundo separado, o fundo é junto da imagem») */
T('1. gerar post cria o fundo automático (gpAplica + gpFundoIA(true))', /gpAplica\(j\);if\(!gpFundo\)gpFundoIA\(true\);/g.test(W)&&(W.match(/gpAplica\(j\);if\(!gpFundo\)gpFundoIA\(true\);/g)||[]).length===2);
T('2. gpFundoIA aceita modo automático (silencioso se falhar)', /async function gpFundoIA\(auto\)/.test(W)&&/if\(!auto\)msg\(\$\\'gpMsg\\'\),\'⚠/.test(W)||W.includes("if(!auto)msg($('gpMsg'),'⚠ '"));
T('3. fundo escolhido NÃO é sobrescrito', /if\(!gpFundo\)gpFundoIA\(true\)/.test(W));
/* I.A lê relatório */
T('4. painel «Pergunte à I.A sobre ESTE relatório»', W.includes('id="relQ"')&&W.includes('id="relAsk"')&&W.includes('Pergunte à I.A sobre ESTE relatório'));
T('5. usa modo rel com o texto do relatório', W.includes("modo:'rel',pergunta:q.slice(0,500)")&&W.includes('String(relLastTxt).slice(0,6000)'));
/* anexos no chat */
T('6. botão 📎 + input no chat', W.includes('id="btnIaAnexo"')&&W.includes('id="iaAnexo"')&&W.includes('id="iaAnexoChip"'));
T('7. foto → /ia-vis (visão)', /NUVEM_URL\+\\'\/ia-vis\\'/.test(W)||W.includes("NUVEM_URL+'/ia-vis'"));
T('8. PDF lido (pdf.js preguiçoso + aviso se for só imagem)', W.includes('async function pdfTexto(')&&W.includes('pdf.min.js')&&W.includes('parece ser só imagem'));
T('9. txt entra como contexto do anexo', W.includes('ANEXO ENVIADO PELA CLÍNICA'));
T('10. worker: /ia-vis com llava (sem pessoas expostas — só dono logado)', WK.includes("p === '/ia-vis'")&&WK.includes('@cf/llava-hf/llava-1.5-7b-hf')&&WK.split('/ia-vis')[1].slice(0,300).includes('verifyJWT'));
/* I.A da cliente (SÓ CONVERSA — decisão do dono) */
T('11. worker: /ia-cliente público com dados SÓ da cliente (rpc)', WK.includes("p === '/ia-cliente'")&&WK.includes('rpcClientePub(env, pid)')&&WK.includes('freio')===false&&WK.includes('__fxThro'));
T('12. worker: NUNCA agenda — manda falar com o estúdio', WK.includes('NUNCA agende, remarque ou cancele nada')&&WK.includes('para agendar ela deve falar direto com o estúdio'));
T('13. clients: aba ✦ I.A + chat', C.includes('data-go="f-ia"')&&C.includes('id="fcIaIn"')&&C.includes('/ia-cliente'));
T('14. clients: responde só com os dados dela (placeholder)', C.includes('quantas sessões já fiz'));
/* contatos do estúdio */
T('15. dono cadastra WhatsApp/Instagram (Dados › Sistema)', W.includes('id="cWa"')&&W.includes('id="cInsta"')&&W.includes('id="btnContato"')&&W.includes('/clinic-contato'));
T('16. worker: salva na clinics + rpc devolve wa/insta', WK.includes('SELECT nome, wa, insta FROM clinics')&&WK.includes('UPDATE clinics SET wa = ?')&&WK.includes('wa: (clin && clin.wa) || null'));
T('17. clients: contatos no herói (wa.me + instagram)', C.includes('https://wa.me/55')&&C.includes('https://instagram.com/')&&C.includes('Fale com a clínica'));
/* versão + integridade */
T('18. versão 1.6.56 + versao.json R76 (4 melhorias)', W.includes("APP_VERSAO='1.6.60'")&&VJ.versao==='1.6.60'&&VJ.r==='R81'&&(VJ.melhorias||[]).length>=3);
T('19. nada quebrou (chat/fundos/PDF/editor/documentos)', ["$('viewIa').classList.toggle","gpFundoIA(true)",'relPdfModelo','edFromPost','iaDocGera','gpMelhora'].every(f=>W.includes(f)));
T('20. cérebros todos presentes no worker', ['const IA_POST','const IA_DOC','const IA_SYS','const IA_RESUMO','const IA_CLIENTE','const IA_REL'].every(k=>WK.includes(k)));
T('21. JS válidos (app + clients)', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);new Function(C.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('22. worker sintaxe (node --check)', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/22)'));
process.exit(fail?1:0);
