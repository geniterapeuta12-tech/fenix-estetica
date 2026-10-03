const fs=require('fs');const {JSDOM}=require('jsdom');
const html=fs.readFileSync('/home/user/tests/fenix-estetica.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://fenix.test/',pretendToBeVisual:true});
const w=dom.window,d=w.document,ev=s=>w.eval(s);
setTimeout(async()=>{try{
ev(`entrarLocal({nome:'Clínica Teste'},'teste')`);
console.log('1 entrou');
ev(`document.getElementById('btnSair').click()`);
console.log('2 clicou sair');
await new Promise(r=>setTimeout(r,250));
console.log('3 sleep ok, auth hidden?',d.getElementById('authScreen').classList.contains('hidden'));
console.log('4 btnEntrar?',!!d.getElementById('btnEntrar'));
console.log('5 submit direto:');
d.getElementById('loginNome').value='Clínica Teste';d.getElementById('loginSenha').value='errada';
d.getElementById('formLogin').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
await new Promise(r=>setTimeout(r,150));
console.log('6 msg:',JSON.stringify(d.getElementById('loginMsg').textContent.slice(0,60)));
console.log('7 btn disabled?',d.getElementById('btnEntrar').disabled);
process.exit(0);}catch(e){console.log('ERRO',e.message);process.exit(1);}},600);
