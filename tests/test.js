const fs=require('fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('/home/user/tests/fenix-estetica.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://fenix.test/',pretendToBeVisual:true});
const w=dom.window,d=w.document;
const ev=s=>w.eval(s);
const opts=id=>[...d.getElementById(id).options].map(o=>o.value||o.textContent);
let pass=0,fail=0;
const ok=(cond,label)=>{if(cond){pass++;console.log('  ✔ '+label);}else{fail++;console.log('  ✘ FALHOU: '+label);}};

setTimeout(()=>{try{
console.log('— Preparando dados —');
ev(`setCli([
 {id:'cli-a',nome:'Alice',cpf:'',nasc:'',tel:'',email:'',end:'',obs:'',data:'01/01/2026'},
 {id:'cli-b',nome:'Bia',cpf:'',nasc:'',tel:'',email:'',end:'',obs:'',data:'01/01/2026'}])`);
ev(`setPkg([
 {id:'pkg-a',clientId:'cli-a',nome:'Pacote A',valor:100,sessoes:2,criadoEm:''},
 {id:'pkg-b',clientId:'cli-b',nome:'Pacote B',valor:200,sessoes:2,criadoEm:''}])`);
ev(`setSes([
 {id:'ses-a',clientId:'cli-a',pacoteId:'pkg-a',num:1,feita:false,data:'',obs:'',valor:0},
 {id:'ses-b',clientId:'cli-b',pacoteId:'pkg-b',num:1,feita:false,data:'',obs:'',valor:0}])`);
ev(`setArq([
 {id:'arq-a',clientId:'cli-a',nome:'foto-alice.jpg',tamanho:1000,data:'19/09/2026',url:'data:image/png;base64,AAAA',link:{tipo:'pacote',id:'pkg-a'},topico:'',ambito:'clinica',ts:1},
 {id:'arq-b',clientId:'cli-b',nome:'foto-bia.jpg',tamanho:1000,data:'19/09/2026',url:'data:image/png;base64,AAAA',link:{tipo:'cliente',id:'cli-b'},topico:'',ambito:'clinica',ts:2}])`);

console.log('— TESTE 1 —');
ev(`openClient('cli-a'); openSub('arquivos')`);
let pk=opts('cliFpkg'),se=opts('cliFses');
ok(!pk.some(v=>v==='pkg-b'),'Pacote dropdown NÃO contém pacote da Bia');
ok(pk.includes('pkg-a'),'Pacote dropdown contém o pacote da própria Alice');
ok(!se.includes('ses-b'),'Sessão dropdown NÃO contém sessão da Bia');
let txt=d.getElementById('arqCliList').textContent;
ok(txt.includes('foto-alice')&&!txt.includes('foto-bia'),'Lista mostra só arquivo da Alice');

console.log('— TESTE 2 —');
ev(`filters.cli.pkg='pkg-b'; filters.cli.ses='ses-b'; renderArqCli()`);
ok(ev(`filters.cli.pkg`)===''&&ev(`filters.cli.ses`)==='','applyF limpou pkg/ses de outra cliente');
txt=d.getElementById('arqCliList').textContent;
ok(txt.includes('foto-alice'),'Arquivos da Alice seguem visíveis');

console.log('— TESTE 3 —');
ev(`filters.cli.pkg='pkg-a';`);
ev(`openClient('cli-b'); openSub('arquivos')`);
ok(ev(`JSON.stringify(filters.cli)`)===JSON.stringify({cli:'',pkg:'',ses:'',tipo:'',ord:'recentes'}),'filters.cli zerado ao abrir Bia');
pk=opts('cliFpkg');
ok(!pk.includes('pkg-a'),'Dropdown da Bia não mostra pacote da Alice');
txt=d.getElementById('arqCliList').textContent;
ok(txt.includes('foto-bia')&&!txt.includes('foto-alice'),'Bia vê só o arquivo dela');

console.log('— TESTE 4 —');
ev(`openClient('cli-a'); openPacote('pkg-a'); setPsub('arquivos')`);
se=opts('pkgFses');
ok(!se.includes('ses-b'),'Dropdown do pacote NÃO lista sessão do pacote B');
ev(`filters.pkg.ses='ses-b'; renderPkgFiles()`);
ok(ev(`filters.pkg.ses`)==='','Sessão de outro pacote descartada no applyF');
txt=d.getElementById('pkgFilesList').textContent;
ok(txt.includes('foto-alice'),'Arquivos do pacote A seguem visíveis');

console.log('— TESTE 5 —');
ev(`openClient('cli-a'); openSub('arquivos')`);
ev(`openEditFile(arqById('arq-a'))`);
ok(d.getElementById('umCliWrap').style.display==='none','Seletor de cliente escondido dentro da cliente');
ok(!d.getElementById('umCli').innerHTML.includes('Bia')&&d.getElementById('umCli').value==='cli-a','umCli travado na Alice');
ok(d.getElementById('umLink').innerHTML.includes('Pacote A')&&!d.getElementById('umLink').innerHTML.includes('Pacote B'),'Vínculos só da própria cliente');

console.log('— TESTE 6 —');
ev(`showView('arquivos')`);
const gcli=opts('genFcli');
ok(gcli.some(v=>v==='cli-a')&&gcli.some(v=>v==='cli-b'),'Filtro geral lista todas as clientes');
const gpkg=opts('genFpkg');
ok(gpkg.includes('pkg-a')&&gpkg.includes('pkg-b'),'Filtro geral lista pacotes de todas');

console.log('— TESTE 7 —');
ev(`openClient('cli-b'); openSub('arquivos'); filters.cli.pkg='pkg-b'; openClient('cli-a'); openSub('arquivos'); goBack()`);
ok(ev(`filters.cli.pkg`)===''||ev(`filters.cli.pkg`)==='pkg-b','goBack mantém filtro saneado');

console.log('\nRESULTADO: '+pass+' passaram, '+fail+' falharam');
process.exit(fail?1:0);
}catch(e){console.error('ERRO NO TESTE:',e);process.exit(2);}},300);
