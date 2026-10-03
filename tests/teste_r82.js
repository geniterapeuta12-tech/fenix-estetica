/* R82 — consertos: financeiro/catálogo na cliente + fundo + claro + canvas PDF pela I.A + Fênix I.A na cliente */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const CL=fs.readFileSync(path.join(__dirname,'..','clients','index.html'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* 1) versão */
T('1. versão 1.6.63 + versao.json R82 (5 melhorias)', W.includes("APP_VERSAO='1.6.63'")&&VJ.versao==='1.6.63'&&VJ.r==='R84'&&(VJ.melhorias||[]).length>=5);
/* 2) financeiro na cliente: FIFO no worker */
T('2. worker: pago por pacote = vínculo + FIFO dos sem vínculo', WK.includes('R82 — «pago» por pacote: pagamentos vinculados + distribuição FIFO')&&WK.includes('let fila = (pgall.results || []).filter(x => !x.pacote_id)')&&WK.includes('pago += usa'));
T('3. worker: feitas por mapa + itens parse seguro', WK.includes('feitasMap[p.id] || 0')&&WK.includes('itens = p.itens ? JSON.parse(p.itens) : []'));
T('4. cliente: itens do catálogo com chip de pago/falta', CL.includes("var stP=falta>0?'<span class=\"aberto\">⏳ falta '+brl(falta)+'</span>':'<span class=\"pos\">✓ pago</span>';")&&CL.includes("' · incluído '+stP"));
/* 3) fundo */
T('5. fundo vai no BODY (html era tapado) + limpa legado do html', W.includes("const st=document.body?document.body.style:null;")&&W.includes("['background-image','background-size','background-position','background-attachment','background-repeat'].forEach(k=>hr.removeProperty(k));"));
T('6. camada do fundo acompanha claro/escuro + applyTheme re-aplica', W.includes("escuro?'rgba(8,7,5,.8),rgba(8,7,5,.8)':'rgba(243,239,228,.88),rgba(243,239,228,.88)'")&&W.includes("try{applyFundo();}catch(e){}}"));
/* 4) claro dos temas novos */
T('7. 7 regras claras (marfim) pros temas novos — NUNCA preto', (W.match(/html\[data-theme="light"\]\[data-accent="(roxo_coral|limao|roxo_vermelho|azul_cinza|rosa_vermelho|azul_vermelho|lava)"\] body\{background:radial/g)||[]).length===7&&(W.match(/html\[data-theme="light"\]\[data-accent="(roxo_coral|limao|roxo_vermelho|azul_cinza|rosa_vermelho|azul_vermelho|lava)"\]\{background:#f3efe4\}/g)||[]).length===7);
/* 5) canvas PDF pela I.A */
T('8. iaSend gera o PDF na hora (item nasce com .pdf + geradoEm)', W.includes("if(novo.tipo==='pdf'){try{novo.pdf=iaCanPdfBytes(novo.titulo,novo.texto||'');novo.geradoEm=nowLabel();}catch(e){}}"));
T('9. canvas: botão «PDF pronto» aparece quando existe', W.includes("$('btnIaCanBaixar').style.display=c.pdf?'':'none';")&&W.includes('id="btnIaCanBaixar"')&&W.includes("Uint8Array.from(c.pdf,ch=>ch.charCodeAt(0)&0xff)"));
T('10. mensagem do chat anuncia PDF pronto', W.includes("pronto:!!novo.pdf")&&W.includes("Criei o PDF «"));
/* 6) Fênix I.A na cliente */
T('11. painel «Fênix I.A» no espaço da cliente', CL.includes("sec('iac','💛 Fênix I.A',")&&CL.includes('Pergunte à Fênix I.A'));
T('12. worker: guarda de assunto (só dados dela)', WK.includes('Fale APENAS de assuntos relacionados a esta cliente')&&WK.includes('recuse com gentileza em 1 frase'));
T('13. cliente: aviso de cota amigável no chat', CL.includes("o.j.code==='cota'?o.j.message:null"));
/* 7) intactos */
T('14. R81 intacta: 14 temas + cotas + aceite', W.includes('const FX_TEMAS={')&&W.includes('id="termosAceite"')&&WK.includes('const IA_COTAS={chat:100,post:30,doc:30,rel:30,cliente:30};'));
T('15. canvas/biblioteca/I.A leitura intactos', W.includes('class="ia-arq" type="button" data-canabrir=')&&W.includes('SOMENTE LEITURA')&&W.includes('function iaCanPdfBytes'));
T('16. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
T('17. JS clients válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(CL)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){return false}})());
T('18. worker sintaxe ok', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
