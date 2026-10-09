/* R111 — CAMADA DE ACABAMENTO UI (tokens estilo Claude, SÓ claro · escuro intocado · zero JS) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
const TL=fs.readFileSync('/home/user/FENIX-TESTE-LOCAL.html','utf8');
T('1. versão 1.6.85 + versao.json R111 (5 melhorias)', W.includes("APP_VERSAO='1.6.85'")&&VJ.versao==='1.6.85'&&VJ.r==='R111'&&VJ.melhorias.length===5);
T('2. tokens da camada (terracota press A9583E · ok/err calibrados · sombra modal)', W.includes('--fx-terr-press:#A9583E')&&W.includes('--fx-ok-bg:#E7F0E2')&&W.includes('--fx-err-bg:#F9E4E1')&&W.includes('box-shadow:0 32px 80px rgba(61,57,41,.22)'));
T('3. acabamento: botão afunda (:active) · disabled · focus-visible · chips terracota', W.includes('.btn:active{background:var(--fx-terr-press);border-color:var(--fx-terr-press);transform:scale(.985)}')&&W.includes('html[data-theme="light"] button:disabled{opacity:.55')&&W.includes('outline:2px solid rgba(217,119,87,.55);outline-offset:2px')&&W.includes('html[data-theme="light"] .chip.active{background:var(--fx-terr);border-color:var(--fx-terr);color:#fff'));
T('4. detalhes: badges ok/err · inputs hover · números tabulares · vazio pontilhado · avatar com anel', W.includes('html[data-theme="light"] .badge.b-green{background:var(--fx-ok-bg)')&&W.includes('html[data-theme="light"] input:hover,html[data-theme="light"] select:hover,html[data-theme="light"] textarea:hover{border-color:rgba(217,119,87,.45)}')&&W.includes('font-variant-numeric:tabular-nums')&&W.includes('border:1.5px dashed rgba(61,57,41,.16)')&&W.includes('box-shadow:0 0 0 2px #fff,0 0 0 3.5px rgba(217,119,87,.28)'));
T('5. TUDO no claro (todas as ~20 regras novas são html[data-theme="light"])', (()=>{const i=W.indexOf('R111 — CAMADA DE ACABAMENTO UI');if(i<0)return false;const bloco=W.slice(i).split('\n/* ══════════')[0];const regras=bloco.split('\n').filter(l=>l.startsWith('html[data-theme="light"]'));return regras.length>=20&&regras.every(l=>l.includes('data-theme="light"'));})());
T('6. R110 intacto (modo local de verdade) + R109 intacto (status honesto)', W.includes('const us0=loadUsers();')&&W.includes('if(!REMOTE)return; /* R110 — modo local: nada vai pra nuvem */')&&W.includes('const temLembrete=!!(window.__pendRemoto||window.__pendLocal);')&&W.includes('function finFaltaReal(f)')&&W.includes('function finStatus(f)'));
T('7. FENIX-TESTE-LOCAL 1.6.85-teste com SB=null declarado + selo', TL.includes("const SB=null; /* TESTE-LOCAL: nuvem desligada")&&TL.includes("APP_VERSAO='1.6.85-teste'")&&TL.includes('TESTE LOCAL · 1.6.85-teste · NÃO OFICIAL'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/7)'));
process.exit(fail?1:0);
