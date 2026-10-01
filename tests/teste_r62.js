/* R62 — A PORTA DA IA: botão Fênix I.A na barra lateral */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
T('1. botão Fênix I.A na sidebar (data-view="ia")', /data-view="ia"[^>]*>[\s\S]{0,120}#i-ai[\s\S]{0,80}Fênix I.A/.test(W)|| /data-view="ia"/.test(W)&&/Fênix I.A<\/button>/.test(W));
T('2. seção renomeada p/ viewIa (case do cap)', W.includes('id="viewIa"')&&!W.includes('id="viewIA"'));
T('3. mapa de modos usa viewIa', W.includes("viewIa:'gestao'"));
T('4. "ia" na lista VIEWS', W.includes("'arquivos','ia','extras'"));
T('5. título da view', W.includes("ia:'Fênix I.A'"));
T('6. renderIA chamado ao abrir a view', /state\.view==='ia'\)\{try\{renderIA\(\)\}catch/.test(W));
T('7. handler do nav é genérico (data-view)', W.includes("#navGestao .navbtn\').forEach(b=>b.addEventListener(\'click\',()=>showView(b.dataset.view))"));
T('8. versão 1.6.41', W.includes("APP_VERSAO='1.6.41'"));
T('9. IA segue ligada (worker /ia)', /NUVEM_URL\+'\/ia'/.test(W));
T('10. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/10)'));
process.exit(fail?1:0);
