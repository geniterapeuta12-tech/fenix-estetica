/* R101 — fonte Anthropic + seletor de UI (Moderna/Clássica) + catálogo blindado */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.80 + versao.json R101', W.includes("APP_VERSAO='1.6.80'")&&VJ.versao==='1.6.80'&&VJ.r==='R106');
T('2. fonte serifada estilo Anthropic EMBUTIDA (2 pesos woff2 base64)', (W.match(/@font-face\{font-family:'Source Serif 4'/g)||[]).length===2&&W.includes('base64,')&&W.includes('format(\'woff2\')'));
T('3. títulos/números da UI Moderna usam a serifa (override !important)', W.includes('html:not([data-ui="classica"]) h1,html:not([data-ui="classica"]) h2,html:not([data-ui="classica"]) h3')&&W.indexOf("'Source Serif 4',Georgia,'Times New Roman',serif!important")>0);
T('4. seletor UI do app: Moderna + Clássica na Aparência', W.includes('id="uiModerna"')&&W.includes('id="uiClassica"')&&W.includes("<h3>UI do app</h3>"));
T('5. listeners + função aplicaUI + boot pela UI', W.includes("$('uiModerna').addEventListener('click',()=>aplicaUI('moderna'))")&&W.includes('function aplicaUI(ui)')&&W.includes('aplicaUI(currentUI());'));
T('6. Moderna = cor ÚNICA laranja: esconde cores de tema e força terracota', W.includes("if(cc2)cc2.classList.toggle('hidden',ui==='moderna')")&&W.includes("if(ct)ct.classList.toggle('hidden',ui==='moderna')")&&W.includes("applyAccent('terraco')"));
T('7. Clássica mantém as cores de tema (lista intacta + dourado)', W.includes('id="accGold"')&&W.includes("applyAccent(currentAccent())")&&W.includes("(currentUI()==='classica'?'dark':'light')"));
T('8. vender do catálogo BLINDADO (nunca deixa de abrir + puxa da nuvem se vazia)', W.includes('try{sellVincPinta(prefer||\'cliente:\');}catch(e){}')&&W.includes('pullRemote(false).then')&&W.includes('if(REMOTE&&!sellOpts().length)'));
T('9. Terracota duplicada removida (era 2 botões com o mesmo id — 1 não funcionava)', (W.match(/id="accTerraco"/g)||[]).length===1);
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/9)'));
process.exit(fail?1:0);
