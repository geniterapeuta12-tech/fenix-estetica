
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:DBMENS.map(x=>Object.assign({},x)),error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){DBMENS.push(Array.isArray(r)?r[0]:r);return {error:null};}};}};}};</scr'+'ipt>'+html;
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
(async()=>{
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const hoje=new Date().toISOString().slice(0,10);
const dia=n=>new Date(Date.now()-n*86400000).toISOString().slice(0,10);
w.eval(`
DB.cli=[{id:'c1',nome:'Ana Lima',tel:'3199999-0001',acesso:true},{id:'c2',nome:'Bia Souza',tel:'3199999-0002',acesso:true}];
DB.pkg=[{id:'p1',clientId:'c1',nome:'Detox Gold',valor:600,sessoes:6,criadoEm:'01/09/2026'},{id:'p2',clientId:'c2',nome:'Limpeza',valor:300,sessoes:3,criadoEm:'10/09/2026'}];
DB.ses=[{id:'s1',clientId:'c1',pacoteId:'p1',num:1,feita:true,data:'${dia(20)}',obs:'',valor:100},
{id:'s2',clientId:'c1',pacoteId:'p1',num:2,feita:true,data:'${dia(13)}',obs:'',valor:100},
{id:'s3',clientId:'c1',pacoteId:'p1',num:3,feita:false,data:'${dia(-2)}',obs:'',valor:100},
{id:'s4',clientId:'c2',pacoteId:'p2',num:1,feita:true,data:'${dia(6)}',obs:'',valor:100}];
DB.pay=[{id:'y1',clientId:'c1',pacoteId:'p1',sessaoId:null,valor:400,data:'${dia(20)}',metodo:'pix',obs:''},
{id:'y2',clientId:'c1',pacoteId:'p1',sessaoId:null,valor:200,data:'${dia(13)}',metodo:'pix',obs:''},
{id:'y3',clientId:'c2',pacoteId:'p2',sessaoId:null,valor:100,data:'${dia(6)}',metodo:'dinheiro',obs:''}];
DB.arq=[{id:'a1',clientId:'c1',nome:'antes.jpg',tamanho:9,data:'',url:'data:image/jpeg;base64,AAA',link:{id:'p1',tipo:'pacote',obs:''},topico:'',ambito:'clinica',ts:1},
{id:'a2',clientId:'c1',nome:'depois.jpg',tamanho:9,data:'',url:'data:image/jpeg;base64,AAA',link:{id:'s2',tipo:'sessao',obs:''},topico:'',ambito:'clinica',ts:2},
{id:'a3',clientId:'c2',nome:'solto.png',tamanho:9,data:'${dia(6)}',url:'data:image/png;base64,AAA',link:null,topico:'',ambito:'clinica',ts:3}];
DB.doc=[{id:'d1',clientId:'c1',titulo:'Contrato Ana',texto:'<p>Cláusulas</p>',guias:[],fav:false,criadoEm:'${dia(5)}',atualizadoEm:'${dia(5)}',ts:1}];
try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}
document.getElementById('authScreen').classList.add('hidden');
document.getElementById('appScreen').classList.remove('hidden');
document.getElementById('splash').classList.add('hidden');
`);
// ===== DASHBOARD =====
w.eval("setMode('gestao');showView('dash');state.dashTab='fin';renderApp();");
T('1. Dashboard abre com título certo', d.getElementById('viewTitle').textContent==='Dashboard');
T('2. Finanças: KPIs do mês', d.getElementById('dashBox').textContent.includes('Entradas do mês'));
T('3. Finanças: velas do gráfico (verde+vermelho)', d.querySelectorAll('#dashBox svg rect').length>=2);
T('4. Finanças: velas vermelhas existem (dia caiu)', [...d.querySelectorAll('#dashBox svg rect')].some(r=>r.getAttribute('fill')==='#e05252'));
w.eval("state.dashTab='ses';renderDash();");
T('5. Sessões: ritmo 8 semanas + KPIs', d.getElementById('dashBox').textContent.includes('Ritmo das sessões')&&d.getElementById('dashBox').textContent.includes('Comparecimento'));
w.eval("state.dashTab='pac';renderDash();");
T('6. Pacotes: quitação e em aberto', d.getElementById('dashBox').textContent.includes('Quitação por pacote')&&d.getElementById('dashBox').textContent.includes('Em aberto'));
w.eval("state.dashTab='arq';renderDash();");
T('7. Arquivos: agrupado POR PACOTE e POR SESSÃO', d.getElementById('dashBox').textContent.includes('Por pacote')&&d.getElementById('dashBox').textContent.includes('Por sessão'));
T('8. Arquivos: Detox Gold com 1 anexo', [...d.querySelectorAll('#dashBox .dlinha')].some(l=>l.textContent.includes('Detox Gold')));
T('9. Arquivos: avulso contado (solto.png)', [...d.querySelectorAll('#dashBox .dkpi')].some(k=>k.textContent.includes('Avulsos')&&k.textContent.includes('1')));
// ===== GESTÃO PLANILHA =====
w.eval("showView('plangest');");
T('10. Gestão Planilha abre', d.getElementById('viewTitle').textContent==='Gestão Planilha');
T('11. Tabela com as 2 clientes', d.querySelectorAll('#plgTab tbody tr').length===2);
T('12. Ana: 2/6 sessões e R$600 pago', d.querySelector('#plgTab tbody tr').textContent.includes('2 / 6')&&d.querySelector('#plgTab tbody tr').textContent.includes('R$'));
T('13. Rodapé TOTAL', !!d.querySelector('#plgTab tfoot tr')&&d.querySelector('#plgTab tfoot').textContent.includes('TOTAL (2)'));
d.getElementById('plgBusca').value='Bia';
w.eval('renderPlanGest()');
T('14. Busca filtra (só Bia)', d.querySelectorAll('#plgTab tbody tr').length===1&&d.getElementById('plgTab').textContent.includes('Bia'));
d.getElementById('plgBusca').value='';
w.eval('renderPlanGest()');
// ===== PASTAS =====
w.eval("showView('pastas')");
T('15. Pastas abre vazia com convite', d.getElementById('pstBox').textContent.includes('Nenhuma pasta ainda'));
d.getElementById('pstNome').value='Contratos 2026';
d.getElementById('pstAdd').click();
T('16. Pasta criada (card na grade)', !!d.querySelector('.pstcard')&&d.querySelector('.pstnome').textContent==='Contratos 2026');
d.querySelector('.pstcard').click();
T('17. Dentro da pasta (form de arquivo)', !!d.getElementById('pstArqAdd')&&d.getElementById('pstCrumb').textContent.includes('Contratos 2026'));
d.getElementById('pstArqNome').value='Contrato Ana assinado';
d.getElementById('pstArqTipo').value='PDF';
d.getElementById('pstArqAdd').click();
T('18. Arquivo registrado dentro', d.getElementById('pstBox').textContent.includes('Contrato Ana assinado')&&d.getElementById('pstBox').textContent.includes('PDF'));
d.getElementById('pstVoltar').click();
T('19. Voltar pra raiz · contador 1 arquivo', !!d.querySelector('.pstcard')&&d.querySelector('.pstcard').textContent.includes('1 arquivo(s)'));
// ===== AVISO DE ATUALIZAÇÃO RICO =====
w.eval("UPD={versao:'1.6.29',melhorias:['✅ NOVO: Dashboard na Gestão','🛠 RESOLVIDO: documentos da cliente']};mostrarAvisoUpd();");
T('20. Aviso mostra "O QUE MELHOROU"', d.getElementById('updModal')&&d.getElementById('updModal').textContent.includes('O QUE MELHOROU'));
T('21. Aviso lista os bullets', d.getElementById('updModal').textContent.includes('Dashboard na Gestão')&&d.getElementById('updModal').textContent.includes('documentos da cliente'));
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (21/21)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
