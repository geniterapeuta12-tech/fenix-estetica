
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
const DBMENS=[];
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:DBMENS.map(x=>Object.assign({},x)),error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){DBMENS.push(Array.isArray(r)?r[0]:r);return {error:null};}};}};}};</scr'+'ipt>'+html;
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
(async()=>{
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');setMode('gestao');openClient('c1');openSub('pacotes');");
// ===== criar pacote COM itens, SEM valor total =====
d.getElementById('pkgNome').value='Protocolo Detox';
d.getElementById('pkgSess').value='4';
d.getElementById('pkgItTipo').value='procedimento';
d.getElementById('pkgItNome').value='Limpeza de pele';
d.getElementById('pkgItValor').value='150';
d.getElementById('pkgItAdd').click();
d.getElementById('pkgItTipo').value='produto';
d.getElementById('pkgItNome').value='Máscara vit C';
// sem preço
d.getElementById('pkgItAdd').click();
T('1. builder lista os 2 itens (🧖 e 🧴)', d.querySelectorAll('#pkgItList li').length===2 && d.getElementById('pkgItList').textContent.includes('Máscara vit C') && d.getElementById('pkgItList').textContent.includes('sem preço'));
T('2. soma mostra R$150 (só itens com preço)', d.getElementById('pkgItSoma').textContent.includes('150'));
d.getElementById('formPacote').querySelector('button[type=submit]').click();
const pk=w.eval('getPkg()');
T('3. pacote criado com valor SOMADO (150)', pk.length===1 && pk[0].valor===150);
T('4. pacote salva itens (procedimento + produto, um sem preço)', pk[0].itens.length===2 && pk[0].itens[1].tipo==='produto' && pk[0].itens[1].valor===0);
T('5. sessões numeradas criadas (4)', w.eval('getSes()').length===4);
T('6. mensagem menciona os itens', d.getElementById('pkgMsg').textContent.includes('2 item(ns)'));
T('7. card mostra chips dos itens', d.getElementById('pkgList').textContent.includes('🧴 Máscara vit C') && d.getElementById('pkgList').textContent.includes('Limpeza de pele'));
// ===== criar SEM valor e SEM itens → erro orientado =====
d.getElementById('pkgNome').value='Pacote sem preço';
d.getElementById('pkgSess').value='2';
d.getElementById('formPacote').querySelector('button[type=submit]').click();
T('8. sem valor e sem itens com preço → erro orienta', d.getElementById('pkgMsg').textContent.includes('OU adicione itens com preço'));
// ===== editar: prefill, tirar, adicionar, salvar =====
d.querySelector('#pkgList li.clickable').click();
w.eval("state.psub='menu';renderCliente();");
T('9. editar preenche os itens existentes', d.querySelectorAll('#epItList li').length===2);
d.querySelector('#epItList [data-itdel="0"]').click(); // tirar Limpeza (150)
T('10. item removido no rascunho', d.querySelectorAll('#epItList li').length===1);
d.getElementById('epItTipo').value='produto';
d.getElementById('epItNome').value='Sérum alegre';
d.getElementById('epItValor').value='90,50';
d.getElementById('epItAdd').click();
d.getElementById('epValor').value='';
d.getElementById('formEditPkg').querySelector('button[type=submit]').click();
const pk2=w.eval('getPkg()')[0];
T('11. editado: itens novos com preço certo (90,5) e soma aplicada', pk2.itens.length===2 && pk2.itens.some(x=>x.nome==='Sérum alegre' && x.valor===90.5) && pk2.valor===90.5);
console.log('   [debug pkgMeta]:',d.getElementById('pkgMeta').textContent);
T('12. pkgMeta mostra contagem de itens/produtos', d.getElementById('pkgMeta').textContent.includes('2 item(ns)') && d.getElementById('pkgMeta').textContent.includes('2 produto(s)'));
// ===== mapPacote lê string JSON da nuvem (rowOut) =====
T('13. mapPacote parses itens string JSON', w.eval(`mapPacote({id:'x9',cliente_id:'c1',nome:'P',valor:10,sessoes:1,criado_em:'',itens:'[{"nome":"Peeling","tipo":"procedimento","valor":200}]'}).itens[0].valor`)===200);
// ===== Gestão Planilha coluna Itens =====
w.eval("setMode('gestao');showView('plangest');");
T('14. planilha: coluna Itens no cabeçalho', d.getElementById('plgTab').textContent.includes('Itens'));
T('15. planilha: Ana com 2 itens', d.querySelector('#plgTab tbody tr').textContent.includes('2'));
// ===== app da cliente mostra chips (mock com itens) =====
const cli=new JSDOM(fs.readFileSync(path.join('/home/user','clients','index.html'),'utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/#cli=t',beforeParse(x){x.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({cliente:{nome:'F'},clinica:'c',pacotes:[{nome:'Detox',valor:150,qtd:4,feitas:1,pago:0,itens:[{nome:'Limpeza',tipo:'procedimento',valor:150},{nome:'Máscara',tipo:'produto',valor:0}]}],proximas:[],realizadas:[],pagamentos:[],documentos:[]})});}});
await new Promise(r=>setTimeout(r,250));
const capp=cli.window.document;
T('16. app da cliente: chips do conteúdo do pacote', capp.getElementById('fcBody').textContent.includes('🧖 Limpeza') && capp.getElementById('fcBody').textContent.includes('🧴 Máscara') && capp.getElementById('fcBody').textContent.includes('incluído'));
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (16/16)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
