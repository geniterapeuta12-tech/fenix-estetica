/* Bateria funcional unificada (R35–R40) — persistente em tests/ */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'node_modules','jsdom'));
const RES=[];const T=(n,c)=>RES.push([n,!!c]);const P=n=>console.log('  '+(RES[RES.length-1][1]?'✓':'✗')+' '+n);
const TT=(n,c)=>{T(n,c);P(n);};
async function domApp(){const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});await new Promise(r=>{if(dom.window.document.readyState==='complete')return r();dom.window.addEventListener('load',r);setTimeout(r,4000);});return dom.window;}
(async()=>{
const w=await domApp();const ev=s=>{try{return w.eval(s);}catch(e){return 'THROW:'+e.message;}};
/* R35 — Uso */
TT('Uso: medidor 1º em Dados', w.document.querySelector('#navDados .navbtn')?.dataset.dsub==='uso');
/* R36 — cliente por abas + planilha */
const cli=new JSDOM(fs.readFileSync(path.join(__dirname,'..','clients','index.html'),'utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/#cli=t',beforeParse(x){x.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({cliente:{nome:'F'},clinica:'c',pacotes:[{nome:'p',valor:1,qtd:8,feitas:4,pago:0}],proximas:[],realizadas:[],pagamentos:[]})});}});
await new Promise(r=>setTimeout(r,200));
TT('cliente: abas (agora com Documentos), sem sidebar', !cli.window.document.querySelector('.side')&&cli.window.document.querySelectorAll('#fcTabs .tab').length===5);
TT('cliente: progresso real 4 de 8', (cli.window.document.getElementById('fcBody').textContent||'').includes('4 de 8'));
ev('PLNC.arq=[{nome:"G",cols:["A"],rows:[["1"],["2"]]}];plnSalva();PLNC.sel=null;renderPlanilha()');
ev('document.querySelector(\'[data-plnren="G"]\').click()');w.document.getElementById('plnRenInp').value='G2';
ev('document.querySelector(\'[data-plnrenok]\').click()');
TT('planilha: renomeia', ev('PLNC.arq.some(x=>x.nome==="G2")'));
/* R38 — senha do usuário */
ev('window.__u={username:"Kaleb S",nome:"Kaleb S",senha:encSenha("kaleb s","abc123")}');
TT('senha: maiúscula entra', ev('senhaOk(__u,"abc123")')===true);
TT('senha: errada barra', ev('senhaOk(__u,"xxx")')===false);
/* R39 — formulários/24h/Usuário */
ev('window.__est=JSON.stringify([{id:"q1"},{id:"q2"}])');
TT('formulário: estrutura texto → perguntas', ev('mapForm({id:"f",estrutura:__est}).qs.length')===2);
ev('MSG.rows=[{id:"m",de:"a",para:"b",texto:"x",ts:Date.now()-90000000}];renderEqMsgs()');
TT('mensagens: >24h some', ev('MSG.rows.length')===0);
/* R40 — arquivos */
TT('arquivos: link ::jsonb → objeto', JSON.stringify(ev('mapArq({id:"a",link:"{\\"id\\":\\"i\\",\\"tipo\\":\\"pacote\\"}::jsonb"}).link'))==='{"id":"i","tipo":"pacote","obs":""}');
TT('arquivos: foto data: vira thumb', ev('fileRow({id:"a",nome:"f.jpg",url:"data:image/jpeg;base64,AAA"}).includes("<img")'));
/* Revisão — sem vazamento */
ev('DB.usu=[{id:"u1",nome:"Kaleb Santiago"},{id:"u2",nome:"Maria Souza"}]');
let vazou=false;
for(const m of ['inicio','clientes','agenda','financeiro','studio','catalogo']){
  ev('setMode('+JSON.stringify(m)+')');
  if((w.document.getElementById('appScreen').textContent||'').includes('Maria Souza')){vazou=true;break;}
}
TT('revisão: nada vaza entre áreas', !vazou);
let ok=0;for(const[,c]of RES)if(c)ok++;
console.log('RESULTADO: '+ok+'/'+RES.length+(ok===RES.length?' ✓':' ✗'));
process.exit(ok===RES.length?0:1);
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1);});
