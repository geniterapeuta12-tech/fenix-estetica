/* R103 FUNC — catálogo nasce PENDENTE + ir pagando + modal à prova de tudo */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:[],error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;const txt=el=>el.textContent.replace(/\u00A0/g,' ');
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true}];DB.cat=[{id:'it1',tipo:'produto',nome:'Máscara Ouro',descr:'',preco:400,foto:null,criadoEm:'',atualizadoEm:'',ts:1}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));
w.eval("setMode('gestao');openClient('c1');state.view='cliente';state.sub='catalogo';renderCliente();");

/* ===== 1) venda com PAGO VAZIO → nasce PENDENTE (não quitada!) ===== */
d.getElementById('btnCliCatAdd').click();
T('1. modal de venda abriu pela ficha da cliente', !d.getElementById('sellModal').classList.contains('hidden'));
d.querySelector('#sellList [data-ref="i:it1"]').click();
d.getElementById('sellValor').value='400,00';
d.getElementById('sellPago').value='';
d.getElementById('btnSellOk').click();
let fin=w.eval('getFin()');
T('2. venda registrada com pago=0 (NÃO veio quitada)', fin.length===1&&fin[0].origem==='cat'&&Number(fin[0].pago)===0&&Number(fin[0].valor)===400);
T('3. ficha da cliente mostra «falta R$ 400,00» + botão Receber', txt(d.getElementById('cliCatList')).includes('falta R$ 400,00')&&!!d.querySelector('#cliCatList [data-act="finpay"]'));

/* ===== 2) ir pagando: entrada de 150 ===== */
d.querySelector('#cliCatList [data-act="finpay"]').click();
T('4. modal Receber pagamento abriu com a falta preenchida (400)', !d.getElementById('finPayModal').classList.contains('hidden')&&d.getElementById('fpValor').value==='400');
d.getElementById('fpValor').value='150,00';
d.getElementById('btnFpOk').click();
fin=w.eval('getFin()');
T('5. pago agora é 150 (parcial salvo)', Number(fin[0].pago)===150);
T('6. etiqueta «pago R$ 150,00 · falta R$ 250,00» na cliente', txt(d.getElementById('cliCatList')).includes('pago R$ 150,00')&&txt(d.getElementById('cliCatList')).includes('falta R$ 250,00'));

/* ===== 3) Quitar tudo ===== */
d.querySelector('#cliCatList [data-act="finpay"]').click();
d.getElementById('btnFpTudo').click();
T('7. «Quitar tudo» preencheu o que faltava (250)', d.getElementById('fpValor').value==='250');
d.getElementById('btnFpOk').click();
fin=w.eval('getFin()');
T('8. venda QUITADA: pago 400 de 400', Number(fin[0].pago)===400);
T('9. quitada: etiqueta verde e botão Receber SUMIU', txt(d.getElementById('cliCatList')).includes('✓ pago R$ 400,00')&&!d.querySelector('#cliCatList [data-act="finpay"]'));

/* ===== 4) blindagem: paintSell quebra → modal AINDA abre com «Tentar de novo» ===== */
w.eval("paintSell=function(){throw new Error('boom');};");
w.eval("openSellModal('cliente:');");
T('10. mesmo com a lista quebrando, o modal ABRE', !d.getElementById('sellModal').classList.contains('hidden'));
T('11. lista mostra aviso + botão Tentar de novo', d.getElementById('sellList').textContent.includes('Tentar de novo')&&!!d.querySelector('#sellList [data-act="sellretry"]'));
d.querySelector('#sellList [data-act="sellretry"]').click();
T('12. Tentar de novo reabriu sem erro', !d.getElementById('sellModal').classList.contains('hidden'));
d.getElementById('sellClose').click();
w.eval("paintSell=function(){const all=sellOpts();$('sellList').innerHTML=all.length?all.map(x=>'<li class=\"client\" data-ref=\"'+x.ref+'\">'+esc(x.nome)+'</li>').join(''):'<li class=\"empty\">Catálogo vazio.</li>';sellRecalc();};");

/* ===== 5) «Quem comprou»: pendente mostra falta + botão lá no Catálogo ===== */
w.eval("getFin()[0].pago=0;setFin(getFin().slice());setMode('catalogo');renderCat();");
T('13. «Quem comprou» mostra pendente com botão Receber', txt(d.getElementById('quemList')).includes('falta R$ 400,00')&&!!d.querySelector('#quemList [data-act="finpay"]'));
d.querySelector('#quemList [data-act="finpay"]').click();
d.getElementById('fpValor').value='100';
d.getElementById('btnFpOk').click();
T('14. pagamento pelo Catálogo salvou (pago=100) e repintou quemList', Number(w.eval('getFin()[0].pago'))===100&&txt(d.getElementById('quemList')).includes('R$ 100,00 de R$ 400,00'));

/* ===== 6) editar venda: esvaziar pago = devendo; inalterado mantém ===== */
w.eval("getFin()[0].pago=150;setFin(getFin().slice());openEditFin(getFin()[0].id);");
d.getElementById('efPago').value='';
d.getElementById('btnEfOk').click();
T('15. editar com pago VAZIO deixou devendo (pago=0)', Number(w.eval('getFin()[0].pago'))===0);
w.eval("getFin()[0].pago=150;setFin(getFin().slice());openEditFin(getFin()[0].id);");
d.getElementById('btnEfOk').click();
T('16. editar SEM mexer no pago manteve 150', Number(w.eval('getFin()[0].pago'))===150);

/* ===== 7) venda com entrada >= total nasce quitada ===== */
d.getElementById('btnCliCatAdd').click();
d.querySelector('#sellList [data-ref="i:it1"]').click();
d.getElementById('sellValor').value='400,00';
d.getElementById('sellPago').value='400,00';
d.getElementById('btnSellOk').click();
fin=w.eval('getFin()');
T('17. pagou tudo na hora = quitada (pago=valor)', fin.length===2&&Number(fin[0].pago)===400);
T('18. segunda venda quitada: sem botão Receber nela', d.getElementById('cliCatList').querySelectorAll('[data-act="finpay"]').length===1);

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (18/18)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
