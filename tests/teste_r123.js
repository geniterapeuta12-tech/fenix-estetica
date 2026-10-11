/* R123 — LOGIN CANÔNICO & REENTRADA BLINDADA + APPLE LUXURY FÊNIX I.A + FÊNIX SPARK WORKSPACE */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.97 + versao.json R123 com melhorias canônicas',
  W.includes("APP_VERSAO='1.6.97'") &&
  VJ.versao === '1.6.97' &&
  VJ.r === 'R123' &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias[0].includes('Autenticação Canônica e Reentrada Blindada')
);

T('2. Remoção completa de complexidades artificiais (FenixAuth completamente removido)',
  !W.includes('FenixAuth') &&
  !W.includes('window.iniciarAppFenix') &&
  !W.includes('window.fecharWelcomeModal') &&
  !W.includes('window.executarEntradaLembrada')
);

T('3. Fluxo canônico de login restaurado: entrarLocal, entrarRemoto, entrarUI e usuarioEntrou direto',
  W.includes('entrarComCarregamento') &&
  W.includes('usuarioEntrou') &&
  W.includes('entrarLocal(u,nome.toLowerCase())') &&
  W.includes("localStorage.setItem('fenix_user_ativo'") &&
  W.includes('btnWelcomeGo')
);

T('4. Redesign Apple Luxury da Fênix I.A preservado integralmente',
  W.includes('ia-comp-capsule') &&
  W.includes('ia-brand-head') &&
  W.includes('ia-chips-bar') &&
  W.includes('btnSparkToggle') &&
  W.includes('FENIX_UI_GALLERY') &&
  W.includes('ia-artifact-card') &&
  W.includes('ia-img-card')
);

T('5. index.html e index-ui.html idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const inlineScript = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('temp_r123_check.js', inlineScript);
      execSync('node --check temp_r123_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r123_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r123_check.js')) fs.unlinkSync('temp_r123_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/5)'));
process.exit(fail ? 1 : 0);
