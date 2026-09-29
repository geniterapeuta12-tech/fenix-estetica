
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/index.html','utf-8');
html='<scr'+'ipt>window.supabase={createClient:function(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:function(){return{data:{unsubscribe:function(){}}}},signInWithPassword:async()=>({data:{user:{id:"u1",user_metadata:{nome:"Clinica Teste"}}},error:null}),signOut:async()=>{}},from:function(tb){return {select(){return this;},eq(){return this;},gt(){return this;},order(){return this;},limit(){return this;},async then(res){res({data:DBMENS.map(x=>Object.assign({},x)),error:null});},delete(){return {lt:async()=>({error:null})};},insert(r){DBMENS.push(Array.isArray(r)?r[0]:r);return {error:null};}};}};}};</scr'+'ipt>'+html;
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;
w.eval("DB.cli=[{id:'c1',nome:'Ana Lima',acesso:true}];DB.pkg=[{id:'p1',clientId:'c1',nome:'Detox Gold',valor:600,sessoes:4,criadoEm:'01/09/2026',itens:[]}];DB.ses=[{id:'s9',clientId:'c1',pacoteId:null,num:null,feita:false,data:'28/09/2026',obs:'avulsa teste',valor:100}];DB.cat=[{id:'it1',tipo:'produto',nome:'Máscara Ouro',descr:'',preco:80,foto:null,criadoEm:'',atualizadoEm:'',ts:1}];try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'x',nome:'Fatima Dono'}))}catch(e){}document.getElementById('authScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');document.getElementById('splash').classList.add('hidden');");
await new Promise(r=>setTimeout(r,300)); // aguarda binds diferidos da sidebar (setTimeout 0)
// ===== CATÁLOGO no PACOTE =====
w.eval("setMode('gestao');openClient('c1');state.view='cliente';state.sub='pacote';state.pacoteId='p1';state.psub='menu';renderCliente();");
T('1. menu do pacote tem Catálogo (contador)', !!d.querySelector('#menuPacote li[data-psub="catalogo"]'));
d.querySelector('#menuPacote li[data-psub="catalogo"]').click();
T('2. seção Catálogo do pacote abre vazia', !d.getElementById('pkgCatSec').classList.contains('hidden') && d.getElementById('pkgCatList').textContent.includes('Nenhuma venda'));
d.getElementById('btnPkgCatAdd').click();
T('3. modal de venda abre com vinculação PRÉ-SELECIONADA no pacote', !d.getElementById('sellModal').classList.contains('hidden') && d.getElementById('sellVinc').value==='pacote:p1');
// criar produto NA HORA
d.getElementById('btnSellNovo').click();
d.getElementById('snNome').value='Sérum Rosa';
d.getElementById('snPreco').value='45,90';
d.getElementById('btnSellNovoAdd').click();
T('4. item criado no catálogo e marcado na venda', w.eval(`getCat().some(x=>x.nome==='Sérum Rosa'&&x.preco===45.9)`) && d.getElementById('snMsg').textContent.includes('marcado'));
d.getElementById('btnSellOk').click();
const fin=w.eval('getFin()');
T('5. venda registrada com link PACOTE (cai no financeiro)', fin.length===1 && fin[0].origem==='cat' && fin[0].link.tipo==='pacote' && fin[0].link.id==='p1' && fin[0].link.clientId==='c1');
T('6. lista do pacote mostra a venda (com nome do item criado)', d.getElementById('pkgCatList').textContent.includes('Sérum Rosa'));
// ===== AVULSA =====
w.eval("state.psub='menu';renderCliente();openSub('pacotes');setAreaTab('av');state.openAv='s9';renderCliente();");
T('7. bloco Catálogo aparece na avulsa (vazio)', d.getElementById('avList').textContent.includes('Catálogo (0)'));
d.querySelector('[data-act="avcat"]').click();
T('8. venda da avulsa: vinculação pré na avulsa', d.getElementById('sellVinc').value==='avulsa:s9');
d.querySelector('#sellList li[data-ref="i:it1"]').click();
d.getElementById('btnSellOk').click();
T('9. venda vinculada à AVULSA registrada', w.eval(`catDe('avulsa','s9').length===1`));
w.eval("renderCliente()");
T('10. bloco Catálogo da avulsa agora mostra a venda', d.getElementById('avList').textContent.includes('Catálogo (1)'));
// ===== CLIENTE (fora do pacote) =====
w.eval("openSub('catalogo')");
T('11. aba Catálogo da cliente lista as 2 vendas com vínculos', d.getElementById('cliCatalogo')&&!d.getElementById('cliCatalogo').classList.contains('hidden') && d.getElementById('cliCatList').textContent.includes('Detox Gold') && d.getElementById('cliCatList').textContent.includes('sessão avulsa'));// ===== PASTAS REMOVIDA (R49) =====
T('12. Pastas foi REMOVIDA (não é modo, sem view e sem botão)', (()=>{const r=w.eval("Object.keys(MODES).indexOf('pastas')<0 && !document.getElementById('viewPastas') && !document.querySelector('#navGestao [data-view=\\'pastas\\']')");return r===true;})());
T('13. seletor de modos não tem Pastas (render ok)', (()=>{w.eval("renderModes()");return !d.querySelector('#modeList [data-mode="pastas"]');})());
T('14. DIVIDIR TELA saiu (sem modal, sem painel, sem botões)', !d.getElementById('abasModal') && !d.getElementById('splitPane') && !d.getElementById('btnSplit') && !d.getElementById('btnAbaSalvar'));
// ===== TERMOS =====
w.eval("setMode('dados');showDados('termos')");
T('15. Dados › Termos de uso abre (placeholder)', !d.getElementById('viewTermos').classList.contains('hidden') && d.getElementById('viewTitle').textContent==='Dados · Termos de uso');
// ===== ABAS SIMPLES (desktop) =====
w.eval("setMode('gestao');showView('clientes')");
await new Promise(r=>setTimeout(r,300)); // binds diferidos da sidebar
T('16. barra de Abas simples: chips + botão + (desktop)', !!d.getElementById('btnAbaAdd') && !!d.getElementById('abasChips') && !d.getElementById('abasBar').classList.contains('hidden'));
d.getElementById('btnAbaAdd').click();
T('17. + salva a tela atual como aba (chip com título)', d.querySelectorAll('#abasChips .aba-chip').length===1 && d.querySelector('#abasChips .aba-chip b').textContent.length>0);
w.eval("setMode('studio')");
d.querySelector('#abasChips .aba-chip').click();
T('18. clicar na aba abre a tela salva', w.eval("state.mode")==='gestao');
d.querySelector('#abasChips .aba-x').click();
T('19. × remove a aba', d.querySelectorAll('#abasChips .aba-chip').length===0);
// ===== CELULAR =====
const domM=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/',beforeParse(x){Object.defineProperty(x.navigator,'userAgent',{value:'Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/130 Mobile',configurable:true});}});
await new Promise(r=>setTimeout(r,300));
const wm=domM.window;
T('20. no CELULAR a barra de Abas não existe (escondida)', wm.document.getElementById('abasBar').classList.contains('hidden'));
console.log(falhas?('FALHAS: '+falhas):'TUDO OK (20/20)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
