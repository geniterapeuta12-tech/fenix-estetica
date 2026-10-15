/* R129 — AUTO-ENTRADA INSTANTÂNEA & ENTRADA DIRETA SEM TRAVA */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.7.3/1.7.4 + versao.json R129/R130 com 5 melhorias canônicas',
  (W.includes("APP_VERSAO='1.7.3'") || W.includes("APP_VERSAO='1.7.4'")) &&
  (VJ.versao === '1.7.3' || VJ.versao === '1.7.4') &&
  (VJ.r === 'R129' || VJ.r === 'R130') &&
  VJ.melhorias.length === 5 &&
  (VJ.melhorias.some(m => m.includes('Auto-Entrada Instantânea Sem Trava (R129)')) || VJ.melhorias.some(m => m.includes('Reconstrução Total do Começar à Clínica (R130)')))
);

T('2. Detecção de sessão no <head> e declaração prévia de iniciarSplash',
  W.includes('<script id="fenix-theme-boot">') &&
  W.includes("d.dataset.hasSession = '1'") &&
  W.includes("window.iniciarSplash = function") &&
  W.includes("localStorage.getItem('fenix_sessao')")
);

T('3. Regra CSS para descarte imediato do splash em sessões ativas',
  W.includes('/* R129 — AUTO-ENTRADA INSTANTÂNEA: se há sessão salva no aparelho, descarta o splash de imediato */') &&
  W.includes('html[data-has-session="1"] #splash {') &&
  W.includes('display: none !important;') &&
  W.includes('pointer-events: none !important;')
);

T('4. Auto-entrada direta no bootstrap() chamando entrarLocal imediatamente',
  W.includes('const lastKey = localStorage.getItem(S);') &&
  W.includes('entrarLocal(u, lastKey);') &&
  W.includes('return;') &&
  W.includes('window.__splashIniciado = true;')
);

T('5. entrarUI() sem retenção: entrada direta via usuarioEntrou(...)',
  W.includes("$('welcomeModal')?.classList.add('hidden')") &&
  W.includes('usuarioEntrou(wl);') &&
  W.includes('usuarioEntrou(us[0]);') &&
  W.includes('usuarioEntrou(dono);')
);

T('6. iniciarSplash() direto sem modal intermediário redundante rememberModal',
  W.includes('function iniciarSplash(') &&
  !W.slice(W.indexOf('function iniciarSplash('), W.indexOf('function iniciarSplash(') + 1800).includes("$('rememberModal')?.classList.remove('hidden')")
);

T('7. index.html e index-ui.html 100% idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const js = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('tests/temp_lint_r129.js', js);
      execSync('node --check tests/temp_lint_r129.js', { stdio: 'pipe' });
      fs.unlinkSync('tests/temp_lint_r129.js');
      return true;
    } catch (e) {
      if (fs.existsSync('tests/temp_lint_r129.js')) fs.unlinkSync('tests/temp_lint_r129.js');
      return false;
    }
  })()
);

console.log(`\nTESTE R129: ${ok}/7 verificações passaram (${fail} falhas).`);
if (fail > 0) process.exit(1);
