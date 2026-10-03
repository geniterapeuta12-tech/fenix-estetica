const fs=require('fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('/home/user/tests/fenix-estetica.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://fenix.test/',pretendToBeVisual:true});
const w=dom.window,d=w.document;
const ev=s=>w.eval(s);
const fire=(el,t)=>el.dispatchEvent(new w.Event(t,{bubbles:true}));
let pass=0,fail=0;
const ok=(c,l)=>{if(c){pass++;console.log('  ✔ '+l);}else{fail++;console.log('  ✘ FALHOU: '+l);}};

setTimeout(()=>{try{
console.log('— Menus superiores funcionais (Studio) —');
ev(`entrarLocal({nome:'Clínica Aurora'},'dg')`);
// (usuModal removido no r7 — sem modal de usuário)
ev(`setMode('studio')`);
d.getElementById('btnNovoDoc').click();
ok(d.querySelectorAll('#gdMenu .gd-drop').length===3,'3 menus: Arquivo, Inserir, Ferramentas');
ok(d.querySelectorAll('#gdMenu .gd-mb').length===3,'Botões de menu');
ok(!d.querySelector('#gdMenu span')||d.querySelectorAll('#gdMenu > span').length===0,'Sem spans decorativos');
const mb=d.querySelector('.gd-mb');
mb.click();
ok(mb.parentElement.classList.contains('open'),'Menu abre ao clicar');
d.querySelector('[data-gact="salvar"]').click();
ok(d.querySelectorAll('.gd-drop.open').length===0,'Ação fecha o menu');
ok(ev(`getDoc().length`)===1,'Arquivo→Salvar salvou o rascunho');
d.getElementById('docTexto').focus();
d.querySelector('[data-gact="data"]').parentElement.parentElement.querySelector('.gd-mb').click();
d.querySelector('[data-gact="data"]').click();
ok(/\d{2}\/\d{2}\/\d{4}/.test(d.getElementById('docTexto').value),'Inserir→Data cai no texto');
d.querySelector('[data-gact="contar"]').parentElement.parentElement.querySelector('.gd-mb').click();
d.querySelector('[data-gact="contar"]').click();
ok(d.getElementById('docMsg').textContent.includes('palavra'),'Ferramentas→Contar mostra contagem');
d.querySelector('[data-gact="dup"]').parentElement.parentElement.querySelector('.gd-mb').click();
d.querySelector('[data-gact="dup"]').click();
ok(ev(`getDoc()[0].guias.length`)===2,'Ferramentas→Duplicar guia');
ok(ev(`getDoc()[0].guias[1].texto`)==='','Cópia nasce (nome com cópia)');
// excluir com confirm
w.confirm=()=>true;
ev(`docGuia=null;renderDocEd()`);
d.querySelector('[data-gact="excluir"]').parentElement.parentElement.querySelector('.gd-mb').click();
d.querySelector('[data-gact="excluir"]').click();
ok(ev(`getDoc().length`)===0,'Arquivo→Excluir apaga e volta');

/* ---------- GUIAS NA CLIENTE (editor unificado) ---------- */
console.log('— Editor com guias DENTRO da cliente —');
ev(`setMode('gestao')`);
ev(`getCli().unshift({id:'cx',nome:'Marina Duarte',criadoEm:'',ts:1});setCli(getCli().slice())`);
ev(`openClient('cx')`);
ok(!d.getElementById('viewDocEd').classList.contains('hidden')===false,'Editor fechado na cliente (antes)');
ev(`openSub('documentos')`);
d.getElementById('btnNovoDocCli').click();
ok(ev(`state.sub`)==='docEd'&&ev(`state.view`)==='cliente','Abre docEd na cliente');
ok(d.getElementById('viewCliente').classList.contains('hidden'),'View da cliente esconde');
ok(!d.getElementById('viewDocEd').classList.contains('hidden'),'Editor com GUIAS aparece NA CLIENTE');
ok(d.getElementById('docCli').value==='cx','Cliente pré-selecionada');
ok(ev(`computeTitle()`)==='Marina Duarte · Novo documento','Título c/ nome da cliente');
d.getElementById('docTitulo').value='Anamnese da Marina';
d.getElementById('docTexto').value='Dados iniciais da pele';
d.getElementById('btnDocSave').click();
ok(ev(`docById(state.docId).clientId`)==='cx','Salvo vinculado à cliente');
d.getElementById('btnGuiaAdd').click();
d.getElementById('docTexto').value='Histórico de procedimentos';
d.getElementById('btnDocSave').click();
ok(ev(`docById(state.docId).guias.length`)===2,'Guias funcionam na cliente');
ok(ev(`docById(state.docId).guias[1].texto`)==='Histórico de procedimentos','Texto da guia 2 salvo');
// reabrir pela lista da cliente
ev(`goBack();goBack()`);
ev(`openSub('documentos')`);
d.querySelector('#docCliList .clickable').click();
ok(!d.getElementById('viewDocEd').classList.contains('hidden'),'Reabrir documento da cliente → editor novo');
ok(d.getElementById('guiaList').children.length===2,'Guias carregadas na cliente');
ok(d.getElementById('docTexto').value==='Dados iniciais da pele','Texto da guia 1 recarregado');
// trocar de guia dentro da cliente
const g2=ev(`docById(state.docId).guias[1].id`);
d.querySelector('#guiaList .gd-guia[data-g="'+g2+'"]').click();
ok(d.getElementById('docTexto').value==='Histórico de procedimentos','Troca de guia na cliente preserva textos');
// autosave das guias: digitar, trocar, NÃO salvar → texto fica
ev(`docGuia=null;renderDocEd()`);
d.getElementById('docTexto').value='Dados iniciais da pele atualizados';
fire(d.getElementById('docTexto'),'input');
const g1=ev(`docById(state.docId).guias[0].id`);
d.querySelector('#guiaList .gd-guia[data-g="'+g1+'"]').click();
d.querySelector('#guiaList .gd-guia[data-g="'+g2+'"]').click();
ok(ev(`docById(state.docId).guias[0].texto`)==='Dados iniciais da pele atualizados','Autosave da guia ao trocar (sem apagar o que digitou)');
// voltar pra cliente
d.getElementById('btnDocBack').click();
ok(!d.getElementById('viewCliente').classList.contains('hidden'),'Voltar retorna pra cliente');
ok(ev(`state.sub`)!=='docEd','Saiu do editor');
console.log('RESULTADO: '+pass+' passaram, '+fail+' falharam');
process.exit(fail?1:0);
}catch(e){console.log('ERR',e&&e.message);process.exit(1);}},500);
