/* R84 — I.A com acesso REAL (contexto 30k + totais prontos) + multimodal + canvas SÓ da I.A */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.83 + versao.json R84 (5 melhorias)', W.includes("APP_VERSAO='1.6.83'")&&VJ.versao==='1.6.83'&&VJ.r==='R109'&&(VJ.melhorias||[]).length>=5);
/* acesso: contexto inteiro chega à I.A */
T('2. worker: contexto NÃO é mais cortado em 6.000 (30k)', WK.includes("slice(0,30000)")&&!WK.includes(".contexto||'').slice(0,6000)"));
T('3. worker: usa totais JÁ calculados (não soma lista — fim do número inventado)', WK.includes('JÁ VÊM CALCULADOS nos DADOS acima')&&WK.includes('NUNCA tente somar ou recalcular listas'));
T('4. worker: max_tokens 1200 (canvas inteiro + pensamento)', WK.includes('max_tokens:maxTokens||1200')&&!WK.includes('max_tokens:400'));
T('5. app: buildIaCtx lê DOCUMENTOS (título+cliente+trecho, 15 recentes)', W.includes('=== DOCUMENTOS (')&&W.includes('mais recentes) ===')&&W.includes("DB.doc.length"));
/* multimodal */
T('6. imagem no chat vira contexto do CÉREBRO (visão + acesso a tudo numa resposta)', W.includes('IMAGEM ANEXADA PELO DONO (descrição gerada por visão computacional')&&W.includes("body:JSON.stringify({modo:iaAgenteOn()?'agente':'',pergunta:perguntaFinal,contexto:ctx,historico:hist})"));
T('7. imagem: resposta vem do motor principal (com pensamento e canvas)', (function(){const i=W.indexOf('IMAGEM ANEXADA PELO DONO');const j=W.indexOf("pushMsg('ia',j2.resposta)");return i>0&&j<0;})());
/* canvas SÓ da I.A */
T('8. criação manual removida (botão, modal, popover Funções, Gerar PDF)', !W.includes('btnIaCanNovo')&&!W.includes('iaCanModal')&&!W.includes('btnIaCanCriar')&&!W.includes('btnIaCanCanc')&&!W.includes('btnIaFun')&&!W.includes('iaFunPop')&&!W.includes('btnIaCanPdf'));
T('9. Biblioteca + PDF pronto + edição salvos (o que a I.A cria continua tocável)', W.includes('id="btnIaCanBaixar"')&&W.includes('function canSave')&&W.includes('data-canabrir=')&&W.includes('function iaCanPdfBytes'));
/* intactos */
T('10. R81-R82 intactos (temas, cotas, aceite, fundo)', W.includes('const FX_TEMAS={')&&W.includes('id="termosAceite"')&&W.includes("const st=document.body?document.body.style:null;")&&WK.includes('const IA_COTAS={chat:100,post:30,doc:30,rel:30,cliente:30,agente:20};'));
T('11. FIFO cliente intacto (R82)', WK.includes('distribuição FIFO')||WK.includes('FIFO'));
T('12. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
T('13. worker sintaxe ok', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/13)'));
process.exit(fail?1:0);
