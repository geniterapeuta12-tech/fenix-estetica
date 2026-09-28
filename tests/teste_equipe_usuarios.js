const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
const RES=[];const T=(n,c)=>{RES.push([n,!!c]);console.log((c?'  ✓ ':'✗ ')+n);};const P=n=>console.log('  '+(RES[RES.length-1][1]?'✓':'✗')+' '+n);
(async()=>{
const dom=new JSDOM(fs.readFileSync('/home/user/index.html','utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,4000);});
const ev=s=>{try{return String(w.eval(s));}catch(e){return 'THROW:'+e.message;}};
const d=w.document;
ev('DB.usu=[]');
ev("setMode('equipe');state.esub='usuarios';renderApp()");
T('Equipe›Usuários abre SEM erro', !ev('1').startsWith('THROW')&&d.getElementById('eqUsuCount')!==null);
T('lista vazia com convite pro cadastro', d.getElementById('eqUsuList').textContent.includes('cadastre o primeiro'));
T('contador mostra 0', d.getElementById('eqUsuCount').textContent.includes('0 usuário'));
// cadastrar pela Equipe
d.getElementById('eqUsuNome').value='Kaleb Santiago';d.getElementById('eqUsuSenha').value='abc123';
d.getElementById('eqUsuAdd').click();
T('cadastrou 1º usuário', ev('DB.usu.length')==='1');
T('senha em formato fx1', ev('DB.usu[0].senha.indexOf("fx1:")')==="0");
T('lista repintou com Kaleb', d.getElementById('eqUsuList').textContent.includes('Kaleb Santiago'));
// duplicado recusado
d.getElementById('eqUsuNome').value='kaleb santiago';d.getElementById('eqUsuSenha').value='zzzz';
d.getElementById('eqUsuAdd').click();
T('repetido recusado (1 usuário só por pessoa)', ev('DB.usu.length')==='1'&&d.getElementById('eqUsuMsg').textContent.includes('1 usuário'));
// senha curta
d.getElementById('eqUsuNome').value='Maria Souza';d.getElementById('eqUsuSenha').value='abc';
d.getElementById('eqUsuAdd').click();
T('senha curta recusada', ev('DB.usu.length')==='1');
// segunda pessoa ok
d.getElementById('eqUsuNome').value='Maria Souza';d.getElementById('eqUsuSenha').value='abcd';
d.getElementById('eqUsuAdd').click();
T('2ª pessoa cadastrada', ev('DB.usu.length')==='2');
// remover
ev('document.querySelector(\'[data-eqsudel]\').click()');
T('remover pela Equipe funciona', ev('DB.usu.length')==='1'&&ev('DB.usu[0].nome')==='Maria Souza');
// senha dela funciona no login de usuário
ev('window.__mu=DB.usu[0]');
T('senha conferível (senhaOk)', ev('senhaOk(__mu,"abcd")')==='true'&&ev('senhaOk(__mu,"xxxx")')==='false');
// isolamento: navegar pra outra área esconde tela da equipe
ev("setMode('clientes');renderApp()");
T('isolamento: viewUsuarios some ao sair da Equipe', d.getElementById('viewUsuarios').classList.contains('hidden'));
T('isolamento: viewEquipe some fora da Equipe', d.getElementById('viewEquipe').classList.contains('hidden'));
T('APP_VERSAO 1.6.30', ev('APP_VERSAO')==='1.6.30');
let ok=0;for(const[,c]of RES)if(c)ok++;
console.log('RESULTADO: '+ok+'/'+RES.length+(ok===RES.length?' ✓':' ✗'));
process.exit(ok===RES.length?0:1);
})().catch(e=>{console.error('ERRO:',e.message);process.exit(1);});
