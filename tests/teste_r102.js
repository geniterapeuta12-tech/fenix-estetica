/* R102 — Quem comprou + valor manual + correções do catálogo */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.85 + versao.json R102', W.includes("APP_VERSAO='1.6.85'")&&VJ.versao==='1.6.85'&&VJ.r==='R111');
T('2. «Quem comprou» na tela do Catálogo (lista + contagem + total)', W.includes('id="quemList"')&&W.includes('id="quemCount"')&&W.includes('<h3>Vendas do catálogo</h3>'));
T('3. renderQuem: mostra o PACOTE na venda + busca por cliente/item/pacote', W.includes("onde='pacote '+")&&W.includes("quemBusca\")&&$('quemBusca').addEventListener")===false&&W.includes("quemBusca")&&W.includes("function renderQuem()")&&W.includes("pg&&String(pg.nome||'').toLowerCase().includes(q)"));
T('4. renderCat chama renderQuem (sempre em sincronia)', W.includes("function renderCat(){\ntry{renderQuem();}catch(e){}"));
T('5. SOMA automática ao clicar + trava anti-apagar (R111: dono pediu a soma de volta; digitar trava · ↺ soma volta)', W.includes("sellAutoVal=auto;$('sellValor').value=auto;")&&W.includes("!==sellAutoVal)sellTouched=true")&&W.includes('NUNCA apaga')&&W.includes("sellTouched=false;sellRecalc()"));
T('6. dica da soma + label do pago explícita', W.includes('Soma da tabela: ')&&W.includes('Quanto a pessoa pagou agora (R$) — vazio = nada pago'));
T('7. criar item no modal preserva o digitado', W.includes("sellSel.add('i:'+it.id);paintSell();")&&!W.includes("sellSel.add('i:'+it.id);sellTouched=false;paintSell();"));
T('8. badge dupla da ficha corrigida (uma etiqueta só)', !W.includes("</div><span class=\"badge b-green\">'+((f.pago==null")&&W.includes("'>+</span>')")===false&&(W.match(/b-green">✓ Quitado/g)||[]).length===4);
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
