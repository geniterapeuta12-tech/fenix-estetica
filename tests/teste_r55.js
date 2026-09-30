
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join('/home/user/tests','node_modules','jsdom'));
let html=fs.readFileSync('/home/user/center-src/www/index.html','utf-8');
(async()=>{
let falhas=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(!c)falhas++;};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
await new Promise(r=>{if(w.document.readyState==='complete')return r();w.addEventListener('load',r);setTimeout(r,5000);});
const d=w.document;

// ===== BOTÃO DE VOLTAR =====
T('1. botão ‹ Voltar existe e começa escondido (início)', !!d.getElementById('btnVoltar') && !d.getElementById('btnVoltar').classList.contains('show'));
d.getElementById('navAccount').click();
await new Promise(r=>setTimeout(r,50));
T('2. Account abre pela barra lateral (e voltar aparece)', !d.getElementById('view-account').classList.contains('esconde') && d.getElementById('btnVoltar').classList.contains('show') && d.getElementById('titulo').textContent==='Account');
d.getElementById('btnVoltar').click();
await new Promise(r=>setTimeout(r,50));
T('3. voltar traz pro Início e some', !d.getElementById('view-account').classList.contains('esconde')===false && !d.getElementById('btnVoltar').classList.contains('show'));
d.getElementById('btnMenu').click();
T('4. voltar FECHA POPUP primeiro (menu ⊞ aberto)', d.getElementById('painelMenu').classList.contains('show') && d.getElementById('btnVoltar').classList.contains('show')===false);
d.getElementById('btnVoltar').click();
T('5. popup fechou com voltar', !d.getElementById('painelMenu').classList.contains('show'));
T('6. __fenixBack existe e devolve false no início limpo', w.eval("typeof __fenixBack")==='function' && w.eval("__fenixBack()")===false);
d.getElementById('navAccount').click();
T('7. __fenixBack devolve TRUE na tela Account (e volta)', w.eval("__fenixBack()")===true && d.getElementById('view-inicio').classList.contains('esconde')===false);
d.getElementById('btnMenu').click();
T('8. tecla ESC fecha popup', (()=>{d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));return !d.getElementById('painelMenu').classList.contains('show');})());

// ===== ACCOUNT =====
T('9. Account na barra lateral + no popup ⊞', !!d.getElementById('navAccount') && !!d.getElementById('miAccount'));
const set=(id,v)=>{const e=d.getElementById(id);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));};
d.getElementById('acSalvar').click();
T('10. RÍGIDO: vazio → exige nome de usuário', d.getElementById('acMsg').textContent.includes('nome de usuário'));
set('acUser','fa');
d.getElementById('acSalvar').click();
T('11. RÍGIDO: curto → precisa conter pelo menos 3 caracteres', d.getElementById('acMsg').textContent.includes('3 caracteres'));
set('acUser','Fatima Silva');
d.getElementById('acSalvar').click();
T('12. RÍGIDO: só formato e-mail Fênix (minúsculas, números, ponto)', d.getElementById('acMsg').textContent.includes('formato e-mail Fênix'));
set('acUser','fatima..silva');
d.getElementById('acSalvar').click();
T('13. RÍGIDO: ponto em sequência recusado', d.getElementById('acMsg').textContent.includes('ponto'));
set('acUser','fatima.silva');
d.getElementById('acHandlePrev');
T('14. prévia do e-mail Fênix ao digitar (→ fatima.silva@fenix.app)', d.getElementById('acHandlePrev').textContent.includes('fatima.silva@fenix.app'));
d.getElementById('acSalvar').click();
T('15. RÍGIDO: senha vazia recusada', d.getElementById('acMsg').textContent.includes('senha'));
set('acPass','123');
d.getElementById('acSalvar').click();
T('16. RÍGIDO: senha mínima 4', d.getElementById('acMsg').textContent.includes('4 caracteres'));
set('acPass','fenix2026');
d.getElementById('acSalvar').click();
T('17. conta criada: salva no aparelho e aparece no perfil', d.getElementById('acNome').textContent==='fatima.silva' && d.getElementById('acHandleTxt').textContent.includes('fatima.silva@fenix.app') && JSON.parse(w.localStorage.getItem('center_conta')).senha==='fenix2026');
T('18. avatar com inicial dourada', d.getElementById('acAv').textContent==='F');
T('19. popup ⊞ mostra o usuário da conta', d.getElementById('miAcUser').textContent==='fatima.silva');
set('acUser','joao.souza');set('acPass','1234');
d.getElementById('acSalvar').click();
set('acUser','fatima.silva');set('acPass','9999');
d.getElementById('acSalvar').click();
T('20. RÍGIDO: "este nome de usuário JÁ EXISTE" ao repetir', d.getElementById('acMsg').textContent.includes('JÁ EXISTE'));
set('acUser','joao.souza');set('acPass','novaSenha1');
d.getElementById('acSalvar').click();
T('21. mesma conta atual pode trocar a senha', JSON.parse(w.localStorage.getItem('center_conta')).senha==='novaSenha1' && d.getElementById('acMsg').textContent.includes('✔'));
d.getElementById('acOlho').click();
T('22. 👁 mostra a senha no card', d.getElementById('acPassVal').textContent==='novaSenha1');
d.getElementById('acOlho').click();
T('23. aviso «conta local · por enquanto» presente (ainda não funciona de verdade)', d.getElementById('view-account').textContent.includes('conta local') && d.getElementById('view-account').textContent.includes('vem por aí'));

// ===== CENTER (APK/EXE) builds =====
T('24. fonte Java: botão voltar do Android chama __fenixBack antes de sair', fs.readFileSync('/home/user/center-src/br/fenix/center/MainActivity.java','utf-8').includes('__fenixBack'));
T('25. Center 1.5.0 nas duas plataformas (UI)', w.eval("CENTER_V")==='1.5.0' && html.includes('v1.5.0'));
T('26. temas/side/⊞ intactos', html.includes('fenix-center-v5')===false && html.includes('data-accent="lilas"') && !!d.getElementById('painelTema'));

console.log(falhas?('FALHAS: '+falhas):'TUDO OK (26/26)');
process.exit(falhas?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
