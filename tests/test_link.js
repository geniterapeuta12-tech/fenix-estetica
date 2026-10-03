const fs=require('fs');
const {JSDOM}=require('jsdom');
function mkMock(forms){
 const db={formularios:forms||[],formulario_respostas:[]};
 function builder(table){
  const rows=db[table]||[];
  const st={op:'select',patch:null,row:null,filters:[]};
  const b={
   select(){st.op='select';return b;},
   update(p){st.op='update';st.patch=p;return b;},
   insert(r){st.op='insert';st.row=r;return b;},
   delete(){st.op='delete';return b;},
   eq(k,v){st.filters.push([k,v]);return b;},
   order(){return b;},limit(){return b;},
   maybeSingle:async()=>{
    if(st.op==='select'){
     const f=rows.find(r=>st.filters.every(([k,v])=>r[k]===v));
     return{data:f?{id:f.id,clinic_id:f.clinic_id,titulo:f.titulo,descr:f.descr,estrutura:f.estrutura}:null,error:null};}
    return{data:null,error:null};},
   single:async()=>({data:null,error:null}),
   then(res){
    if(st.op==='insert'){const nr=[].concat(st.row)[0];
     if(table==='formulario_respostas'&&db.formulario_respostas.some(x=>x.formulario_id===nr.formulario_id&&String(x.pessoa).trim().toLowerCase()===String(nr.pessoa).trim().toLowerCase())){
      res({data:null,error:{message:'Esta pessoa já respondeu este formulário.'}});return;}
     [].concat(st.row).forEach(r=>db[table].push(r));res({data:null,error:null});}
    else if(st.op==='update'){const t=rows.find(r=>st.filters.every(([k,v])=>r[k]===v));if(t)Object.assign(t,st.patch);res({data:null,error:null});}
    else if(st.op==='delete'){res({data:null,error:null});}
    else res({data:[],error:null});}
  };return b;}
 const client={auth:{getSession:async()=>({data:{session:null}}),
   onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}};}},
  from:builder};
 return{client,db};
}
function dom(url,forms){
 const mock=mkMock(forms);
 const d=new JSDOM(fs.readFileSync('/home/user/tests/fenix-estetica.html','utf8'),{
  runScripts:'dangerously',url,pretendToBeVisual:true,
  beforeParse(w){w.supabase={createClient:()=>mock.client};}});
 return{d,mock};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let pass=0,fail=0;
const ok=(c,l)=>{if(c){pass++;console.log('  ✔ '+l);}else{fail++;console.log('  ✘ FALHOU: '+l);}};

(async()=>{
console.log('— TESTE A: gerenciar link —');
{
 const FORM={id:'f-1',clinic_id:'cl-1',titulo:'Anamnese',descr:'',estrutura:[{id:'q1',tipo:'curto',texto:'Nome completo?',opcoes:[],obr:true}],criado_em:'',atualizado_em:'',ts:1,link_token:null};
 const {d,mock}=dom('https://fenix.test/',[FORM]);
 const w=d.window,ev=s=>w.eval(s);
 await sleep(600);
 ev(`entrarLocal({nome:'Clínica X'},'x')`);
 ev(`setMode('studio')`);
 ev(`[...document.querySelectorAll('#navStudio .navbtn')].find(b=>b.dataset.sview==='forms').click()`);
 ok(ev(`REMOTE`)===true,'Supabase (mock) ativo');
 ev(`setForm([{id:'f-1',titulo:'Anamnese',descr:'',qs:[{id:'q1',tipo:'curto',texto:'Nome completo?',opcoes:[],obr:true}],criadoEm:'',atualizadoEm:'',ts:1,token:''}])`);
 ev(`openRespList('${FORM.id}')`);
 w.document.getElementById('btnLink').click();
 ok(!w.document.getElementById('linkModal').classList.contains('hidden'),'Modal do link');
 w.document.getElementById('btnLinkGen').click();
 await sleep(80);
 const tok=mock.db.formularios[0].link_token;
 ok(!!tok&&tok.length>=20,'Token gravado');
 ok(w.document.getElementById('linkUrl').value==='https://fenix.test/#resp='+tok,'URL = app + #resp=token');
 w.document.getElementById('btnLinkRevoke').click();
 await sleep(80);
 ok(mock.db.formularios[0].link_token===null,'Desativar zera token');
 w.document.getElementById('btnLinkGen').click();
 await sleep(80);
 ok(mock.db.formularios[0].link_token&&mock.db.formularios[0].link_token!==tok,'Regenerar cria novo');
}

console.log('— TESTE B: pessoa responde pelo link —');
{
 const FORM={id:'f-9',clinic_id:'cl-9',titulo:'Anamnese Facial',descr:'Preencha com atenção',estrutura:[
  {id:'q1',tipo:'curto',texto:'Qual seu nome?',opcoes:[],obr:true},
  {id:'q2',tipo:'longo',texto:'Histórico',opcoes:[],obr:false},
  {id:'q3',tipo:'sel',texto:'Tipo de pele',opcoes:['Oleosa','Seca'],obr:false}],criado_em:'',atualizado_em:'',ts:1,link_token:'TOK123'};
 const {d,mock}=dom('https://fenix.test/#resp=TOK123',[FORM]);
 const w=d.window;
 await sleep(700);
 ok(!w.document.getElementById('publicResp').classList.contains('hidden'),'Tela pública sem login');
 ok(w.document.querySelectorAll('#pubQs .qcard').length===3,'3 perguntas');
 ok(!!w.document.querySelector('#pubQs textarea'),'Longa = textarea no público');
 ok(!!w.document.querySelector('#pubQs select'),'Seletiva = dropdown no público');
 w.document.getElementById('pubPessoa').value='Carlos Souza';
 w.document.querySelector('[data-pub-qid="q1"]').value='Carlos Souza';
 w.document.querySelector('[data-pub-qid="q2"]').value='Histórico de acne';
 w.document.querySelector('[data-pub-qid="q3"]').value='Oleosa';
 w.document.getElementById('btnPubSend').click();
 await sleep(80);
 ok(w.document.getElementById('pubQs').textContent.includes('Resposta enviada'),'Confirmação');
 const saved=mock.db.formulario_respostas[0];
 ok(saved&&saved.pessoa==='Carlos Souza'&&saved.respostas.length===3,'3 respostas gravadas');
 ok(saved.respostas[2].valor==='Oleosa','Seletiva salva');
 console.log('  — duplicada pública —');
 w.document.getElementById('pubAgain').click();
 await sleep(100);
 w.document.getElementById('pubPessoa').value='Carlos Souza';
 w.document.querySelector('[data-pub-qid="q1"]').value='Carlos Souza';
 w.document.getElementById('btnPubSend').click();
 await sleep(80);
 ok(w.document.getElementById('pubMsg').textContent.includes('já respondeu'),'Duplicada bloqueada');
 ok(mock.db.formulario_respostas.length===1,'Sem segunda gravação');
}

console.log('— TESTE C: link inválido —');
{
 const {d}=dom('https://fenix.test/#resp=EXPIRADO',[{id:'f-1',clinic_id:'c',titulo:'T',descr:'',estrutura:[],criado_em:'',atualizado_em:'',ts:1,link_token:'OUTRO'}]);
 const w=d.window;
 await sleep(700);
 ok(w.document.getElementById('pubHead').textContent.includes('inválido'),'Mensagem de inválido');
}

console.log('\nRESULTADO: '+pass+' passaram, '+fail+' falharam');
process.exit(fail?1:0);
})().catch(e=>{console.error('ERRO:',e);process.exit(2)});
