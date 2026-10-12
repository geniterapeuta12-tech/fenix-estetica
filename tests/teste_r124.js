/* R124 — ENTRADA E AUTENTICAÇÃO TOTALMENTE RECRIADAS + AUTO-ENTRY + APPLE LUXURY */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.98 + versao.json R124 com melhorias canônicas',
  W.includes("APP_VERSAO='1.6.98'") &&
  VJ.versao === '1.6.98' &&
  VJ.r === 'R124' &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias[0].includes('Entrada e Autenticação Totalmente Recriadas')
);

T('2. Entrada com auto-entry direto para dono único e inicialização automática de equipe',
  W.includes('us.length === 1') &&
  W.includes('!us || us.length === 0') &&
  W.includes('nomeDono = ($(\'appClinic\')') &&
  W.includes('usuarioEntrou(dono)') &&
  W.includes('btnWelcomeGo')
);

T('3. Inicialização segura no bootstrap com checagem local síncrona e timeout na nuvem',
  W.includes('localStorage.getItem(S)') &&
  W.includes('timeoutPromise') &&
  W.includes('btnSplashGo') &&
  W.includes('entrarComCarregamento')
);

T('4. Logout limpo com fechamento total de modais e reentrada direta sem travas',
  W.includes('btnSair') &&
  W.includes("$('welcomeModal').classList.add('hidden')") &&
  W.includes("$('userModal').classList.add('hidden')") &&
  W.includes("$('rememberModal').classList.add('hidden')")
);

T('5. Redesign Apple Luxury da Fênix I.A e Spark Workspace preservados',
  W.includes('ia-comp-capsule') &&
  W.includes('ia-brand-head') &&
  W.includes('btnSparkToggle') &&
  W.includes('FENIX_UI_GALLERY') &&
  W.includes('ia-artifact-card')
);

T('6. index.html e index-ui.html idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const inlineScript = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('temp_r124_check.js', inlineScript);
      execSync('node --check temp_r124_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r124_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r124_check.js')) fs.unlinkSync('temp_r124_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/6)'));
process.exit(fail ? 1 : 0);
