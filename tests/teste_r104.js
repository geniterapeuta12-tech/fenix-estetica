/* R104 — lista do modal de venda SEMPRE aparece (repinta sozinha + item podre não mata) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.78 + versao.json R104 (5 melhorias)', W.includes("APP_VERSAO='1.6.78'")&&VJ.versao==='1.6.78'&&VJ.r==='R104'&&VJ.melhorias.length===5);
T('2. paintSell blindado por item + «Recarregar lista» quando vazio', W.includes("catch(e){return '';}}).join('')||")&&W.includes('data-act="sellretry"')&&W.includes('Nenhum item apareceu ainda.'));
T('3. sellRepintaSeAberto chamada no pullRemote (dados chegaram → repinta)', W.includes('function sellRepintaSeAberto()')&&W.includes('try{sellRepintaSeAberto();}catch(e){}'));
T('4. poll sellPollRemoto ligado no openSellModal (nuvem lenta/sync pendente)', W.includes('function sellPollRemoto()')&&W.includes('sellPollN=0;sellPollRemoto();')&&W.includes('if(sellPollN>10)return;'));
T('5. syncAll termina → janela vazia aberta tenta puxar de novo', W.includes("if(_sm&&!_sm.classList.contains('hidden')&&!sellOpts().length)setTimeout(function(){try{pullRemote(false);}catch(e){}},300);"));
T('6. R103 intacto: venda nasce pendente + Receber pagamento', W.includes('const pago=(isFinite(pgV)&&pgV>0)?Math.min(Math.round(pgV*100)/100,valor):0;')&&W.includes('function openFinPay(')&&(W.match(/data-act="finpay"/g)||[]).length>=3);
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/6)'));
process.exit(fail?1:0);
