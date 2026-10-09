/* R115 — UNIFICAÇÃO DEFINITIVA DA UI: MESMA UI NO CLARO E NO ESCURO */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.89 + versao.json R115 com EXATAMENTE 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.6.89'") &&
  VJ.versao === '1.6.89' &&
  VJ.r === 'R115' &&
  VJ.melhorias.length === 5
);

T('2. Remoção das interfaces novas divergentes (sem Apple Luxury #F5F5F7 e sem overrides forçados)',
  !W.includes('R114 — REDESIGN APPLE LUXURY') &&
  !W.includes('backdrop-filter: blur(24px) saturate(190%)') &&
  !W.includes('inset 0 1px 0 rgba(255, 255, 255, 0.95)')
);

T('3. UI clássica unificada ativa por padrão para tema claro e escuro',
  W.includes("function currentUI(){return 'classica';}") &&
  W.includes("document.documentElement.dataset.ui='classica'")
);

T('4. Cores do tema (cardCores) e Tema (cardTema) sempre acessíveis e visíveis',
  W.includes('<div class="panelcard" id="cardCores">') &&
  W.includes('id="cardTema"') &&
  W.includes("if(cc2)cc2.classList.remove('hidden');") &&
  W.includes("if(ct)ct.classList.remove('hidden');")
);

T('5. Paridade de UI: variáveis de tema claro e escuro clássicas preservadas',
  W.includes('html[data-theme="light"]{--line:rgba(60,50,20,.16);--txt:#241f13;--muted:#6d6553;--logo-cut:#fffdf6}') &&
  W.includes('html[data-theme="light"] .sidebar{background:rgba(255,253,246,.98);border-color:var(--line)}') &&
  W.includes('const FX_TEMAS={')
);

T('6. Botões, cartões e tipografia originais Fênix ativos uniformemente',
  W.includes('.btn{width:100%;margin-top:10px;') &&
  W.includes('linear-gradient(135deg,var(--gold),var(--gold2))') &&
  W.includes('font-family:Montserrat,sans-serif;')
);

T('7. 100% funções preservadas: Modo Local (R110), Soma (R109), Token IA (R108), Fênix IA',
  W.includes('const us0=loadUsers();') &&
  W.includes('function finFaltaReal(f)') &&
  W.includes('data-dsub="iatok"') &&
  W.includes('id="btnAnaliseIA"')
);

T('8. Sincronização sagrada: index-ui.html idêntico a index.html e 0 erros de sintaxe',
  W === WUI &&
  (() => {
    try {
      const scriptMatches = [...W.matchAll(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi)];
      const inlineScript = scriptMatches.find(m => !m[1].includes('src='));
      fs.writeFileSync('temp_r115_check.js', inlineScript[2]);
      execSync('node --check temp_r115_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r115_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r115_check.js')) fs.unlinkSync('temp_r115_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
