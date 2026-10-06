/* R105 FUNC — o caso da FATIMA: venda não-paga aparece EM ABERTO (não quitada) e dá pra editar/remover/receber EM TODO LUGAR */
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
w.eval("DB.cli=[{id:'c1',nome:'Fatima Souza',acesso:true}];DB.cat=[{id:'it1',tipo:'produto',nome:'Acelerador',preco:300,ts:1}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));
w.eval("setMode('gestao');openClient('c1');state.view='cliente';state.sub='catalogo';renderCliente();");

/* a venda da Fatima: Acelerador 300, NÃO pagou (pago vazio) */
d.getElementById('btnCliCatAdd').click();
d.querySelector('#sellList [data-ref="i:it1"]').click();
d.getElementById('sellValor').value='300,00';
d.getElementById('btnSellOk').click();
const fin=w.eval('getFin()');

/* FINANCEIRO da cliente: status REAL */
w.eval("state.sub='financeiro';renderCliente();");
T('1. financeiro da cliente: venda NÃO-PAGA aparece EM ABERTO (não quitada!)', txt(d.getElementById('finCliCat')).includes('⏳ Em aberto · falta R$ 300,00')&&!d.getElementById('finCliCat').querySelector('.b-green'));
T('2. financeiro da cliente: tem Receber + Editar + Remover na venda', !!d.querySelector('#finCliCat [data-act="finpay"]')&&!!d.querySelector('#finCliCat [data-act="finedit"]')&&!!d.querySelector('#finCliCat .del'));

/* financeiro GERAL: identificada como venda do catálogo + saldo honesto */
w.eval("renderFin();renderStats();");
T('3. financeiro geral: aparece como «Venda do catálogo» com etiqueta Em aberto + editar/remover', txt(d.getElementById('finList')).includes('Venda do catálogo')&&txt(d.getElementById('finList')).includes('⏳ Em aberto')&&!!d.querySelector('#finList [data-act="finedit"]')&&!!d.querySelector('#finList .del'));
T('4. saldo HONESTO: nada recebido = soma R$ 0,00 (não 300!)', txt(d.getElementById('sumIn'))==='R$ 0,00'&&txt(d.getElementById('statSaldo'))==='R$ 0,00');

/* editar: colocar valor pago 150 (o que o dono não conseguia fazer) */
d.querySelector('#finCliCat [data-act="finedit"]').click();
T('5. editar abriu com o campo de valor pago', !d.getElementById('editFinModal').classList.contains('hidden')&&d.getElementById('efPagoRow')&&!d.getElementById('efPagoRow').classList.contains('hidden'));
d.getElementById('efPago').value='150';
d.getElementById('btnEfOk').click();
T('6. pago 150 salvo: «pago R$ 150,00 de R$ 300,00» + falta R$ 150,00', Number(w.eval('getFin()[0].pago'))===150&&txt(d.getElementById('finCliCat')).includes('pago R$ 150,00 de R$ 300,00')&&txt(d.getElementById('finCliCat')).includes('falta R$ 150,00'));
T('7. saldo agora soma SÓ o que entrou (150)', txt(d.getElementById('sumIn'))==='R$ 150,00');

/* receber + quitar */
d.querySelector('#finCliCat [data-act="finpay"]').click();
d.getElementById('fpValor').value='100';
d.getElementById('btnFpOk').click();
T('8. recebeu 100: falta R$ 50,00', Number(w.eval('getFin()[0].pago'))===250&&txt(d.getElementById('finCliCat')).includes('falta R$ 50,00'));
d.querySelector('#finCliCat [data-act="finpay"]').click();
d.getElementById('btnFpTudo').click();
d.getElementById('btnFpOk').click();
T('9. quitação: ✓ Quitado no financeiro da cliente', txt(d.getElementById('finCliCat')).includes('✓ Quitado')&&txt(d.getElementById('sumIn'))==='R$ 300,00');

/* REMOVER da aba Catálogo (o 🗑 morto) */
w.eval("state.sub='catalogo';renderCliente();");
d.querySelector('#cliCatList .del').click();
d.querySelector('#cliCatList .del').click();
await new Promise(r=>setTimeout(r,100));
T('10. 🗑 da aba Catálogo APAGOU de verdade (2 toques)', w.eval('getFin().length')===0&&txt(d.getElementById('cliCatList')).includes('Nenhuma venda do catálogo ainda'));

/* Vendas do catálogo: editar e remover direto lá */
w.eval("openSellModal('cliente:');");
d.querySelector('#sellList [data-ref="i:it1"]').click();
d.getElementById('sellValor').value='300,00';
d.getElementById('btnSellOk').click();
w.eval("setMode('catalogo');renderCat();");
T('11. «Vendas do catálogo» (ex-Quem comprou) tem Editar e Remover', !!d.querySelector('#quemList [data-act="finedit"]')&&!!d.querySelector('#quemList .del')&&d.getElementById('quemCount').textContent.includes('1 venda(s)'));
d.querySelector('#quemList .del').click();
d.querySelector('#quemList .del').click();
await new Promise(r=>setTimeout(r,100));
T('12. remover direto das Vendas do catálogo funcionou', w.eval('getFin().length')===0&&txt(d.getElementById('quemList')).includes('Ninguém comprou ainda'));

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (12/12)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
