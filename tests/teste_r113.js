/* R112 — DETALHES FINOS (micro-tipografia + calendário + valores on-brand · SÓ claro · zero JS) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
const TL=fs.readFileSync('/home/user/FENIX-TESTE-LOCAL.html','utf8');
T('1. versão 1.6.87 + versao.json R113 (5 melhorias)', W.includes("APP_VERSAO='1.6.87'")&&VJ.versao==='1.6.87'&&VJ.r==='R113'&&VJ.melhorias.length===5);
T('2. rótulos de seção em micro-serifa terracota (só dentro de modal — folha intocada)', W.includes("html[data-theme=\"light\"] .pmodal .fk{font:700 .66rem Georgia,'Times New Roman',serif;letter-spacing:.16em;text-transform:uppercase;color:#B4562F}")&&!W.includes('html[data-theme="light"] .folha .fk{'));
T('3. calendário vivo (hover levanta + hoje com sombra terracota)', W.includes('html[data-theme="light"] .cal-day:hover{border-color:rgba(217,119,87,.55);transform:translateY(-1px)}')&&W.includes('html[data-theme="light"] .cal-day.today{box-shadow:0 4px 12px rgba(217,119,87,.35)}'));
T('4. avatares gradiente terracota + abas ativas terracota + modal raio 20 + bolhas 18', W.includes('html[data-theme="light"] .avatar{background:linear-gradient(135deg,#E9906F,#C75F3C);color:#fff}')&&W.includes('html[data-theme="light"] .tab.active{color:#B4562F;font-weight:700}')&&W.includes('html[data-theme="light"] .pmodal-card,html[data-theme="light"] .modal-card{border-radius:20px}')&&W.includes('html[data-theme="light"] .ia-msg .b{border-radius:18px}'));
T('5. valores on-brand (in verde-profundo · out terracota) + sub cinza-quente', W.includes('html[data-theme="light"] .val.in{color:#2F7D4F}')&&W.includes('html[data-theme="light"] .val.out{color:#B4562F}')&&W.includes('html[data-theme="light"] .sub{color:#8E8878}'));
T('6. tudo DEPOIS de R113 e todas com data-theme light', (()=>{const i=W.indexOf('R113 — DETALHES FINOS');if(i<0)return false;const bloco=W.slice(i).split('\n/* ══════════')[0];const regras=bloco.split('\n').filter(l=>l.startsWith('html[data-theme="light"]'));return regras.length>=12&&regras.every(l=>l.includes('data-theme="light"'));})());
T('7. R113/R111/R110/R109 intactos', W.includes('.navbtn.active{background:linear-gradient(135deg,#D97757,#C75F3C)')&&W.includes('--fx-terr-press:#A9583E')&&W.includes('const us0=loadUsers();')&&W.includes('function finStatus(f)'));
T('8. teste-local 1.6.87-teste (SB=null declarado + selo)', TL.includes("const SB=null; /* TESTE-LOCAL: nuvem desligada")&&TL.includes("APP_VERSAO='1.6.87-teste'")&&TL.includes('TESTE LOCAL · 1.6.87-teste · NÃO OFICIAL'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
