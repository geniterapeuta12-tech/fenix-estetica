/* R100 — ronda 2 da UI (agenda, ficha, financeiro, pacotes, I.A) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.79 + versao.json R100', W.includes("APP_VERSAO='1.6.79'")&&VJ.versao==='1.6.79'&&VJ.r==='R105');
T('2. agenda: cartão .appt branco + HORÃO serifado terracota', W.includes('html[data-theme="light"] .appt .when b{font-family:Georgia,\'Times New Roman\',serif;font-size:1.5rem;color:#C05B3B')&&W.includes('html[data-theme="light"] .appt{background:#fff'));
T('3. calendário em pílulas + hoje terracota cheio', W.includes('html[data-theme="light"] .cal-day{border-radius:12px}')&&W.includes('.cal-day.today{background:#D97757;color:#fff'));
T('4. avatar = círculo pêssego c/ iniciais serifadas terracota + ficha #pNome grande', W.includes('html[data-theme="light"] .avatar{background:#F6E3D3;color:#B4562F;font-family:Georgia')&&W.includes('#pNome{font-family:Georgia'));
T('5. pacotes: barra de progresso (pkgbar) renderizada no JS', W.includes('class="pkgbar"')&&W.includes("Math.round(done*100/ses.length)")&&W.includes('.pkgbar i{display:block;height:100%;border-radius:999px;background:#D97757}'));
T('6. financeiro: valores serifados + saldo terracota no claro (sem neon)', W.includes("document.documentElement.dataset.theme==='light'?'#B4562F':'var(--gold)'")&&W.includes("theme==='light'?'#2f7d5b':'#8dffb0'")&&W.includes('#finList .txn b'));
T('7. I.A: enviar círculo terracota + abas pílula', W.includes('html[data-theme="light"] .ia-go{background:#D97757;color:#fff;border-radius:50%}')&&W.includes('.ia2tabs button.on{background:#fff'));
T('8. escuro intocado (ronda 2 é tudo html[data-theme="light"])', (()=>{const b=W.split('R100 — RONDA 2')[1].split('</style>')[0];return b.split('html[data-theme="light"]').length>=18&&!b.includes('html:not([data-theme="light"])');})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
