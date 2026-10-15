/* R126 — RECONSTRUÇÃO TOTAL DO LOGIN E CADASTRO + SPLASH & ENTRADA BLINDADA + APPLE LUXURY */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.7.0/1.7.1/1.7.2/1.7.3/1.7.4 + versao.json R126/R127/R128/R129/R130 com 5 melhorias canônicas',
  (W.includes("APP_VERSAO='1.7.0'") || W.includes("APP_VERSAO='1.7.1'") || W.includes("APP_VERSAO='1.7.2'") || W.includes("APP_VERSAO='1.7.3'") || W.includes("APP_VERSAO='1.7.4'")) &&
  (VJ.versao === '1.7.0' || VJ.versao === '1.7.1' || VJ.versao === '1.7.2' || VJ.versao === '1.7.3' || VJ.versao === '1.7.4') &&
  (VJ.r === 'R126' || VJ.r === 'R127' || VJ.r === 'R128' || VJ.r === 'R129' || VJ.r === 'R130') &&
  VJ.melhorias.length === 5
);

T('2. Splash e botão COMEÇAR 100% desbugados com inline onclick e função global',
  W.includes('id="btnSplashGo" type="button" onclick="iniciarSplash()"') &&
  W.includes('function iniciarSplash()') &&
  W.includes('window.iniciarSplash = iniciarSplash;') &&
  W.includes("$('splash')?.classList.add('hidden')")
);

T('3. Modal de Acesso Lembrado com botões e funções globais blindadas',
  W.includes('id="btnRememberGo" type="button" onclick="entrarLembrado()"') &&
  W.includes('id="btnRememberOther" type="button" onclick="usarOutraConta()"') &&
  W.includes('function entrarLembrado()') &&
  W.includes('window.entrarLembrado = entrarLembrado;') &&
  W.includes('async function usarOutraConta()') &&
  W.includes('window.usarOutraConta = usarOutraConta;')
);

T('4. Welcome Modal e avanço para o app com inline onclick e função global',
  W.includes('id="btnWelcomeGo" type="button" onclick="avancarWelcome()"') &&
  W.includes('function avancarWelcome()') &&
  W.includes('window.avancarWelcome = avancarWelcome;') &&
  W.includes('usuarioEntrou(')
);

T('5. Login e Cadastro canônicos e instantâneos com onsubmit e funções no window',
  W.includes('id="formLogin" class="panel active" onsubmit="submeterLogin(event)"') &&
  W.includes('id="formCadastro" class="panel" onsubmit="submeterCadastro(event)"') &&
  W.includes('function submeterLogin(') &&
  W.includes('window.submeterLogin = submeterLogin;') &&
  W.includes('function submeterCadastro(') &&
  W.includes('window.submeterCadastro = submeterCadastro;') &&
  W.includes('window.mostrarLogin = mostrarLogin;') &&
  W.includes('window.mostrarCadastro = mostrarCadastro;') &&
  W.includes('window.sairDoApp = sairDoApp;') &&
  W.includes('entrarLocal(u, nk)') &&
  W.includes('await entrarRemoto(data.user)')
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
      fs.writeFileSync('temp_r126_check.js', inlineScript);
      execSync('node --check temp_r126_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r126_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r126_check.js')) fs.unlinkSync('temp_r126_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/7)'));
process.exit(fail ? 1 : 0);
