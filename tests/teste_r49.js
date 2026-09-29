
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:[],error:null});},delete(){return {lt:async()=>({error:null})};},insert(){return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true,ctabs:null}];DB.usu=[{id:'u2',nome:'Joana',username:'joana'}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300)); // binds diferidos
// ===== FUNÇÕES EXTRAS com Roleta como função =====
w.eval("setMode('gestao');showView('extras')");
T('1. Funções Extras mostra a Roleta como função (cartão)', (()=>{const b=d.getElementById('rolOpen');return !!b&&b.classList.contains('fncard')&&!d.getElementById('viewExtras').classList.contains('hidden');})());
d.getElementById('rolOpen').click();
T('2. clicar no cartão abre a Roleta', !d.getElementById('viewRoleta').classList.contains('hidden'));
// ===== ROLETA DE NÚMEROS =====
w.eval("(function(){const R=getRol();R.ps.push({id:'rl1',nome:'Sorteio',itens:[],img:null,ts:Date.now()});setRol(R);state.rolId='rl1';renderRoleta();})()");
const kindNom=()=>w.eval("(function(){const R=getRol();const rr=R.ps.find(x=>x.id==='rl1');return rr?String(rr.tipo||'nomes'):'?';})()");
T('3. roleta nova começa em NOMES', kindNom()==='nomes');
d.querySelector('#rolKind [data-rolkind="numeros"]').click();
T('4. alternou para NÚMEROS (e salva na roleta)', kindNom()==='numeros' && !d.getElementById('rolTxtRow').classList.contains('hidden'));
w.eval("(function(){document.getElementById('rolItNome').value='17';document.getElementById('rolAdd').click();})()");
w.eval("(function(){document.getElementById('rolItNome').value='23';document.getElementById('rolAdd').click();})()");
T('5. adiciona números (17, 23)', w.eval("(function(){const R=getRol();const rr=R.ps.find(x=>x.id==='rl1');return rr.itens.map(i=>i.nome).join(',');})()")==='17,23');
w.eval("(function(){document.getElementById('rolItNome').value='abc';document.getElementById('rolAdd').click();})()");
T('6. nome é BLOQUEADO no modo números', w.eval("(function(){const R=getRol();return R.ps.find(x=>x.id==='rl1').itens.length;})()")===2 && d.getElementById('rolMsg2').textContent.includes('número'));
// importar .txt
const FileC=w.File;const f=new FileC(['premios:\n5\n12\n30,5\n101'],'numeros.txt',{type:'text/plain'});
const inp=d.getElementById('rolTxt');
Object.defineProperty(inp,'files',{value:[f],configurable:true});
inp.dispatchEvent(new w.Event('change',{bubbles:true}));
await new Promise(r=>setTimeout(r,200));
T('7. importou números de arquivo .txt (5,12,30.5,101)', w.eval("(function(){const R=getRol();return R.ps.find(x=>x.id==='rl1').itens.map(i=>i.nome).join(',');})()")==='17,23,5,12,30.5,101');
w.eval("(function(){document.getElementById('rolSpin').click();})()");
await new Promise(r=>setTimeout(r,4800));
T('8. sorteio entre os números dá um dos deles', (()=>{const r=d.getElementById('rolRes').textContent;const m=r.match(/Deu: <b>([^<]+)<\/b>/)||r.match(/Deu:\s*([^\s!]+)/);if(!m)return false;return ['17','23','5','12','30.5','101'].includes(String(m[1]));})());
// ===== NOTIFICAÇÃO de mensagem fora da área =====
w.eval("setMode('gestao');showView('clientes')");
d.getElementById('notiWrap').innerHTML='';
w.eval("notiMsgs([{id:'m1',de:'Joana',para:'Fatima Dono',texto:'oi, tudo bem?',ts:Date.now()}])");
T('9. mensagem chegando fora da área cria notificação', d.querySelectorAll('#notiWrap .noti').length===1 && d.querySelector('#notiWrap .noti b').textContent==='Joana');
d.querySelector('#notiWrap .noti').click();
T('10. toque na notificação abre a conversa (equipe + peer)', w.eval("state.mode")==='equipe' && w.eval("MSG.peer")==='Joana' && w.eval("document.getElementById('chatWrap').className").includes('open'));
// ===== POSIÇÃO das notificações =====
w.eval("notiApply('bl')");
T('11. posição muda (dataset + storage + botão atual)', w.document.documentElement.dataset.notipos==='bl' && w.eval("localStorage.getItem('fenix_notipos')")==='bl' && d.querySelector('#notiOpts [data-notipos="bl"]').classList.contains('current'));
T('12. padrão é direita·em cima (tr)', (()=>{w.eval("localStorage.removeItem('fenix_notipos')");return w.eval("notiPos()")==='tr';})());
// ===== PERSONALIZAR FÊNIX CLIENTS v2 =====
w.eval("setMode('gestao');showView('clientes');openPers('c1')");
T('13. modal de personalizar abre com cor e mensagem', !!d.getElementById('persTopMsg') && d.querySelectorAll('#persCors .mode-opt').length===4);
d.querySelector('.persChk[value="res"]').checked=true;
d.querySelector('.persChk[value="pac"]').checked=true;
d.querySelectorAll('.persChk').forEach(ch=>{if(ch.value!=='res'&&ch.value!=='pac')ch.checked=false;});
d.querySelector('#persCors [data-cor="#1f9e6e"]').click();
d.getElementById('persTopMsg').value='Bem-vinda, Ana! 💛';
d.getElementById('persSave').click();
T('14. salvou objeto {abas, cor, msg} (mínimo 1 aba)', (()=>{const c=w.eval("(function(){const l=getCli();const c=l.find(x=>x.id==='c1');return JSON.stringify(c.ctabs);})()");const o=JSON.parse(c);return o.abas.join(',')==='res,pac'&&o.cor==='#1f9e6e'&&o.msg.includes('Bem-vinda');})());
T('15. persNorm lê formato antigo (array) e novo (objeto/string)', w.eval("persNorm(['res','doc']).abas.join(',')")==='res,doc' && (()=>{w.__s=JSON.stringify({abas:['ses'],cor:'#111',msg:'oi'});return w.eval("persNorm(window.__s).cor")==='#111'&&w.eval("persNorm(window.__s).abas.join(',')")==='ses';})());
// ===== FUNDO (zoom) =====
T('16. fundo do html cobre a tela no zoom (CSS presente)', html.includes('html{background:#000') && html.includes('html[data-theme="light"]{background:#f3efe4}'));
// ===== APP DA CLIENTE (clients/index.html) =====
const ch=fs.readFileSync('/home/user/clients/index.html','utf-8');
const payload={cliente:{nome:'Ana Lima',ctabs:{abas:['res','pag'],cor:'#1f9e6e',msg:'Bem-vinda, Ana!'}},clinica:'Clinica Teste',pago_total:0,pacotes:[],proximas:[],realizadas:[],pagamentos:[]};
const stub=('<scr'+'ipt>window.fetch=function(){return Promise.resolve({ok:true,json:function(){return Promise.resolve(PAY);}});};</scr'+'ipt>').replace('PAY',JSON.stringify(payload));
const domC=new JSDOM(stub+ch,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/clients/index.html?cli=abc'});
await new Promise(r=>setTimeout(r,500));
const dc=domC.window.document;
await new Promise(r=>setTimeout(r,200));
T('17. app da cliente: só as abas escolhidas (res, pag)', !!dc.getElementById('f-res') && !!dc.getElementById('f-pag') && !dc.getElementById('f-ses') && !dc.getElementById('f-doc'));
T('18. app da cliente: cor personalizada aplicada', domC.window.document.documentElement.style.getPropertyValue('--acc')==='#1f9e6e');
T('19. app da cliente: mensagem no topo', !!dc.getElementById('fcMsgTop') && dc.getElementById('fcMsgTop').textContent.includes('Bem-vinda'));
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (19/19)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
