/* R110 FUNC — Análise abre c/ resumo correto · finStatus/falta real · receber em antiga sugere total · soma automática na venda · edição antiga NÃO vira paga */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1"}},error:null}),signOut:async()=>{}},from:function(){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:[],error:null});},delete(){return {lt:async()=>({error:null}),in:async()=>({error:null})};},insert(){return {error:null};},update(){return {eq:async()=>({error:null})};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
const txt=el=>el.textContent.replace(/\u00A0/g,' ');
w.eval("try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));

/* semente: 1 cliente + catálogo com 2 itens + fin (antiga pago=null 15/08, venda quitada, gasto) */
w.eval("setCli([{id:'c1',nome:'Ana Souza',tel:'31 90000-0000'}]);");
w.eval("setCat([{id:'i1',tipo:'item',nome:'Limpeza de pele',preco:120},{id:'i2',tipo:'item',nome:'Peeling',preco:80}]);");
w.eval("setFin([{id:'f1',tipo:'in',desc:'Catálogo: Limpeza de pele',valor:120,pago:null,data:'2026-08-15',cat:1,clientId:'c1',kind:'man',origem:'cat'},{id:'f2',tipo:'in',desc:'Catálogo: Peeling',valor:80,pago:80,data:'2026-10-02',cat:1,clientId:'c1',kind:'man',origem:'cat'},{id:'f3',tipo:'out',desc:'Aluguel',valor:500,pago:500,data:'2026-10-01',kind:'man'}]);");
await new Promise(r=>setTimeout(r,200));

/* finStatus / falta real (unidade) */
T('1. finStatus: antiga=conferir · paga=quitado · parcial=aberto', w.eval("finStatus(getFin()[0])")==='conferir'&&w.eval("finStatus(getFin()[1])")==='quitado'&&w.eval("finStatus({valor:100,pago:30})")==='aberto');
T('2. finFaltaReal: antiga falta TUDO · quitada 0 · parcial o resto', w.eval("finFaltaReal(getFin()[0])")===120&&w.eval("finFaltaReal(getFin()[1])")===0&&w.eval("finFaltaReal({valor:100,pago:30})")===70);

/* abrir Financeiro da gestão e ver os botões */
w.eval("setMode('gestao');state.view='financeiro';renderApp();");
await new Promise(r=>setTimeout(r,300));
T('3. Financeiro da gestão aberto com «Análise» e «Análise I.A»', !d.getElementById('viewFinanceiro').classList.contains('hidden')&&!!d.getElementById('btnAnalise')&&!!d.getElementById('btnAnaliseIA'));

/* Análise: abre com Tudo ativo e resumo certo (recebido 200, gasto 500, pend 120) */
d.getElementById('btnAnalise').click();
await new Promise(r=>setTimeout(r,100));
const ab=d.getElementById('analiseBody');
T('4. modal Análise abriu (chip Tudo ativo)', !d.getElementById('analiseModal').classList.contains('hidden')&&!!d.querySelector('#analiseChips .chip.active'));
T('5. resumo: recebido R$ 200,00 · por receber R$ 120,00 · antiga como ⚠ conferir', txt(ab).includes('R$ 200,00')&&txt(ab).includes('R$ 120,00')&&txt(ab).includes('⚠ conferir se pagou'));
T('6. listas completas: pendência, gasto Aluguel, recebimento e quem mais comprou (Ana)', txt(ab).includes('Catálogo: Limpeza de pele')&&txt(ab).includes('Aluguel')&&txt(ab).includes('Ana Souza')&&txt(ab).includes('QUEM MAIS COMPROU'));
d.querySelector('[data-anper="d30"]').click();
await new Promise(r=>setTimeout(r,50));
T('7. chip «30 dias» troca o período (Aluguel 01/10 entra, antiga 15/08 sai)', d.querySelector('[data-anper="d30"]').classList.contains('active')&&txt(ab).includes('Aluguel')&&!txt(ab).includes('Catálogo: Limpeza de pele'));
d.getElementById('anClose').click();
T('8. fechar Análise esconde o modal', d.getElementById('analiseModal').classList.contains('hidden'));

/* Análise I.A: SEM nuvem (SB_TOKEN null) mostra erro amigável e NÃO abre */
d.getElementById('btnAnaliseIA').click();
await new Promise(r=>setTimeout(r,100));
T('9. Análise I.A sem nuvem: aviso claro, modal não abre', d.getElementById('iaAModal').classList.contains('hidden')&&txt(d.getElementById('finMsg')).length>10);

/* finpay numa ANTIGA: modal de receber sugere o TOTAL (falta real) */
w.eval("openFinPay('f1');");
await new Promise(r=>setTimeout(r,100));
T('10. «Receber» na antiga: sugerido = R$ 120,00 (falta de verdade)', Number(String(d.getElementById('fpValor').value).replace(',','.'))===120);
w.eval("$('finPayModal').classList.add('hidden');");

/* soma automática na janela de venda */
w.eval("openSellModalCat();");
await new Promise(r=>setTimeout(r,300));
const q1=()=>d.querySelector('#sellList [data-ref="i:i1"]');
const q2=()=>d.querySelector('#sellList [data-ref="i:i2"]');
T('11. janela de venda lista os itens do catálogo', !!q1()&&!!q2());
q1().click();await new Promise(r=>setTimeout(r,100));
T('12. clicou 1 item → valor vira a SOMA automática (120)', Number(String(d.getElementById('sellValor').value).replace(',','.'))===120);
q2().click();await new Promise(r=>setTimeout(r,100));
T('13. clicou 2 itens → soma atualiza (200)', Number(String(d.getElementById('sellValor').value).replace(',','.'))===200);
d.getElementById('sellValor').value='999';
d.getElementById('sellValor').dispatchEvent(new w.Event('input',{bubbles:true}));
q1().click();await new Promise(r=>setTimeout(r,100));
T('14. digitou por cima (999) → clicar em item NÃO apaga o digitado', Number(String(d.getElementById('sellValor').value).replace(',','.'))===999);
d.getElementById('btnSellSoma').click();
await new Promise(r=>setTimeout(r,100));
T('15. «↺ soma» volta a somar o que ficou marcado (Peeling = 80)', Number(String(d.getElementById('sellValor').value).replace(',','.'))===80);
w.eval("$('sellModal').classList.add('hidden');");

/* editar antiga SEM tocar no pago → continua ⚠ (não vira paga) */
w.eval("openEditFin('f1');");
await new Promise(r=>setTimeout(r,100));
T('16. editar antiga: valor pago mostra o total + dica de ⚠ CONFERIR', Number(String(d.getElementById('efPago').value).replace(',','.'))===120&&txt(d.getElementById('efDica')).includes('CONFERIR'));
d.getElementById('btnEfOk').click();
await new Promise(r=>setTimeout(r,200));
const depois=w.eval("getFin()[0]");
T('17. salvou sem mexer no pago → pago CONTINUA null (⚠ Conferir)', depois.pago===null&&depois.valor===120);

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (17/17)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
