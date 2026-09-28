
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:DBMENS.map(x=>Object.assign({},x)),error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){DBMENS.push(Array.isArray(r)?r[0]:r);return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
// ============ APP PRINCIPAL ============
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true}];DB.form=[{id:'f1',titulo:'Anamnese Facial',descr:'',qs:[{id:'q1',tipo:'curto',texto:'Tem alergia?',obr:true},{id:'q2',tipo:'curto',texto:'Rotina de skincare',obr:false}],criadoEm:'',atualizadoEm:'',ts:1,token:''}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
// —— remoção dash/plangest
T('1. barra da Gestão com 6 botões (sem Dashboard/Planilha)', d.querySelectorAll('#navGestao .navbtn').length===6);
T('2. Pastas CONTINUA na barra', !!d.querySelector('#navGestao [data-view="pastas"]'));
T('3. viewDash/viewPlangest não existem mais', !d.getElementById('viewDash')&&!d.getElementById('viewPlangest'));
// —— anamnese na cliente
w.eval("setMode('gestao');openClient('c1');openSub('anamnese');");
T('4. menu da cliente tem Anamnese', !!d.querySelector('#menuCliente li[data-sub="anamnese"]'));
T('5. área Anamnese abre listando o formulário', !d.getElementById('cliAnamnese').classList.contains('hidden') && d.getElementById('anaCliForms').textContent.includes('Anamnese Facial'));
T('6. sem resposta ainda · botão Preencher', d.getElementById('anaCliForms').textContent.includes('sem resposta') && !!d.querySelector('[data-anafill="f1"]'));
d.querySelector('[data-anafill="f1"]').click();
T('7. preencher abre com as perguntas (obrigatória marcada)', !d.getElementById('anaCliFill').classList.contains('hidden') && !!d.querySelector('#anaCliQs [data-qid="q1"]') && d.getElementById('anaCliFillTt').textContent.includes('Anamnese Facial'));
d.querySelector('#anaCliQs [data-qid="q1"]').value='Não, nenhuma';
d.querySelector('#anaCliQs [data-qid="q2"]').value='USA vitamina C';
d.getElementById('anaCliSave').click();
T('8. salva com pessoa = nome da cliente', w.eval(`getResp().length===1 && getResp()[0].pessoa==='Ana Lima' && getResp()[0].vals.length===2`));
T('9. dup bloqueado com aviso', (()=>{d.querySelector('[data-anafill="f1"]').click();d.querySelector('#anaCliQs [data-qid="q1"]').value='x';d.getElementById('anaCliSave').click();return d.getElementById('anaCliMsg2').textContent.includes('já tem resposta');})());
T('10. contador no menu atualizou (1 resposta)', d.getElementById('mAna').textContent.includes('1 resposta'));
// —— personalizar (clínica)
w.eval("setMode('clients');");
T('11. botão Personalizar no card da cliente', !!d.querySelector('[data-cpers="c1"]'));
d.querySelector('[data-cpers="c1"]').click();
T('12. modal abre com as 5 abas', !d.getElementById('persModal').classList.contains('hidden') && d.querySelectorAll('.persChk').length===5);
d.querySelectorAll('.persChk').forEach(ch=>ch.checked=false);
d.getElementById('persSave').click();
T('13. NÃO salva com nada marcado (erro orienta)', d.getElementById('persMsg').textContent.includes('pelo menos uma'));
d.querySelector('.persChk[value="res"]').checked=true;
d.querySelector('.persChk[value="pag"]').checked=true;
d.getElementById('persSave').click();
T('14. salva ctabs na cliente (res+pag)', w.eval(`(getCli()[0].ctabs||[]).join(',')`)==='res,pag');
// —— roleta (extras)
w.eval("setMode('extras');");
T('15. extras mostra botão Abrir Roleta', !!d.getElementById('rolOpen') && !d.getElementById('viewExtras').classList.contains('hidden'));
d.getElementById('rolOpen').click();
T('16. tela da Roleta abre', !d.getElementById('viewRoleta').classList.contains('hidden') && !!d.getElementById('rolNome'));
d.getElementById('rolNome').value='Brindes';
d.getElementById('rolNew').click();
T('17. roleta criada (card)', !!d.querySelector('#rolHomeList [data-rolabrir]'));
d.querySelector('#rolHomeList [data-rolabrir]').click();
['Ana','Bruno','Carla'].forEach(n=>{d.getElementById('rolItNome').value=n;d.getElementById('rolAdd').click();});
T('18. 3 nomes · roda desenha 3 fatias', d.querySelectorAll('#rolWheelBox svg path').length===3 && d.getElementById('rolChips').textContent.includes('Carla'));
T('19. campo de imagem no centro existe', !!d.getElementById('rolImg'));
d.getElementById('rolSpin').click();
T('20. girando (botão trava)', d.getElementById('rolSpin').disabled===true);
await new Promise(r=>setTimeout(r,4900));
T('21. resultado aparece com vencedor', /Deu:\s*<b>(Ana|Bruno|Carla)<\/b>/.test(d.getElementById('rolRes').innerHTML));
d.getElementById('rolBack').click();
T('22. voltar retorna ao extras', !d.getElementById('viewExtras').classList.contains('hidden'));
// ============ APP DA CLIENTE com ctabs ============
const cli=new JSDOM(fs.readFileSync(path.join('/home/user','clients','index.html'),'utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/#cli=t',beforeParse(x){x.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({cliente:{nome:'F',ctabs:['pac','ses']},clinica:'c',pacotes:[],proximas:[],realizadas:[],pagamentos:[],documentos:[]})});}});
await new Promise(r=>setTimeout(r,300));
const cd=cli.window.document;
T('23. app da cliente: abas Início/Pagamentos/Documentos ESCONDIDAS', cd.querySelector('[data-go="f-res"]').style.display==='none' && cd.querySelector('[data-go="f-pag"]').style.display==='none' && cd.querySelector('[data-go="f-doc"]').style.display==='none');
T('24. painéis: f-pac e f-ses presentes, f-res fora', !!cd.getElementById('f-pac') && !!cd.getElementById('f-ses') && !cd.getElementById('f-res'));
T('25. aba inicial virou Pacotes (não pode cair em aba proibida)', cd.querySelector('#fcTabs .tab.on').dataset.go==='f-pac');
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (25/25)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
