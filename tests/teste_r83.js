/* R83 — Fênix I.A visível na cliente + Reels 60s */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const CL=fs.readFileSync(path.join(__dirname,'..','clients','index.html'),'utf8');
const RE=fs.readFileSync(path.join(__dirname,'..','FENIX-REELS-60s.html'),'utf8');
T('1. aba da Fênix I.A fora da régua de permissões (sempre visível)', CL.includes("(perm.indexOf(g)>=0||g==='ia')?'':'none'"));
T('2. aba com marca própria 💛 + painel Fênix I.A', CL.includes('data-go="f-ia">💛 Fênix I.A</button>')&&CL.includes("sec('iac','💛 Fênix I.A',"));
T('3. chips pago/falta do R82 intactos', CL.includes("var stP=falta>0?")&&CL.includes('✓ pago</span>'));
T('4. erro de cota amigável intacto', CL.includes("o.j.code==='cota'?o.j.message:null"));
T('5. reels: 7 cenas de 60s (9:16)', (RE.match(/<section class="card"/g)||[]).length===7&&RE.includes('width:1080px;height:1920px')&&RE.includes('DUR=[7,9,9,7,11,8,9]'));
T('6. reels: cenas cobrem funções + CTA + fênix própria', ['clientes & pacotes','financeiro','agenda','fênix i.a','espaço da cliente','modernize sua'].every(k=>RE.toLowerCase().includes(k))&&(RE.match(/<symbol id="phoenix"/g)||[]).length===0&&(RE.match(/<g fill="currentColor">/g)||[]).length>=2);
T('7. JS clients válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(CL)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/7)'));
process.exit(fail?1:0);
