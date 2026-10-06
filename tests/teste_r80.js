/* R80 — I.A lê TUDO (somente leitura) + Nova conversa de verdade + Canvas criado pela I.A */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* 1) contexto completo somente leitura */
T('1. worker: instrução de CANVAS no modo geral', WK.includes('CRIAR ARQUIVOS (CANVAS)')&&WK.includes('<canvas tipo="texto"')&&WK.includes('tipo="pdf"'));
T('2. (R86) worker: extrai VÁRIOS canvases (canvasLista) e devolve', WK.includes('const canvasLista=[]')&&WK.includes('canvas,canvasLista,motor'));
T('3. (R86) extração multi fica no ehGeral (agente incluso)', WK.includes('if(canvasLista.length)resp=resp.replace')&&!WK.includes("||modo==='agente');"));
T('4. worker: pensamento continua lá + 6 cérebros', WK.includes('FORMATO OBRIGATÓRIO')&&['const IA_POST','const IA_DOC','const IA_SYS','const IA_RESUMO','const IA_CLIENTE','const IA_REL'].every(k=>WK.includes(k))&&WK.split('async function aiChat(').length===2);
T('5. app: ctx COMPLETO somente leitura (clientes+pagos+falta)', W.includes('SOMENTE LEITURA')&&W.includes('FALTA pagar ')&&W.includes('=== CLIENTES (')&&W.includes('=== PACOTES ('));
T('6. app: ctx lê catálogo, kits, pagamentos, sessões e agenda', W.includes('=== CATÁLOGO (')&&W.includes('[KIT] ')&&W.includes('=== PAGAMENTOS (')&&W.includes('=== SESSÕES PENDENTES (')&&W.includes('=== AGENDA ('));
T('7. app: resumo do mês continua', W.includes('RESUMO DO MÊS:')&&W.includes('Aniversariantes do mês'));
/* 2) conversa nova de verdade */
T('8. ensureConv NUNCA adota conversa antiga', W.includes('return newConv(false);} /* R80')&&!W.includes('sort((a,b)=>b.ts-a.ts)[0].id'));
T('9. lista esconde conversas vazias («Nova conversa» sem msg)', W.includes(".filter(x=>msgsOf(x.id).length>0||x.titulo!=='Nova conversa')"));
/* 3) canvas pela I.A */
T('10. pushMsg carrega o arquivo (arq)', W.includes('function pushMsg(papel,texto,pensa,arq)')&&W.includes('arq:arq||null'));
T('11. (R86) iaSend: lê canvasLista + varre canvases do texto + salva TODOS', W.includes('Array.isArray(j.canvasLista)')&&W.includes('LST.push({tipo:mm[1],titulo:mm[2],conteudo:mm[3]})')&&W.includes('else nX++'));
T('12. arquivo criado pela I.A entra na Biblioteca', W.includes('const Lc=getCans();Lc.unshift(novo);setCans(Lc);')&&W.includes('ia:true'));
T('13. cartão do arquivo no chat abre o canvas', W.includes('class="ia-arq" type="button" data-canabrir=')&&W.includes('openCanvas(abrir.dataset.canabrir)'));
T('14. CSS do cartão', W.includes('.ia-arq{align-self:flex-start')&&W.includes('html[data-theme="light"] .ia-arq'));
/* intactos */
T('15. pensamento/anexo intactos (canvas manual saiu no R84)', W.includes('class="ia-pensa-corpo"')&&W.includes('id="iaAnexoChip"')&&!W.includes('id="btnIaCanCriar"'));
T('16. relatórios/posts/documentos/clientes intactos', ['relPdfModelo','gpAplica','iaDocGera','buildIaCtx'].every(f=>W.includes(f)));
T('17. versão 1.6.79 + versao.json R80 (3+)', W.includes("APP_VERSAO='1.6.79'")&&VJ.versao==='1.6.79'&&VJ.r==='R105'&&(VJ.melhorias||[]).length>=3);
T('18. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('19. worker sintaxe ok', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
T('20. (R84) Biblioteca guarda arquivos criados PELA I.A (sem criação manual)', W.includes("id=\"btnIaCanBaixar\"")&&!W.includes('iaCanModal'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/20)'));
process.exit(fail?1:0);
