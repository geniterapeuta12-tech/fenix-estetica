/* AUDITORIA DE ISOLAMENTO — nada de uma área aparece em outra. De uma vez por todas. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'node_modules','jsdom'));
(async()=>{
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,4000);});
const ev=s=>{try{return String(w.eval(s));}catch(e){return 'THROW:'+e.message;}};
const d=w.document;
/* ===== SEED realista em TODAS as coleções ===== */
ev(`
DB.usu=[{id:'u1',nome:'Kaleb Santiago'},{id:'u2',nome:'Maria Souza'}];
try{localStorage.setItem('fenix_user_ativo',JSON.stringify({id:'u1',nome:'Kaleb Santiago'}))}catch(e){}
DB.cli=[{id:'c1',nome:'ZZCliente Probe',acesso:true,data:'27/09/2026'}];
DB.pkg=[{id:'p1',clientId:'c1',nome:'ZPacote',valor:100,sessoes:4,criadoEm:'27/09/2026'}];
DB.ses=[{id:'s1',clientId:'c1',pacoteId:'p1',num:1,feita:false,data:'',obs:'Zobs',valor:25}];
DB.pay=[{id:'y1',clientId:'c1',pacoteId:'p1',sessaoId:null,valor:50,data:'27/09/2026',metodo:'pix',obs:''}];
DB.doc=[{id:'d1',clientId:'c1',pacoteId:null,sessaoId:null,titulo:'ZDoc',texto:'x',guias:[],fav:false,criadoEm:'',atualizadoEm:'',ts:1}];
DB.form=[{id:'f1',titulo:'ZForm',descr:'',qs:[{id:'q1',tipo:'curto',texto:'Q?',obr:false}],criadoEm:'',atualizadoEm:'',ts:1,token:'tokz'}];
DB.resp=[{id:'r1',formId:'f1',pessoa:'ZPessoaResp',vals:[{qid:'q1',valor:'v'}],criadoEm:'',ts:1}];
DB.arq=[{id:'a1',clientId:'c1',nome:'zarq.jpg',tamanho:9,data:'27/09/2026',url:'data:image/jpeg;base64,AAA',link:null,topico:'',ambito:'clinica',ts:1}];
DB.msg=[{id:'m1',de:'Kaleb Santiago',para:'Kaleb Santiago',texto:'ZMSGTESTE',criado_em:'',ts:Date.now()}];
MSG.rows=[{id:'mx',de:'Maria Souza',para:'Kaleb Santiago',texto:'ZMENSAGEMSECRETA',criado_em:'',ts:Date.now()}];
"seed ok"`);
/* ===== matrizes de navegação ===== */
const rotas=[
 ['inicio',          "setMode('inicio')",'viewInicio'],
 ['inicio·pacote',   "setMode('inicio');state.sub='pacote';state.pacoteId='p1';renderApp()",null],
 ['clientes',        "setMode('gestao');showView('clientes')",'viewClientes'],
 ['extras·roleta',   "setMode('extras');state.extrasRoleta=true;renderApp()",'viewRoleta'],
 ['dados·termos',    "setMode('dados');showDados('termos')",'viewTermos'],
 ['cliente·perfil',  "setMode('gestao');openClient('c1')",'viewCliente'],
 ['cliente·pkg',     "setMode('clientes');state.view='cliente';state.sub='pkg';renderApp()",'viewCliente'],
 ['cliente·docs',    "setMode('clientes');state.view='cliente';state.sub='docs';renderApp()",'viewCliente'],
 ['cliente·arq',     "setMode('clientes');state.view='cliente';state.sub='arq';renderApp()",'viewCliente'],
 ['cliente·fin',     "setMode('clientes');state.view='cliente';state.sub='fin';renderApp()",'viewCliente'],
 ['agenda',          "setMode('gestao');showView('agenda')",'viewAgenda'],
 ['financeiro',      "setMode('gestao');showView('financeiro')",'viewFinanceiro'],
 ['arquivos',        "setMode('gestao');showView('arquivos')",'viewArquivos'],
 ['extras',          "setMode('gestao');showView('extras')",'viewExtras'],
 ['studio·docs',     "setMode('studio');state.sview='docs';renderApp()",'viewDocs'],
 ['studio·forms',    "setMode('studio');state.sview='forms';renderApp()",'viewForms'],
 ['studio·respList', "setMode('studio');state.sview='respList';state.respForm='f1';renderApp()",'viewRespList'],
 ['studio·planilha', "setMode('studio');state.sview='planilha';renderApp()",'viewPlanilha'],
 ['studio·relat',    "setMode('studio');state.sview='relatorios';renderApp()",'viewRelatorios'],
 ['catalogo',        "setMode('catalogo')",'viewCatalogo'],
 ['equipe·home',     "setMode('equipe');state.esub='home';renderApp()",'viewEquipe'],
 ['equipe·msgs',     "setMode('equipe');state.esub='msgs';renderApp()",'viewEquipe'],
 ['equipe·usuarios', "setMode('equipe');state.esub='usuarios';renderApp()",'viewUsuarios'],
 ['dados·backup',    "setMode('dados');state.dsub='backup';renderApp()",'viewBackup'],
 ['dados·sync',      "setMode('dados');state.dsub='sync';renderApp()",'viewSync'],
 ['dados·theme',     "setMode('dados');state.dsub='theme';renderApp()",'viewTheme'],
 ['dados·otim',      "setMode('dados');state.dsub='otim';renderApp()",'viewOtim'],
 ['dados·sistema',   "setMode('dados');state.dsub='sistema';renderApp()",'viewSistema'],
 ['dados·uso',       "setMode('dados');state.dsub='uso';renderApp()",'viewUso'],
 ['dados·usuario',   "setMode('dados');state.dsub='usuario';renderApp()",'viewUsuario'],
 ['clients',         "setMode('clients')",'viewClients'],
 ['volta·clientes',  "setMode('clientes')"],
 ['volta·agenda',    "setMode('agenda')"],
 ['volta·inicio',    "setMode('inicio')"],
 ['volta·arquivos',  "setMode('arquivos')"],
 ['volta·extras',    "setMode('extras')"],
 ['volta·dados',     "setMode('dados');state.dsub='backup';renderApp()"],
 ['volta·clients',   "setMode('clients')"],
 ['volta·catalogo',  "setMode('catalogo')"]
];
/* token → contêineres onde PODE aparecer */
const regras=[
 ['Kaleb Santiago',['viewUsuarios','viewEquipe','viewUsuario','userModal','welcomeModal']],
 ['Maria Souza',   ['viewUsuarios','viewEquipe','viewUsuario','userModal','welcomeModal']],
 ['ZMENSAGEMSECRETA',['viewEquipe']],
 ['ZPessoaResp',   ['viewRespList','viewRespView','viewRespFill']],
];
const RE=require('fs').readFileSync(path.join(__dirname,'..','index.html'),'utf-8');
const nomes=[...new Set((RE.match(/render[A-Z][A-Za-z]*(?=\()/g)||[]))];
const fantasmas=nomes.filter(n=>!RE.includes('function '+n+'(')&&!RE.includes('const '+n+'='));
const leaks=[];
fantasmas.forEach(fg=>leaks.push('FUNÇÃO FANTASMA: '+fg));
if(fantasmas.length)fantasmas.forEach(fg=>leaks.push('FUNÇÃO FANTASMA: '+fg));
function visiveis(){
  const out=[];
  d.querySelectorAll('section[id^="view"],div[id$="Modal"]').forEach(el=>{
    if(el.classList.contains('hidden'))return;
    if(el.id==='userModal'||el.id==='welcomeModal'||el.id==='modeModal'||el.id==='rememberModal'){/* só se não hidden */}
    out.push({id:el.id,txt:el.textContent||''});
  });
  return out;
}
for(const rota of rotas){
  const r=ev(rota[1]);
  if(r.indexOf('THROW')===0){console.log('   (rota '+nome+' lançou: '+r.slice(0,60)+')');continue;}
  if(rota[2]){const alvo=d.getElementById(rota[2]);
    if(!alvo||alvo.classList.contains('hidden'))leaks.push(rota[0]+' · TELA ESCONDIDA: #'+rota[2]+' (o conteúdo não apareceu!)');}
  for(const el of visiveis()){
    for(const [tok,permitidos] of regras){
      if(el.txt.includes(tok)&&!permitidos.includes(el.id)){
        leaks.push(rota[0]+' · #'+el.id+' · contém “'+tok+'”');
      }
    }
  }
}
if(leaks.length){
  console.log('VAZAMENTOS ENCONTRADOS ('+leaks.length+'):');
  [...new Set(leaks)].forEach(l=>console.log('  ✗ '+l));
} else console.log('nenhum vazamento');
process.exit(leaks.length?1:0);
})().catch(e=>{console.error('ERRO:',e.message);process.exit(2);});
