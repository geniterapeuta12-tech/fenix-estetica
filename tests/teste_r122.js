/* R122 — SISTEMA DE AUTENTICAÇÃO REFORMULADO (LOGIN, CADASTRO, LEMBRETE E SELEÇÃO DE USUÁRIO) */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.96 + versao.json R122 com melhorias canônicas',
  W.includes("APP_VERSAO='1.6.96'") &&
  VJ.versao === '1.6.96' &&
  VJ.r === 'R122' &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias[0].includes('Sistema de Autenticação Reformulado')
);

T('2. Módulo FenixAuth arquitetado com métodos canônicos completos',
  W.includes('const FenixAuth = {') &&
  W.includes('init()') &&
  W.includes('onSplashStart()') &&
  W.includes('mostrarTelaAuth(form)') &&
  W.includes('fazerLogin(e)') &&
  W.includes('fazerCadastro(e)') &&
  W.includes('onWelcomeContinue()') &&
  W.includes('renderUserStep(modo)') &&
  W.includes('usuarioEntrou(u)') &&
  W.includes('entrarComCarregamento(fn)')
);

T('3. Remoção de atrasos artificiais e eliminação de efeito duplo de carregamento',
  !W.includes('temLembrete?5000:300') &&
  !W.includes('window.iniciarAppFenix') &&
  !W.includes('window.fecharWelcomeModal') &&
  (W.includes('usuarioEntrou(u){') || W.includes('usuarioEntrou(u) {')) &&
  W.includes("userModal") &&
  W.includes("classList.add('hidden')")
);

T('4. Formulários de Login, Cadastro e Central Fênix integrados com eye toggle',
  W.includes('FenixAuth.fazerLogin(e)') &&
  W.includes('FenixAuth.fazerCadastro(e)') &&
  W.includes('data-target="regSenha"') &&
  W.includes('data-target="loginSenha"')
);

T('5. Antigravity IDE UI / Fênix Spark preservado integralmente no #viewIa',
  W.includes('id="iaSplitContainer"') &&
  W.includes('id="iaChatPane"') &&
  W.includes('id="iaWorkspacePane"') &&
  W.includes('id="iaMobSwitch"') &&
  W.includes('id="btnSparkToggle"') &&
  W.includes('FENIX_UI_GALLERY') &&
  W.includes('class="ia-artifact-card"') &&
  W.includes('class="ia-img-card"')
);

T('6. index.html e index-ui.html idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const inlineScript = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('temp_r122_check.js', inlineScript);
      execSync('node --check temp_r122_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r122_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r122_check.js')) fs.unlinkSync('temp_r122_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/6)'));
process.exit(fail ? 1 : 0);
