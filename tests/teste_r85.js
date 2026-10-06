/* R85 — catálogo do pacote: EDITAR valor pago + catálogo CONTA no financeiro */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.77 + versao.json R85 (4 melhorias)', W.includes("APP_VERSAO='1.6.77'")&&VJ.versao==='1.6.77'&&VJ.r==='R103'&&(VJ.melhorias||[]).length>=4);
/* helpers novos */
T('2. helpers catVendasPkg/catVendasCli existem (catálogo = dinheiro que entrou)', W.includes('const catVendasPkg=pid=>catDe(\'pacote\',pid).reduce((s,f)=>s+(Number(f.pago!=null?f.pago:f.valor)||0),0);')&&W.includes('const catVendasCli=cid=>getFin().filter(f=>f.origem===\'cat\'&&f.link&&f.link.clientId===cid).reduce((s,f)=>s+(Number(f.valor)||0),0);'));
/* conta no financeiro */
T('3. cliTotals: catálogo soma no total E no pago', W.includes('const catT=catVendasCli(id);')&&W.includes('return{total:t+avT+catT,paid,saldo:(t+avT+catT)-paid};};'));
T('4. badge do pacote na cliente conta catálogo', W.includes('const paid=pkgPays(p.id).reduce((s,x)=>s+x.valor,0)+catVendasPkg(p.id);'));
T('5. tela do pacote: Pago inclui catálogo e mostra «(catálogo: R$…)»', W.includes('const catPk=catVendasPkg(p.id);paid+=catPk;')&&W.includes("(catPk>0?(' (catálogo: '+fmtBRL(catPk)+')'):'')"));
T('6. rótulo do total da cliente menciona catálogo', W.includes('<span>Total (pacotes + avulsas + catálogo)</span>'));
/* editar valor pago */
T('7. Catálogo do pacote: botão editar (finedit) em cada venda', (W.match(/data-act="finedit"/g)||[]).length>=4&&W.includes('title="Editar valor pago"'));
T('8. modal de edição existente continua ligado (editFinModal + openEditFin)', W.includes('function openEditFin(id)')&&W.includes('id="editFinModal"')&&W.includes("e.target.closest('[data-act=\"finedit\"]')"));
T('9. salvar edição re-renderiza a cliente em qualquer sub (pacote/catálogo/financeiro)', W.includes("renderFin();renderStats();if(state.view==='cliente')renderCliente();});"));
/* venda nova continua pré-preenchida e editável */
T('10. modal de venda: valor auto-soma dos itens e continua editável (sellTouched)', W.includes("if(!sellTouched){$('sellValor').value=sm>0?String(sm.toFixed(2)).replace('.',','):'';")&&W.includes("$('sellValor').addEventListener('input',()=>{sellTouched=true;});"));
/* intactos */
T('11. Financeiro geral continua somando tudo (finRows pega getFin inteiro)', W.includes('getFin().forEach(t=>{const lk=t.link?finLinkLabel(t.link):\'\';'));
T('12. worker e Fênix I.A intocados nesta rodada (30k + totais prontos)', fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8').includes('slice(0,30000)'));
T('13. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/13)'));
process.exit(fail?1:0);
