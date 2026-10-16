/* R128 — RECONSTRUÇÃO TOTAL DA ENTRADA & TEMA BLINDADO */
const fs = require('fs');
const { execSync } = require('child_process');
const vm = require('vm');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.7.2/1.7.3/1.7.4/1.7.5 + versao.json R128/R129/R130/R131 com 5 melhorias canônicas',
  (W.includes("APP_VERSAO='1.7.2'") || W.includes("APP_VERSAO='1.7.3'") || W.includes("APP_VERSAO='1.7.4'") || W.includes("APP_VERSAO='1.7.5'")) &&
  (VJ.versao === '1.7.2' || VJ.versao === '1.7.3' || VJ.versao === '1.7.4' || VJ.versao === '1.7.5') &&
  (VJ.r === 'R128' || VJ.r === 'R129' || VJ.r === 'R130' || VJ.r === 'R131') &&
  VJ.melhorias.length === 5 &&
  (VJ.melhorias.some(m => m.includes('Reconstrução Total da Entrada & Temas')) || VJ.melhorias.some(m => m.includes('Auto-Entrada Instantânea')) || VJ.melhorias.some(m => m.includes('Reconstrução Total do Começar à Clínica')) || VJ.melhorias.some(m => m.includes('Restauração do Login/Sincronização')))
);

T('2. Inicialização síncrona instantânea de tema e acento no <head>',
  W.includes('<script id="fenix-theme-boot">') &&
  W.includes("localStorage.getItem('fenix_theme')") &&
  W.includes("localStorage.getItem('fenix_accent')") &&
  W.includes("d.dataset.theme = (t === 'dark') ? 'dark' : 'light'") &&
  W.includes("st.setProperty('--gold', claro ? cfg.la : cfg.a)") &&
  W.includes("st.setProperty('--glow-c', cfg.g)")
);

T('3. Estilização completa do Splash e botões para tema claro e acentos',
  W.includes('/* R128 — RECONSTRUÇÃO TOTAL DE TEMA E ENTRADA BLINDADA */') &&
  W.includes('html[data-theme="light"] #splash') &&
  W.includes('html[data-theme="light"] #btnSplashGo') &&
  W.includes('html[data-theme="light"] #btnWelcomeGo') &&
  W.includes('html[data-theme="light"] #btnRememberGo')
);

T('4. .pmcard liberto da trava escura: suporte total e elegante ao tema claro',
  W.includes('html[data-theme="light"] .pmcard') &&
  W.includes('html[data-theme="light"] .pmcard .remcard') &&
  W.includes('html[data-theme="light"] .pmcard .btn.ghost') &&
  W.includes('html[data-theme="light"] .pmcard .mode-opt')
);

T('5. Entrada fluida sem trava ou camada redundante em entrarComCarregamento',
  W.includes('// R128: Entrada fluida — auto-avanço suave de boas-vindas sem travar') &&
  W.includes('avancarWelcome();') &&
  W.includes('window.iniciarSplash = iniciarSplash;') &&
  W.includes('window.avancarWelcome = avancarWelcome;')
);

T('6. Preservação integral do Fênix Spark, Apple Luxury e Galeria 40 UIs',
  W.includes('ia-comp-capsule') &&
  W.includes('ia-brand-head') &&
  W.includes('btnSparkToggle') &&
  W.includes('FENIX_UI_GALLERY') &&
  W.includes('ia-artifact-card')
);

T('7. index.html e index-ui.html idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const js = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('tests/temp_lint_r128.js', js);
      execSync('node --check tests/temp_lint_r128.js', { stdio: 'pipe' });
      fs.unlinkSync('tests/temp_lint_r128.js');
      return true;
    } catch (e) {
      if (fs.existsSync('tests/temp_lint_r128.js')) fs.unlinkSync('tests/temp_lint_r128.js');
      return false;
    }
  })()
);

console.log(`\nTESTE R128: ${ok}/7 verificações passaram (${fail} falhas).`);
if (fail > 0) process.exit(1);
