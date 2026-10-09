/* R114 — REDESIGN APPLE LUXURY + LIMPEZA DE APARÊNCIA + BUILD & AUTO-UPDATE TOTAL */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.88 + versao.json R114 com EXATAMENTE 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.6.88'") &&
  VJ.versao === '1.6.88' &&
  VJ.r === 'R114' &&
  VJ.melhorias.length === 5
);

T('2. Limpeza em Dados > Aparência (#cardUI e #cardCores ocultos)',
  (W.includes('id="cardUI"') || W.includes('#cardUI')) &&
  W.includes('#cardCores') &&
  W.includes('display:none!important')
);

T('3. Design System Apple: Canvas #F5F5F7, Frosted Glass e Specular Lighting',
  W.includes('#F5F5F7') &&
  W.includes('backdrop-filter: blur(24px) saturate(190%)') &&
  W.includes('inset 0 1px 0 rgba(255, 255, 255, 0.95)')
);

T('4. Cores Apple: Apple System Blue #0071E3 e Badges Cápsulas de Joia Translúcidas',
  W.includes('#0071E3') &&
  W.includes('rgba(52, 199, 89, 0.12)') &&
  W.includes('rgba(255, 149, 0, 0.12)') &&
  W.includes('rgba(255, 59, 48, 0.12)')
);

T('5. Geometria contínua Apple: squircles 22px / 26px e botões em pílula 9999px',
  W.includes('border-radius: 22px') &&
  W.includes('border-radius: 26px') &&
  W.includes('border-radius: 9999px')
);

T('6. Física de mola Apple Spring e feedback tátil de press',
  W.includes('cubic-bezier(0.16, 1, 0.3, 1)') &&
  W.includes('scale(0.965)')
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
      fs.writeFileSync('temp_r114_check.js', inlineScript[2]);
      execSync('node --check temp_r114_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r114_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r114_check.js')) fs.unlinkSync('temp_r114_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
