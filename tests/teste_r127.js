/* R127 — BLINDAGEM TOTAL DE ENTRADA + SPLASH & PRÉ-ENTRADA IMUNES A TRAVAMENTOS */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.7.1/1.7.2/1.7.3/1.7.4 + versao.json R127/R128/R129/R130 com 5 melhorias canônicas',
  (W.includes("APP_VERSAO='1.7.1'") || W.includes("APP_VERSAO='1.7.2'") || W.includes("APP_VERSAO='1.7.3'") || W.includes("APP_VERSAO='1.7.4'")) &&
  (VJ.versao === '1.7.1' || VJ.versao === '1.7.2' || VJ.versao === '1.7.3' || VJ.versao === '1.7.4') &&
  (VJ.r === 'R127' || VJ.r === 'R128' || VJ.r === 'R129' || VJ.r === 'R130') &&
  VJ.melhorias.length === 5 &&
  (VJ.melhorias[0].includes('Blindagem Total de Entrada (R127)') || VJ.melhorias[0].includes('R128') || VJ.melhorias[0].includes('R129') || VJ.melhorias[0].includes('R130'))
);

T('2. Blindagem CSS de #splash, #authScreen e botões de pré-entrada',
  W.includes('/* R127 — BLINDAGEM TOTAL DOS BOTÕES DE ENTRADA E SPLASH */') &&
  W.includes('#btnSplashGo') &&
  W.includes('pointer-events: auto !important') &&
  W.includes('#btnEntrar, #btnCriar, #btnFxOk, #btnRememberGo, #btnRememberOther, #btnWelcomeGo')
);

T('3. Definições antecipadas no topo do script com funções globais imediatas',
  W.includes('/* ==========================================================================\n   R127 — BLINDAGEM ANTECIPADA & EXECUÇÃO IMEDIATA DO FLUXO DE ENTRADA') &&
  W.includes('window.iniciarSplash = iniciarSplash;') &&
  W.includes('window.entrarLembrado = entrarLembrado;') &&
  W.includes('window.usarOutraConta = usarOutraConta;') &&
  W.includes('window.avancarWelcome = avancarWelcome;') &&
  W.includes('window.mostrarLogin = mostrarLogin;') &&
  W.includes('window.mostrarCadastro = mostrarCadastro;')
);

T('4. Splash e botão COMEÇAR protegidos contra travamentos e double-click',
  W.includes('window.__splashIniciado = true;') &&
  W.includes('id="btnSplashGo" type="button" onclick="iniciarSplash()"') &&
  W.includes('id="btnWelcomeGo" type="button" onclick="avancarWelcome()"') &&
  W.includes("$('splash')?.classList.add('hidden')")
);

T('5. Bootstrap assíncrono blindado contra reabertura acidental do splash',
  W.includes('if (!window.__splashIniciado)') &&
  W.includes('modalAtivo') &&
  W.includes('usuarioEntrou(')
);

T('6. Redesign Apple Luxury da Fênix I.A e Spark Workspace preservados',
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
      const inlineScript = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('temp_r127_check.js', inlineScript);
      execSync('node --check temp_r127_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r127_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r127_check.js')) fs.unlinkSync('temp_r127_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/7)'));
process.exit(fail ? 1 : 0);
