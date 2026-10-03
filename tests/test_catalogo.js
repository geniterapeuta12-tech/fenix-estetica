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
console.log('— Entrar no modo Catálogo —');
ev(`entrarLocal({nome:'Clínica Teste'},'teste')`);
d.getElementById('btnModo').click();
d.querySelector('.mode-opt[data-mode="catalogo"]').click();
ok(ev(`state.mode`)==='catalogo','Modo Catálogo ativado');
ok(!d.getElementById('navCatalogo').classList.contains('hidden'),'Lateral do Catálogo visível');
ok(d.querySelectorAll('#navCatalogo .navbtn').length===1,'SEM abas — item único na lateral');
ok(d.getElementById('catTitle').textContent==='Catálogo','Título da lista: Catálogo');
ok(d.getElementById('catList').textContent.includes('Nenhum item'),'Estado vazio');

console.log('— Criar item SEM preço (vira procedimento) —');
d.getElementById('fabCat').click();
ok(!d.getElementById('viewCatEd').classList.contains('hidden'),'Editor aberto');
ok(d.getElementById('catTipo')===null,'SEM seletor de tipo (fixo procedimento)');
d.getElementById('catNome').value='Sérum Vitamina C';fire(d.getElementById('catNome'),'input');
d.getElementById('btnCatSave').click();
ok(d.getElementById('catMsg').textContent.includes('salvo'),'Salvo sem preço');
ok(ev(`getCat().length`)===1,'Persistido em DB.cat');
ok(JSON.parse(w.localStorage.getItem('fk_cat_teste')).length===1,'localStorage (sync → catalogo_itens)');
ok(ev(`getCat()[0].preco`)===null,'preco = null (sem preço)');
ok(ev(`getCat()[0].tipo`)==='procedimento','tipo gravado: procedimento');
d.getElementById('btnCatBack').click();
ok(!d.getElementById('viewCatalogo').classList.contains('hidden'),'Voltou pra lista');
let li=d.querySelector('#catList .clickable');
ok(li.textContent.includes('Sérum Vitamina C'),'Item na lista');
ok(li.querySelector('.shpreco').textContent.includes('—'),'Sem preço mostra — (vitrine)');

console.log('— Criar item COM preço —');
d.getElementById('fabCat').click();
d.getElementById('catNome').value='Limpeza de Pele';fire(d.getElementById('catNome'),'input');
d.getElementById('catPreco').value='180,00';fire(d.getElementById('catPreco'),'input');
d.getElementById('catDescr').value='Dura ~60 min';fire(d.getElementById('catDescr'),'input');
d.getElementById('btnCatSave').click();
ok(ev(`getCat().length`)===2&&ev(`getCat()[0].preco`)===180,'Preço parseado (180)');
ok(ev(`dbCat(getCat()[0]).preco`)===180&&ev(`mapCat(dbCat(getCat()[0])).preco`)===180,'mapCat/dbCat preservam preço');
d.getElementById('btnCatBack').click();
li=d.querySelector('#catList .clickable');
ok(li.textContent.includes('Limpeza de Pele')&&li.textContent.includes('R$'),'Procedimento com preço em R$');
ok(li.querySelector('.shpreco').textContent.includes('R$'),'Preço direto no card (vitrine)');

console.log('— Lista única mostra tudo —');
ok(d.getElementById('catCount').textContent.includes('2 item'),'Lista única: 2 itens');
ok(d.querySelector('#catList').textContent.includes('Sérum')&&d.querySelector('#catList').textContent.includes('Limpeza'),'Todos os itens juntos');

console.log('— Busca —');
d.getElementById('fabCat').click();
d.getElementById('catNome').value='Protetor Solar FPS 50';fire(d.getElementById('catNome'),'input');
d.getElementById('btnCatSave').click();
d.getElementById('btnCatBack').click();
d.getElementById('catSearch').value='solar';fire(d.getElementById('catSearch'),'input');
ok(d.querySelectorAll('#catList .clickable').length===1&&d.querySelector('#catList').textContent.includes('Protetor'),'Busca filtra');
ok(d.getElementById('catCount').textContent.includes('busca ativa'),'Contador mostra busca ativa');
d.getElementById('catSearch').value='';fire(d.getElementById('catSearch'),'input');
ok(d.querySelectorAll('#catList .clickable').length===3,'Busca limpa restaura (3 itens)');

console.log('— Editar item (adicionar preço depois) —');
[...d.querySelectorAll('#catList .clickable')].find(x=>x.textContent.includes('Sérum')).click();
ok(!!d.getElementById('viewCatEd')&&!d.getElementById('viewCatEd').classList.contains('hidden'),'Editar abre');
ok(d.getElementById('catNome').value==='Sérum Vitamina C','Carregado');
d.getElementById('catPreco').value='89,90';fire(d.getElementById('catPreco'),'input');
d.getElementById('btnCatSave').click();
ok(ev(`getCat().find(x=>x.nome==='Sérum Vitamina C').preco`)===89.9,'Preço adicionado na edição');
d.getElementById('btnCatBack').click();
ok([...d.querySelectorAll('#catList .badge')].some(b=>b.textContent==='R$ 89,90'||b.textContent.includes('89,9')),'Badge atualizado');

console.log('— Validações —');
d.getElementById('fabCat').click();
d.getElementById('btnCatSave').click();
ok(d.getElementById('catMsg').className.includes('err'),'Sem nome → erro');
d.getElementById('catNome').value='Xyz Teste';fire(d.getElementById('catNome'),'input');
d.getElementById('catPreco').value='abc';fire(d.getElementById('catPreco'),'input');
d.getElementById('btnCatSave').click();
ok(d.getElementById('catMsg').textContent.includes('inválido'),'Preço inválido → erro');
d.getElementById('btnCatBack').click();

console.log('— Exclusão —');
const del=d.querySelector('#catList [data-act="delcat"]');del.click();del.click();
ok(ev(`getCat().length`)===2,'Exclusão ok (2 restantes)');

console.log('— BUG CRÍTICO: catálogo não vaza em outras áreas —');
ev(`setMode('gestao')`);
ok(d.getElementById('viewCatalogo').classList.contains('hidden'),'viewCatalogo ESCONDIDA na Gestão');
ok(d.getElementById('viewCatEd').classList.contains('hidden'),'viewCatEd escondida na Gestão');
ok(d.getElementById('catSearch').offsetParent===null,'Barra de busca do catálogo some (offsetParent null)');
ok(!d.getElementById('viewInicio').classList.contains('hidden'),'Início visível normalmente');
ev(`setMode('studio')`);
ok(d.getElementById('viewCatalogo').classList.contains('hidden'),'escondida no Studio');
ev(`setMode('dados')`);
ok(d.getElementById('viewCatalogo').classList.contains('hidden'),'escondida em Dados');
ev(`setMode('equipe')`);
ok(d.getElementById('viewCatalogo').classList.contains('hidden'),'escondida em Equipe');
ev(`setMode('catalogo')`);
ok(!d.getElementById('viewCatalogo').classList.contains('hidden'),'e volta visível no Catálogo');

console.log('— Backup e não-interferência —');
ok(Object.keys(ev(`snapshotData()`)).includes('cat'),'snapshotData contém cat');
ok(ev(`renderBackupSummary()||$('backupSummary').textContent`).includes('catálogo'),'Resumo de Dados cita catálogo');
ev(`setMode('gestao')`);
ok(ev(`getPkg().length`)===0&&ev(`getFin().length`)===0,'Catálogo não tocou em pacotes/financeiro (funções separadas)');
ok(ev(`MODES.catalogo.desc`)==='Itens, kits e prontos da clínica','Descrição do modo atualizada');

console.log('\nRESULTADO: '+pass+' passaram, '+fail+' falharam');
process.exit(fail?1:0);
}catch(e){console.error('ERRO NO TESTE:',e);process.exit(2);}},300);
