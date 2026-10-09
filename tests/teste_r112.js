/* R111 — NOVA FACE (Claude×Linear×Stripe×Airbnb · SÓ claro · identidade mantida · zero JS) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
const TL=fs.readFileSync('/home/user/FENIX-TESTE-LOCAL.html','utf8');
T('1. versão 1.6.86 + versao.json R112 (5 melhorias)', W.includes("APP_VERSAO='1.6.86'")&&VJ.versao==='1.6.86'&&VJ.r==='R112'&&VJ.melhorias.length===5);
T('2. sidebar quase-preta quente + item ativo em gradiente terracota (Linear)', W.includes('html[data-theme="light"] .sidebar{background:#1F1C18;border-right:1px solid rgba(255,255,255,.06)}')&&W.includes('.navbtn.active{background:linear-gradient(135deg,#D97757,#C75F3C);box-shadow:0 6px 14px rgba(199,95,60,.30)}'));
T('3. botões gradiente terracota + hover sobe + active afunda (ghost neutro)', W.includes('html[data-theme="light"] .btn{background:linear-gradient(135deg,#D97757,#C75F3C);border-color:#C75F3C;box-shadow:0 6px 16px rgba(199,95,60,.28),inset 0 1px 0 rgba(255,255,255,.18)}')&&W.includes('.btn:hover{background:linear-gradient(135deg,#C75F3C,#B4532F);border-color:#B4532F;box-shadow:0 8px 20px rgba(180,83,47,.32),inset 0 1px 0 rgba(255,255,255,.15);transform:translateY(-1px)}')&&W.includes('.btn.small.ghost{background:#fffdf6;border-color:rgba(61,57,41,.16);box-shadow:none}'));
T('4. stats Stripe (rótulo caps) + título serifado editorial + scroll fina terracota + vidro no modal', W.includes('.stat span{font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;font-weight:600;color:#9A9382}')&&W.includes('#viewTitle{font-family:Georgia,\'Times New Roman\',serif;font-size:1.4rem;font-weight:600;letter-spacing:-.015em;color:#2E2A22}')&&W.includes('*::-webkit-scrollbar-thumb{background:rgba(192,91,59,.28);border-radius:99px}')&&W.includes('.pmodal{background:rgba(43,38,30,.44);backdrop-filter:blur(6px)}'));
T('5. tudo DEPOIS da camada R112 (sobrescreve na ordem) e TODAS com data-theme light', (()=>{const i=W.indexOf('R112 — NOVA FACE');if(i<0)return false;const bloco=W.slice(i).split('\n/* ══════════')[0];const regras=bloco.split('\n').filter(l=>l.startsWith('html[data-theme="light"]'));return regras.length>=20&&regras.every(l=>l.includes('data-theme="light"'));})());
T('6. R112/R110/R109 intactos', W.includes('--fx-terr-press:#A9583E')&&W.includes('const us0=loadUsers();')&&W.includes('function finFaltaReal(f)')&&W.includes('function finStatus(f)'));
T('7. teste-local 1.6.86-teste regenerado (SB=null declarado + selo)', TL.includes("const SB=null; /* TESTE-LOCAL: nuvem desligada")&&TL.includes("APP_VERSAO='1.6.86-teste'")&&TL.includes('TESTE LOCAL · 1.6.86-teste · NÃO OFICIAL'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/7)'));
process.exit(fail?1:0);
