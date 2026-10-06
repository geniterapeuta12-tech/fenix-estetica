/* R103 — catálogo nasce pendente (ir pagando) + modal de venda à prova de tudo */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.79 + versao.json R103 (5 melhorias)', W.includes("APP_VERSAO='1.6.79'")&&VJ.versao==='1.6.79'&&VJ.r==='R105'&&VJ.melhorias.length===5);
T('2. venda nasce PENDENTE: vazio = pago 0 (nada quitado automático)', W.includes('const pago=(isFinite(pgV)&&pgV>0)?Math.min(Math.round(pgV*100)/100,valor):0;')&&!W.includes('pgV<valor)?Math.round(pgV*100)/100:valor'));
T('3. label nova do pago na venda', W.includes('Quanto a pessoa pagou agora (R$) — vazio = nada pago (dá pra ir pagando depois)')&&!W.includes('vazio = pagou tudo'));
T('4. botão «Receber pagamento» (ir pagando) nas 3 listas', (W.match(/data-act="finpay"/g)||[]).length>=3&&W.includes('function openFinPay(')&&W.includes('id="finPayModal"')&&W.includes('btnFpTudo')&&W.includes('Quitar tudo'));
T('5. finFalta: legado pago=null é quitado; novo soma pagamentos', W.includes('function finFalta(f)')&&W.includes('(f&&f.pago==null)?v:')&&W.includes('const novo=Math.min(Math.round((antes+pg)*100)/100,v);'));
T('6. editar venda: esvaziar = nada pago; inalterado mantém o antigo', W.includes('up.pago=(isFinite(pg)&&pg>0)?Math.min(Math.round(pg*100)/100,valor):0;')&&W.includes('else up.pago=(f.pago!=null?Math.min(Number(f.pago)||0,valor):valor);')&&W.includes('vazio = nada pago (fica devendo)'));
T('7. modal de venda abre SEMPRE (blindagem total R103)', W.includes("try{$('sellModal').classList.remove('hidden');}catch(e){}")&&W.includes('try{paintSell();}catch(e)')&&W.includes('data-act="sellretry"')&&W.includes('⏳ Carregando catálogo da nuvem…'));
T('8. etiquetas de falta + re-pintura após pagamento', W.includes('⏳ falta '+ "'+fmtBRL(falta)"+"")||W.includes("⏳ Em aberto · falta '+fmtBRL(falta)")&&W.includes('try{renderQuem();}catch(e){}')&&W.includes('venda QUITADA'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
