
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
/* stub supabase COM GRAVADOR: registra a cadeia de queries pra auditar msgPuxa */
html='<scr'+'ipt>window.__q=[];window.__rows=[];window.supabase={createClient:function(){const rec=(m,...a)=>{window.__q.push({m,args:a,ts:Date.now()});};const chain={select(...a){rec("select",...a);return chain;},eq(...a){rec("eq",...a);return chain;},gt(...a){rec("gt",...a);return chain;},gte(...a){rec("gte",...a);return chain;},lt(...a){rec("lt",...a);return chain;},order(...a){rec("order",...a);return chain;},limit(...a){rec("limit",...a);return chain;},delete(){rec("delete");return {lt(...a){rec("lt",...a);return {error:null};}};},insert(r){window.__inserido=r;return {error:null};},async then(res){rec("then");res({data:window.__rows.slice().sort((x,y)=>(Number(y.ts)||0)-(Number(x.ts)||0)),error:null});}};/* stub ordena desc como o servidor real */return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(){return chain;}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
w.eval("try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');setMode('gestao')");
await new Promise(r=>setTimeout(r,350));

// ===== R54.1 — MENSAGENS DA EQUIPE CHEGAM SEMPRE =====
w.eval("CLINIC_ID='c1';MSG.lastTs=0;window.__q=[];window.__rows=[{id:'a',de:'Pedro',para:'Fatima Dono',texto:'bom dia',ts:Date.now()-2000},{id:'b',de:'Joana',para:'Fatima Dono',texto:'tudo bem?',ts:Date.now()-500}];");
await w.eval("msgPuxa()");
T('1. 1ª carga traz as mensagens novas (não as antigas)', w.eval("MSG.rows.length")===2);
T('2. 1ª carga usa ordem DECRESCENTE limit 200 (pega as mais novas)', (()=>{const q=w.__q;const o=q.filter(x=>x.m==='order').pop();const l=q.filter(x=>x.m==='limit').pop();return o&&o.args[1]&&o.args[1].ascending===false&&l&&l.args[0]===200;})());
T('3. 1ª carga limita ao janelão de 24h (gt)', (()=>{const q=w.__q.filter(x=>x.m==='gt').shift();return q&&Math.abs(q.args[1]-(Date.now()-86400000))<60000;})());
T('4. lastTs avança p/ a mensagem mais nova', (()=>{const a=w.eval("MSG.lastTs"),b=w.eval("window.__rows[1].ts");if(a!==b)console.log('   [dbg4] lastTs=',a,'· esperado=',b,'· rows=',w.eval("JSON.stringify(MSG.rows.map(x=>x.id+':'+x.ts))"));return a===b;})());
// relógio atrasado: msg com ts "no passado" (4m50s) chega DEPOIS de b
w.eval("window.__q=[];window.__rows=[{id:'a',de:'Pedro',para:'Fatima Dono',texto:'bom dia',ts:Date.now()-2000},{id:'b',de:'Joana',para:'Fatima Dono',texto:'tudo bem?',ts:Date.now()-500},{id:'c',de:'Pedro',para:'Fatima Dono',texto:'chegou?',ts:Date.now()-290000}];");
await w.eval("msgPuxa()");
T('5. RELÓGIO ATRASADO: msg de 4m50s atrás chega (janela de 5min cobre)', (()=>{const r=w.eval("MSG.rows.map(x=>x.id).join(',')");if(r!=='a,b,c')console.log('   [dbg5] rows=',r,'· q=',JSON.stringify(w.__q.filter(x=>x.m==='gt'||x.m==='gte').map(x=>x.m+':'+Math.round((Date.now()-x.args[1])/1000)+'s')));return r==='a,b,c';})());
T('6. cursor usa gt com MARGEM (~5min atrás), não o lastTs seco', (()=>{const g=w.__q.filter(x=>x.m==='gt').pop();return g&&Math.abs(g.args[1]-(Date.now()-300000))<30000;})());
T('7. DEDUPE por id: a e b não duplicaram', w.eval("MSG.rows.filter(x=>x.id==='a').length")===1 && w.eval("MSG.rows.filter(x=>x.id==='b').length")===1);
T('8. TG_MARGEM=300000 definido', w.eval("TG_MARGEM")===300000);

// ===== R54.2 — RELATÓRIO DESFOCA TAMBÉM NO PC =====
T('9. blur do relatório é regra GLOBAL (única, fora do @media de celular)', (()=>{const n=html.split('#relBody.blur{filter:blur(10px);pointer-events:none;user-select:none}').length-1;return n===1&&html.includes('/* R54: global');})());
T('10. relatório nasce com .blur no HTML', html.includes('<div id="relBody" class="blur"'));

// ===== R54.3 — FIM DA BARRA CINZA DE ROLAGEM =====
T('11. scrollbar elegante no app (dourada fina, some no toque)', html.includes('rolagem elegante (fim da barra cinza)') && html.includes('@media(hover:none){*{scrollbar-width:none}') && html.includes('scrollbar-color:rgba(var(--glow-c),.32) transparent'));

// ===== R54.4 — APP DA CLIENTE: NADA SAI DO QUADRO =====
const cli=fs.readFileSync('/home/user/clients/index.html','utf-8');
T('12. cliente: números/textos quebram dentro do quadro (td max-width:0 + overflow-wrap)', cli.includes('td{max-width:0;overflow-wrap:anywhere;word-break:break-word}') && cli.includes('.panelcard{overflow-x:auto'));
T('13. cliente: scrollbar elegante também', cli.includes('rolagem elegante (fim da barra cinza)'));

// ===== R54.5 — PÁGINA DE MARCA (/center/) =====
const land=fs.readFileSync('/home/user/center/index.html','utf-8');
T('14. landing: hero com fênix, título Playfair e animação shine', land.includes('bem-vindo à fênix') && land.includes('@keyframes shine') && land.includes("Playfair+Display"));
T('15. landing: apresenta o Fênix Estética (6 funções)', (land.match(/class="feat rv"/g)||[]).length===6 && land.includes('Clientes') && land.includes('Relatórios'));
T('16. landing: seção do Fênix Center com destaque', land.includes('Conheça o <em>Fênix Center</em>') && land.includes('instala o app da clínica'));
T('17. landing: baixa SÓ o Center — APK e EXE (nada do Estética aqui)', land.includes('download/Fenix-Center.apk') && land.includes('download/Fenix-Center-Windows.zip') && land.indexOf('download/FENIX-Estetica')<0);
T('18. landing: selo tecnológico (versão ao vivo, assinado, sha-256)', land.includes('verTxt2') && land.includes('assinado oficialmente') && land.includes('sha-256'));
T('19. landing: passos 1-2-3 e reveal no scroll', (land.match(/class="step rv"/g)||[]).length===3 && land.includes('IntersectionObserver'));

// ===== R54.6 — LINK NO APP =====
T('20. link do Center no app aponta pra página de marca', html.includes('geniterapeuta12-tech.github.io/fenix-estetica/center/" target') || fs.readFileSync('/home/user/index.html','utf-8').includes('fenix-estetica/center/" target'));
T('21. versão 1.6.72 no app', w.eval("APP_VERSAO")==='1.6.72');

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (21/21)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
