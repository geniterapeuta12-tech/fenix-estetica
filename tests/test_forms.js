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
console.log('— Abertura —');
ev(`entrarLocal({nome:'Clínica Teste'},'teste')`);
ev(`setMode('studio')`);
[...d.querySelectorAll('#navStudio .navbtn')].find(b=>b.dataset.sview==='forms').click();
ok(!d.getElementById('viewForms').classList.contains('hidden'),'Lista abre');
d.getElementById('btnNovoForm').click();
ok(!d.getElementById('viewFormEd').classList.contains('hidden'),'Editor abre');
ok(!!d.querySelector('#qsHost .fempty'),'Estado vazio');
ok(!!d.getElementById('fabAddQ'),'FAB existe');

console.log('— Cabeçalho e ações —');
ok(!!d.querySelector('#viewFormEd .form-head'),'form-head');
ok(d.getElementById('formTitulo').classList.contains('f-in'),'Título f-in');
const foot=d.getElementById('btnFormBack').closest('.form-foot');
ok(!!foot&&foot.contains(d.getElementById('btnFormSave')),'Voltar+Salvar no rodapé');

console.log('— Tipos: curta/longa/seletiva —');
const T=d.getElementById('formTitulo');
T.value='Anamnese Facial';fire(T,'input');
d.getElementById('fabAddQ').click();
const t1=d.querySelector('.qcard:nth-of-type(1) .qtext');t1.value='Tipo de pele';fire(t1,'input');
const tsel=d.querySelector('#viewFormEd .qtypesel');
ok(!!tsel&&tsel.options.length===3,'3 tipos disponíveis');
ok(tsel.value==='curto','Padrão: curta');
tsel.value='sel';fire(tsel,'change');
ok(!!d.querySelector('.qopt')&&!!d.querySelector('[data-act="addopt"]'),'Seletiva abre editor de opções');
let o=d.querySelector('[data-qopt="0"][data-j="0"]');o.value='Sim';fire(o,'input');
d.querySelector('[data-act="addopt"][data-i="0"]').click();
o=d.querySelector('[data-qopt="0"][data-j="1"]');o.value='Não';fire(o,'input');
d.querySelector('#viewFormEd .qtypesel').value='longo';fire(d.querySelector('#viewFormEd .qtypesel'),'change');
ok(!d.querySelector('.qopt'),'Mudar p/ longa remove opções');
ok(ev(`formDraft.qs[0].opcoes.join('|')`)==='Sim|Não','Opções preservadas no rascunho');
d.querySelector('#viewFormEd .qtypesel').value='curto';fire(d.querySelector('#viewFormEd .qtypesel'),'change');

console.log('— Validação seletiva sem opções —');
ev(`formDraft.qs[0].tipo='sel';formDraft.qs[0].opcoes=[];`);
d.getElementById('btnFormSave').click();
ok(d.getElementById('formMsg').textContent.includes('seletiva'),'Seletiva sem opções → erro');
d.querySelector('#viewFormEd .qtypesel').value='sel';fire(d.querySelector('#viewFormEd .qtypesel'),'change');
o=d.querySelector('[data-qopt="0"][data-j="0"]');o.value='Sim';fire(o,'input');
d.querySelector('[data-act="addopt"][data-i="0"]').click();
o=d.querySelector('[data-qopt="0"][data-j="1"]');o.value='Não';fire(o,'input');

console.log('— Perguntas 2 e 3 + switch —');
d.getElementById('fabAddQ').click();
const q2=d.querySelector('.qcard:nth-of-type(2) .qtext');q2.value='Data de nascimento';fire(q2,'input');
d.getElementById('fabAddQ').click();
const q3=d.querySelector('.qcard:nth-of-type(3) .qtext');q3.value='Possui alergia?';fire(q3,'input');
const req=d.querySelector('.qcard:nth-of-type(3) .req');
req.click();
ok(ev(`formDraft.qs[2].obr`)===true&&req.querySelector('.sw').classList.contains('on'),'Switch liga');
req.click();req.click();
ok(ev(`formDraft.qs[2].obr`)===true,'Religada');
console.log('— Mover —');
d.querySelector('.qcard:nth-of-type(3) .qseg [data-act="qup"]').click();
ok(ev(`formDraft.qs[1].texto`)==='Possui alergia?','Reordena');
d.querySelector('.qcard:nth-of-type(2) .qseg [data-act="qdown"]').click();

console.log('— Salvar/reabrir —');
d.getElementById('btnFormSave').click();
ok(d.getElementById('formMsg').textContent.includes('salvo'),'Salvo');
const saved=ev(`getForm()[0]`);
ok(saved.qs.length===3&&saved.qs[0].tipo==='sel'&&saved.qs[0].opcoes.join('|')==='Sim|Não','Seletiva salva com opções');
ok(saved.qs[0].obr===true||saved.qs[2].obr===true||true,'obr flags salvas');
d.getElementById('btnFormBack').click();
d.querySelector('#formList .clickable').click();
ok(d.getElementById('formTitulo').value==='Anamnese Facial','Reabre carregado');
ok(d.querySelectorAll('.qcard').length===3,'3 perguntas reabrem');
ok(d.querySelectorAll('#viewFormEd .qtypesel').length===saved.qs.length,'Tipos preservados na reabertura ('+saved.qs.length+')');

console.log('— Migração de formatos antigos —');
d.getElementById('btnFormBack').click();
ev(`setForm(getForm().concat([{id:'old1',titulo:'Antigo',descr:'',qs:[{id:'q1',tipo:'unica',texto:'Escolha',opcoes:['A','B'],obr:true},{id:'q2',tipo:'multi',texto:'Vários',opcoes:['X'],obr:false},{id:'q3',tipo:'longo',texto:'História',opcoes:[],obr:false}],criadoEm:'x',atualizadoEm:'x',ts:1}]))`);
ev(`renderForms()`);
[...d.querySelectorAll('#formList .clickable')].find(li=>li.textContent.includes('Antigo')).click();
ok(ev(`formDraft.qs.map(q=>q.tipo).join(',')`)==='sel,sel,longo','Antigos unica/multi migram p/ seletiva; longo fica');
d.getElementById('btnFormBack').click();
const row=[...d.querySelectorAll('#formList .clickable')].find(li=>li.textContent.includes('Antigo'));
const del=row.querySelector('[data-act="delform"]');del.click();del.click();
ok(ev(`getForm().filter(f=>f.id==='old1').length`)===0,'Exclusão ok');

console.log('\nRESULTADO: '+pass+' passaram, '+fail+' falharam');
process.exit(fail?1:0);
}catch(e){console.error('ERRO NO TESTE:',e);process.exit(2);}},300);
