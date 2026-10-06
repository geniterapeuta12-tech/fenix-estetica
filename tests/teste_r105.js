/* R105 — vendas do catálogo = transações de verdade (ver/editar/remover + status honesto QUITADO/EM ABERTO) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.82 + versao.json R105 (5 melhorias)', W.includes("APP_VERSAO='1.6.82'")&&VJ.versao==='1.6.82'&&VJ.r==='R108'&&VJ.melhorias.length===5);
T('2. finCliCat com status REAL (fim da etiqueta verde de mentira) + Receber ali', W.includes('const falta=finFalta(f); /* R105 — status REAL')&&!W.includes('entrada do catálogo')&&W.includes('⏳ Em aberto · falta \'+fmtBRL(falta)+\'')&&W.includes('✓ Quitado</span>'));
T('3. 🗑 da aba Catálogo e das Vendas do catálogo AGORA funcionam', W.includes("bindDel('cliCatList',getFin,setFin")&&W.includes("bindDel('quemList',getFin,setFin"));
T('4. finRows marca venda do catálogo (cat + pago) — «Venda do catálogo» no financeiro geral', W.includes("cat:finEhCat(t)||undefined")&&W.includes("'Venda do catálogo':(t.tipo==='in'?'Entrada manual':'Saída manual')"));
T('5. saldo HONESTO: pendente não conta como recebido (renderFin + renderStats)', (W.match(/r\.cat\?\(r\.pago!=null\?Math\.min\(r\.pago,r\.valor\):r\.valor\):r\.valor/g)||[]).length===2);
T('6. finList: etiqueta Quitado/Em aberto + editar/catálogo nas vendas', W.includes("(r.cat?(Number(r.pago||0)>=r.valor?'<span class=\"badge b-green\">✓ Quitado</span>':'<span class=\"badge b-gold\">⏳ Em aberto</span>'):'')"));
T('7. Vendas do catálogo: header novo + EDITAR e REMOVER em cada venda (quemList)', W.includes('<h3>Vendas do catálogo</h3>')&&(W.match(/title="Editar venda \/ valor pago"/g)||[]).length>=2&&(W.match(/title="Apagar \(2 toques\)"/g)||[]).length>=2);
T('8. R103/R104 intactos (nasce pendente + repinta sozinha)', W.includes('const pago=(isFinite(pgV)&&pgV>0)?Math.min(Math.round(pgV*100)/100,valor):0;')&&W.includes('function sellPollRemoto()')&&W.includes('function openFinPay('));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
