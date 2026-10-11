/* R121 — LOGIN CANÔNICO RESTAURADO + ANTIGRAVITY IDE UI + FÊNIX SPARK WORKSPACE */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão e versao.json com melhorias canônicas',
  (W.includes("APP_VERSAO='1.6.95'") || W.includes("APP_VERSAO='1.6.96'")) &&
  (VJ.versao === '1.6.95' || VJ.versao === '1.6.96') &&
  (VJ.r === 'R121' || VJ.r === 'R122') &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias.some(m => m.includes('Login Canônico') || m.includes('Sistema de Autenticação'))
);

T('2. Remoção completa de artificial wrappers de login (iniciarAppFenix, fecharWelcomeModal, etc.)',
  !W.includes('window.iniciarAppFenix') &&
  !W.includes('window.fecharWelcomeModal') &&
  !W.includes('window.executarEntradaLembrada') &&
  !W.includes('window.usarOutraConta') &&
  !W.includes('window.atualizarCardLembrado') &&
  !W.includes('window.preencherLoginLembrado') &&
  !W.includes('onclick="fecharWelcomeModal()"') &&
  !W.includes('onclick="iniciarAppFenix()"')
);

T('3. Fluxo canônico de login restaurado: entrarComCarregamento, pedirSenha e usuarioEntrou limpo',
  W.includes('entrarComCarregamento') &&
  W.includes('usuarioEntrou') &&
  W.includes("localStorage.setItem('fenix_user_ativo'") &&
  W.includes('btnWelcomeGo')
);

T('4. Antigravity IDE UI / Fênix Spark preservado integralmente no #viewIa',
  W.includes('id="iaSplitContainer"') &&
  W.includes('id="iaChatPane"') &&
  W.includes('id="iaWorkspacePane"') &&
  W.includes('id="iaMobSwitch"') &&
  W.includes('id="btnSparkToggle"') &&
  W.includes('FENIX_UI_GALLERY') &&
  W.includes('class="ia-artifact-card"') &&
  W.includes('class="ia-img-card"')
);

T('5. index.html e index-ui.html idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const inlineScript = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('temp_r121_check.js', inlineScript);
      execSync('node --check temp_r121_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r121_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r121_check.js')) fs.unlinkSync('temp_r121_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/5)'));
process.exit(fail ? 1 : 0);
