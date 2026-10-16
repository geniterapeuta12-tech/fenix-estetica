/* R130 — RECONSTRUÇÃO TOTAL DO COMEÇAR À CLÍNICA & UI LUXURY APPLE */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.7.4/1.7.5 + versao.json R130/R131 com 5 melhorias canônicas',
  (W.includes("APP_VERSAO='1.7.4'") || W.includes("APP_VERSAO='1.7.5'")) &&
  (VJ.versao === '1.7.4' || VJ.versao === '1.7.5') &&
  (VJ.r === 'R130' || VJ.r === 'R131') &&
  VJ.melhorias.length === 5
);

T('2. UI Luxury Apple Style no Splash: .splash-card, .splash-badge, .splash-btn e #btnSplashGo',
  W.includes('class="splash-card"') &&
  W.includes('class="splash-badge"') &&
  W.includes('class="btn gold splash-btn"') &&
  W.includes('id="btnSplashGo"') &&
  W.includes('onclick="iniciarSplash()"')
);

T('3. UI Luxury Apple Style no Welcome: .welcome-card, .welcome-badge, .welcome-btn e #btnWelcomeGo',
  W.includes('class="pmcard welcome-card"') &&
  W.includes('class="welcome-badge"') &&
  W.includes('class="btn gold welcome-btn"') &&
  W.includes('id="btnWelcomeGo"') &&
  W.includes('onclick="avancarWelcome()"')
);

T('4. Regras CSS R130 presentes para cards flutuantes, badges circulares e botões táteis',
  W.includes('.splash-card {') &&
  W.includes('.welcome-card {') &&
  W.includes('.splash-badge {') &&
  W.includes('.welcome-badge {') &&
  W.includes('.splash-btn, .welcome-btn {')
);

T('5. Fluidez e entrada imediata em avancarWelcome() e usuarioEntrou()',
  W.includes('function avancarWelcome(') &&
  W.includes('window.avancarWelcome = avancarWelcome;') &&
  W.includes('function usuarioEntrou(') &&
  W.includes("$('welcomeModal').classList.add('hidden');") &&
  W.includes("$('appScreen').classList.remove('hidden');")
);

T('6. Transição síncrona segura em iniciarSplash() sem retenção',
  W.includes('function iniciarSplash(') &&
  W.includes('window.iniciarSplash = iniciarSplash;') &&
  W.includes("$('splash')?.classList.add('hidden')")
);

T('7. index.html e index-ui.html 100% idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const js = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('tests/temp_lint_r130.js', js);
      execSync('node --check tests/temp_lint_r130.js', { stdio: 'pipe' });
      fs.unlinkSync('tests/temp_lint_r130.js');
      return true;
    } catch (e) {
      if (fs.existsSync('tests/temp_lint_r130.js')) fs.unlinkSync('tests/temp_lint_r130.js');
      return false;
    }
  })()
);

console.log(`\nTESTE R130: ${ok}/7 verificações passaram (${fail} falhas).`);
if (fail > 0) process.exit(1);
