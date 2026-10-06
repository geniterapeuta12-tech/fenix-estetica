/* R106 — Nova venda DIRETO do Catálogo + Organizador de perfil (Studio, nuvem) + vendas antigas editáveis */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.80 + versao.json R106 (5 melhorias)', W.includes("APP_VERSAO='1.6.80'")&&VJ.versao==='1.6.80'&&VJ.r==='R106'&&VJ.melhorias.length===5);
T('2. tabela pubs na sincronia (LOAD_ORDER + TABLES + DB + LEGACY + helpers)', W.includes("'usu','msg','pub']")&&W.includes("pub:{table:'pubs',fromDb:mapPub,toDb:dbPub}")&&W.includes('msg:[],pub:[],bkp:[]')&&W.includes('msg:msgKey,pub:pubKey')&&W.includes("const getPub=()=>DB.pub,setPub=v=>{DB.pub=v;persist('pub');}"));
T('3. sellModal com seletor de CLIENTE (venda direto do Catálogo)', W.includes('id="sellCliBox"')&&W.includes('id="sellCli"')&&W.includes('function openSellModalCat()')&&W.includes("$('btnQuemNova')&&$('btnQuemNova').addEventListener('click',()=>openSellModalCat())"));
T('4. venda usa a cliente ESCOLHIDA + vinculação acompanha a troca', W.includes("const cliId=($('sellCliBox')&&!$('sellCliBox').classList.contains('hidden')&&$('sellCli').value)?$('sellCli').value:state.clientId;")&&W.includes("function sellVincPinta(prefer,cliId){cliId=cliId||state.clientId;")&&W.includes("$('sellCli')&&$('sellCli').addEventListener('change'"));
T('5. Organizador de perfil: view + sidebar + render + CRUD completo', W.includes('id="viewPerfil"')&&W.includes('data-sview="perfil"')&&W.includes('function renderPerfil()')&&W.includes('btnPubSalvar')&&W.includes('data-act="pubok"')&&W.includes("bindDel('pubList',getPub,setPub,renderPerfil)")&&W.includes("viewPerfil:'perfil'"));
T('6. venda antiga: dica de como deixar EM ABERTO na edição', W.includes('id="efDica"')&&W.includes('Venda antiga: está como PAGA'));
T('7. R105 intacto (vendas de verdade + status honesto + saldo honesto)', W.includes('<h3>Vendas do catálogo</h3>')&&W.includes("bindDel('quemList',getFin,setFin")&&(W.match(/b-green\">✓ Quitado/g)||[]).length===4&&(W.match(/r\.cat\?\(r\.pago!=null\?Math\.min\(r\.pago,r\.valor\):r\.valor\):r\.valor/g)||[]).length===2);
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/7)'));
process.exit(fail?1:0);
