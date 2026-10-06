/* R106 FUNC — vender DIRETO do Catálogo (cliente escolhida ali) + Organizador de perfil E2E + venda antiga vira EM ABERTO */
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
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true},{id:'c2',nome:'Bia Nunes',acesso:true}];DB.cat=[{id:'it1',tipo:'produto',nome:'Acelerador',preco:300,ts:1}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300));

/* ===== 1) VENDA DIRETO DO CATÁLOGO com cliente ESCOLHIDA ali ===== */
w.eval("setMode('catalogo');renderCat();");
d.getElementById('btnQuemNova').click();
T('1. botão «Nova venda» abriu o modal DIRETO do Catálogo', !d.getElementById('sellModal').classList.contains('hidden'));
T('2. seletor de CLIENTE visível com as 2 clientes', !d.getElementById('sellCliBox').classList.contains('hidden')&&d.getElementById('sellCli').options.length===2);
d.getElementById('sellCli').value='c2';
w.eval("sellVincPinta('cliente:','c2');");
d.querySelector('#sellList [data-ref="i:it1"]').click();
d.getElementById('sellValor').value='300,00';
d.getElementById('btnSellOk').click();
const fin=w.eval('getFin()');
T('3. venda registrada para a Bia (c2) SEM abrir a ficha dela', fin.length===1&&fin[0].link.clientId==='c2'&&fin[0].link.tipo==='cliente');
w.eval("renderCat();");
T('4. aparece nas Vendas do catálogo com o nome da Bia', txt(d.getElementById('quemList')).includes('Bia Nunes'));

/* ===== 2) ORGANIZADOR DE PERFIL (Studio) ===== */
w.eval("setMode('studio');state.sview='perfil';renderApp();");
T('5. view do Organizador abriu', !d.getElementById('viewPerfil').classList.contains('hidden')&&txt(d.getElementById('viewPerfil')).includes('Organizador de perfil'));
d.getElementById('btnPubNova').click();
d.getElementById('pubTipo').value='video';
d.getElementById('pubTitulo').value='Vídeo — dica de skincare';
d.getElementById('pubDescr').value='Mostrar o passo a passo com o Acelerador';
d.getElementById('pubData').value='2026-10-10';
d.getElementById('btnPubSalvar').click();
T('6. agendamento criado: 🎥 Vídeo · Programado · 10/10/2026', txt(d.getElementById('pubList')).includes('Vídeo — dica de skincare')&&txt(d.getElementById('pubList')).includes('⏳ Programado')&&txt(d.getElementById('pubList')).includes('10/10/2026'));
T('7. contador: 1 agendado(s) · próximo: 10/10/2026', txt(d.getElementById('pubCount')).includes('1 agendado(s)')&&txt(d.getElementById('pubCount')).includes('10/10/2026'));
d.querySelector('#pubList [data-act="pubok"]').click();
T('8. marcou como POSTADO (badge verde, sem botão de receber… digo, de concluir)', txt(d.getElementById('pubList')).includes('✓ Postado')&&!d.querySelector('#pubList [data-act="pubok"]'));
d.querySelector('#pubList [data-act="pubedit"]').click();
d.getElementById('pubTitulo').value='Vídeo — dica de skincare (v2)';
d.getElementById('btnPubSalvar').click();
T('9. editou o agendamento', txt(d.getElementById('pubList')).includes('(v2)'));
d.querySelector('#pubList .del').click();
d.querySelector('#pubList .del').click();
await new Promise(r=>setTimeout(r,100));
T('10. apagou o agendamento (2 toques)', w.eval('getPub().length')===0&&txt(d.getElementById('pubList')).includes('Nenhum vídeo ou post programado ainda'));

/* ===== 3) VENDA ANTIGA (legado pago=null) → EM ABERTO → receber ===== */
w.eval("DB.fin=[{id:'leg1',tipo:'in',desc:'Kit Glow (antiga)',valor:200,data:'01/09/2026',pago:null,link:{tipo:'cliente',id:'c1',clientId:'c1'},obs:'Catálogo: Kit Glow',origem:'cat'}];setMode('gestao');openClient('c1');state.view='cliente';state.sub='financeiro';renderCliente();");
T('11. venda antiga aparece com valor no financeiro (✓ Quitado · R$ 200,00)', txt(d.getElementById('finCliCat')).includes('✓ Quitado · R$ 200,00'));
d.querySelector('#finCliCat [data-act="finedit"]').click();
T('12. edição mostra a DICA da venda antiga', txt(d.getElementById('editFinModal')).includes('Venda antiga: está como PAGA'));
d.getElementById('efPago').value='';
d.getElementById('btnEfOk').click();
T('13. esvaziou o pago → EM ABERTO · falta R$ 200,00', txt(d.getElementById('finCliCat')).includes('⏳ Em aberto · falta R$ 200,00'));
d.querySelector('#finCliCat [data-act="finpay"]').click();
d.getElementById('fpValor').value='200';
d.getElementById('btnFpOk').click();
T('14. recebeu tudo → ✓ Quitado · R$ 200,00 de novo', txt(d.getElementById('finCliCat')).includes('✓ Quitado · R$ 200,00')&&Number(w.eval('getFin().find(x=>x.id==="leg1").pago'))===200);

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (14/14)');
process.exit(falhas?1:0);})().catch(e=>{console.error('ERRO:',e&&e.message);process.exit(1);});
