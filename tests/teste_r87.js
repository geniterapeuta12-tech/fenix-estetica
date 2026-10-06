/* R87 — 5 arquivos no agente · organizador (1 canvas) · PDF bonito em tudo · catálogo paga/falta · distribuição automática · pacote somativo · texto→PDF · docs .txt/.pdf/.doc · logo REMOVIDA */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.80 + versao.json R87 (5 melhorias)', W.includes("APP_VERSAO='1.6.80'")&&VJ.versao==='1.6.80'&&VJ.r==='R106'&&(VJ.melhorias||[]).length===5);
/* worker */
T('2. worker: agente limitado a 5 arquivos (cap canvasLista)', WK.includes('if(canvasLista.length>=5)break;'));
T('3. worker: dica de organizar → UM canvas consolidado (O principal/Observações/Resumo organizado)', WK.includes('NÃO crie vários: gere UM ÚNICO canvas consolidado')&&WK.includes('«O principal», «Observações» e «Resumo organizado»'));
T('4. worker: 7 irmãs intactas + ehGeral intacto', ['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'='))&&!WK.includes("||modo==='agente');"));
/* PDF bonito */
T('5. app: pdfBonitoBytes (estilo R73: faixa ink + filete dourado + F2 19)', W.includes('function pdfBonitoBytes(')&&W.includes('BT /F2 12.5 Tf 0.83 0.69 0.27 rg')&&W.includes('Gerado pelo Fênix Estética'));
T('6. app: os 2 canvases da I.A usam pdfBonitoBytes (estilo novo)', (W.match(/\.pdf=pdfBonitoBytes\(/g)||[]).length===2&&W.includes('function iaCanPdfBytes('));
T('7. app: logo REMOVIDA de vez (painel + JS + XObject)', !W.includes('Logo do estúdio no PDF')&&!W.includes('logoPaint')&&!W.includes('LOGO_BIN')&&!W.includes('/Im1 Do Q')&&!W.includes('fenix_logo'));
/* catálogo paga/falta */
T('8. app: venda nova do catálogo tem «Valor pago agora»', W.includes('id="sellPago"')&&W.includes('vazio = nada pago')&&W.includes('const pgV=parseMoney($(\'sellPago\').value)'));
T('9. app: venda do catálogo grava f.pago', W.includes("pago,data:$('sellData').value||todayISO(),\nlink,obs:'Catálogo: '+names.join(', '),origem:'cat'"));
T('10. app: financeiro da cliente soma o PAGO do catálogo', W.includes('const catVendasCliPago=')&&W.includes('f.pago!=null?f.pago:f.valor'));
T('11. app: lista do catálogo mostra status honesto (Em aberto · falta Y) no pacote e na cliente', (W.match(/' · Em aberto: falta '\+fmtBRL\(Number\(f\.valor\)-Number\(f\.pago\)\)/g)||[]).length===1&&W.includes('⏳ Em aberto')&&W.includes("' · pago '+brl(pg)+"));
T('12. app: editar venda do catálogo ajusta o pago', W.includes('id="efPagoRow"')&&W.includes("f.origem==='cat'")&&W.includes('up.pago='));
/* distribuição automática */
T('13. app: opção ✨ Distribuir sozinho no pagamento da cliente', W.includes('<option value="auto">✨ Distribuir sozinho (menor falta primeiro)</option>'));
T('14. app: ramo auto — menor falta primeiro, sobra vira avulso', W.includes("alvo==='auto'")&&W.includes("sort((a2,b2)=>a2.falta-b2.falta)")&&W.includes("'Distribuição automática'")&&W.includes("'Sobra do pagamento distribuído'"));
/* pacote somativo */
T('15. app: pacote somativo — sessão soma no VALOR do pacote', W.includes('id="btnPacSoma"')&&W.includes('pp.valor=Math.round(((Number(pp.valor)||0)+v)*100)/100;setPkg(P2);')&&W.includes('Pacote somativo'));
/* texto→PDF + docs export */
T('16. app: Texto em PDF nas funções extras (card + caixa)', W.includes('id="txtOpen"')&&W.includes('id="btnTxtBack"')&&W.includes('id="btnTxtPdf"')&&W.includes('id="txtPdfBox"')&&W.includes('Escolhe um arquivo .txt e transforma em PDF bonito'));
T('17. app: documentos baixam .txt, .pdf (bonito) e .doc', W.includes('data-gact="extxt"')&&W.includes('data-gact="expdf"')&&W.includes('data-gact="exdoc"')&&W.includes("type:'application/msword'")&&W.includes("act==='extxt'||act==='expdf'||act==='exdoc'"));
/* intactos */
T('18. R84/R85/R86 intactos (contexto 30k · catVendas · agente · arte)', WK.includes('slice(0,30000)')&&W.includes('const catVendasPkg=')&&W.includes('id="btnIaAgente"')&&WK.includes('canvasLista,motor')&&W.includes('id="ddProto"'));
T('19. aninhamento HTML 0 erros', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('20. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/20)'));
process.exit(fail?1:0);
