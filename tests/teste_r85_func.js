/* R85 — funcional (jsdom): vender do catálogo no pacote → editar valor pago → CONTA no financeiro */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
/* NOTA: fmtBRL do app usa ESPAÇO NÃO-QUEBRÁVEL (R$\u00a0) — nunca comparar dinheiro renderizado com literal "R$ "; sempre usar fmtBRL via ev(). */
let ok=0,fail=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(c)ok++;else fail++;};
(async()=>{
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{url:'https://fenix.local/',runScripts:'dangerously',resources:'usable',pretendToBeVisual:true});
const w=dom.window;
await new Promise(r=>{w.addEventListener('load',r);setTimeout(r,9000);});
const ev=c=>w.eval(c);
await new Promise(r=>setTimeout(r,1500)); /* boot assíncrono assenta (sem corrida de render) */
/* semeia: cliente + pacote de R$ 300 + 2 itens de catálogo */
ev("(function(){const cli={id:'c-t1',nome:'Maria Teste',tel:'3199999-0000',criadoEm:'hoje'};setCli([cli].concat(getCli()));"+
"const pk={id:'p-t1',clientId:'c-t1',nome:'Pacote Detox',valor:300,sessoes:4,criadoEm:'hoje',itens:[]};setPkg([pk].concat(getPkg()));"+
"const i1={id:'i-1',tipo:'produto',nome:'Kit Acelera',descr:'',preco:49.9,foto:null};"+
"const i2={id:'i-2',tipo:'procedimento',nome:'Massagem modeladora',descr:'',preco:120,foto:null};"+
"setCat([i1,i2].concat(getCat()));state.clientId='c-t1';state.pacoteId='p-t1';state.psub='catalogo';})()");
/* 1. venda pela MODAL real do catálogo (mesma que o dono usa) */
ev("openSellModal('pacote:p-t1');sellSel.add('i:i-1');sellSel.add('i:i-2');sellTouched=true;$('sellValor').value='150,00';$('sellDesc').value='kit promocional de 4';$('sellData').value=todayISO();$('btnSellOk').click()");
const finCat=ev("getFin().filter(f=>f.origem==='cat')");
T('1. venda registrada como lançamento de catálogo (origem cat)', finCat.length===1);
T('2. venda vinculada ao PACOTE certo (link tipo pacote + cliente)', ev("JSON.stringify(getFin().find(f=>f.origem==='cat').link)")==='{"tipo":"pacote","id":"p-t1","clientId":"c-t1"}');
T('3. valor salvo = 150', ev("getFin().find(f=>f.origem==='cat').valor")===150);
/* 2. conta no financeiro do PACOTE */
ev("(function(){try{renderPacote();}catch(e){console.log('  (renderPacote THROW: '+e.message+')');}})()");
const meta=String(ev("document.getElementById('pkgMeta').textContent"));
T('4. «Pago» do pacote agora inclui o catálogo (R$ 150,00)', meta.includes('Pago: '+ev("fmtBRL(150)")));
T('5. mostra o desglose «(catálogo: R$ 150,00)»', meta.includes('(catálogo: '+ev("fmtBRL(150)")+')'));
T('6. «Em aberto» desconta o catálogo (300−150=R$ 150,00)', meta.includes('Em aberto: '+ev("fmtBRL(150)")));
/* 3. botão EDITAR na lista do catálogo do pacote */
T('7. lista do catálogo do pacote tem botão de editar valor pago', String(ev("document.getElementById('pkgCatList').innerHTML")).includes('data-act="finedit"'));
/* 4. EDITAR o valor pago pela modal real */
ev("(function(){const f=getFin().find(f=>f.origem==='cat');openEditFin(f.id);})()");
T('8. modal de edição abre com o valor atual preenchido', !ev("document.getElementById('editFinModal').classList.contains('hidden')")&&String(ev("document.getElementById('efValor').value"))==='150');
ev("$('efValor').value='250,00';$('btnEfOk').click()");
T('9. valor pago editado para 250 e salvo', ev("getFin().find(f=>f.origem==='cat').valor")===250);
ev("(function(){try{renderPacote();}catch(e){console.log('  (renderPacote THROW: '+e.message+')');}})()");
T('10. «Pago» do pacote reflete a edição (R$ 250,00)', String(ev("document.getElementById('pkgMeta').textContent")).includes('Pago: '+ev("fmtBRL(250)")));
/* 5. totais da CLIENTE contam o catálogo */
const t=ev("JSON.stringify(cliTotals('c-t1'))");
T('11. cliente: total 550 (300 pacote + 250 catálogo) · pago 250 · em aberto 300', t==='{"total":550,"paid":250,"saldo":300}');
/* 6. catálogo da cliente também com editar */
ev("(function(){try{renderCatCli(state.clientId);}catch(e){console.log('  (renderCatCli THROW: '+e.message+')');}})()");
T('12. lista do catálogo da cliente tem botão de editar', String(ev("document.getElementById('cliCatList').innerHTML")).includes('data-act="finedit"'));
/* 7. financeiro geral lista a venda com editar (kind man) */
ev("renderFin()");
T('13. aba Financeiro geral mostra a venda do catálogo', String(ev("document.getElementById('finList').innerHTML")).includes('kit promocional de 4'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/13)'));
w.close();process.exit(fail?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
