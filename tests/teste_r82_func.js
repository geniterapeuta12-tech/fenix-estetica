/* R82 — funcional (jsdom): fundo no body (claro/escuro), claro dos temas novos, canvas PDF pronto */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let ok=0,fail=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(c)ok++;else fail++;};
(async()=>{
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{url:'https://fenix.local/',runScripts:'dangerously',resources:'usable',pretendToBeVisual:true});
const w=dom.window;
await new Promise(r=>{w.addEventListener('load',r);setTimeout(r,9000);});
const ev=c=>w.eval(c);
/* fundo */
ev("localStorage.setItem('fenix_fundo','data:image/jpeg;base64,AAAA');applyFundo()");
T('1. fundo aplicado no BODY (não no html)', (ev("document.body.style.backgroundImage")||'').includes('url("data:image/jpeg;base64,AAAA")')&&(ev("document.documentElement.style.backgroundImage")||'')==='');
T('2. camada escura por cima (modo escuro)', (ev("document.body.style.backgroundImage")||'').replace(/\s+/g,'').includes('rgba(8,7,5,0.8)'));
ev("applyTheme('light')");
T('3. no claro a camada vira marfim', (ev("document.body.style.backgroundImage")||'').replace(/\s+/g,'').includes('rgba(243,239,228,0.88)'));
/* claro + temas novos: sem fundo preto */
T('4. claro+limao: --gold é o tom escuro legível (#5f9410)', ev("applyAccent('limao');document.documentElement.style.getPropertyValue('--gold')")==='#5f9410');
T('5. claro+limao: regras CSS marfim existem (nada de preto)', (function(){const css=[...w.document.querySelectorAll('style')].map(x=>x.textContent).join('\n');return css.includes('html[data-theme="light"][data-accent="limao"] body{background:radial-gradient')&&css.includes('html[data-theme="light"][data-accent="limao"]{background:#f3efe4}');})());
T('6. claro+lava: regras marfim existem', (function(){const css=[...w.document.querySelectorAll('style')].map(x=>x.textContent).join('\n');return css.includes('html[data-theme="light"][data-accent="lava"] body{background:radial-gradient');})());
ev("applyTheme('dark');applyAccent('gold')");
/* canvas PDF pela I.A */
const idn=ev("(function(){const L=(typeof getCans==='function')?getCans():[];const novo={id:uid(),tipo:'pdf',titulo:'Roteiro Teste I.A',texto:'Linha 1 do roteiro.\\n\\nLinha 2.',criadoEm:'agora',ts:Date.now(),geradoEm:'',ia:true};novo.pdf=iaCanPdfBytes(novo.titulo,novo.texto);novo.geradoEm=nowLabel();const L2=getCans();L2.unshift(novo);setCans(L2);return novo.id;})()");
T('7. item PDF da I.A nasce com .pdf gerado (cabeçalho %PDF)', (ev("(function(){const c=canById('"+idn+"');return JSON.stringify({h:c&&c.pdf?c.pdf.slice(0,5):null,eof:!!(c&&c.pdf&&c.pdf.indexOf('%%EOF')>=0)});})()")==='{"h":"%PDF-","eof":true}'));
T('8. openCanvas mostra o botão «PDF pronto»', (ev("(function(){openCanvas('"+idn+"');return document.getElementById('btnIaCanBaixar').style.display;})()")==='')&&(ev("(function(){const b=document.getElementById('btnIaCanBaixar');return b.textContent;})()").includes('PDF pronto')));
T('9. texto do canvas NÃO-pdf não ganha botão', (ev("(function(){const L2=getCans();const t={id:uid(),tipo:'texto',titulo:'Só texto',texto:'oi',criadoEm:'agora',ts:Date.now(),geradoEm:'',ia:false};L2.unshift(t);setCans(L2);openCanvas(t.id);return document.getElementById('btnIaCanBaixar').style.display;})()")==='none'));
/* fundo remover volta */
ev("localStorage.removeItem('fenix_fundo');applyFundo()");
T('10. remover fundo limpa o body', (ev("document.body.style.backgroundImage")||'')==='');
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/10)'));
w.close();process.exit(fail?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
