/* R131 — RECONEXÃO NUVEM & RESTAURAÇÃO DO LOGIN/SINCRONIZAÇÃO */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ❌ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.7.5 + versao.json R131 com 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.7.5'") &&
  VJ.versao === '1.7.5' &&
  VJ.r === 'R131' &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias[0].includes('Reconexão Nuvem & Restauração do Login/Sincronização (R131)')
);

T('2. Prioridade absoluta de sessão remota no bootstrap() com entrarRemoto()',
  W.includes('// R131 — 1. Prioridade absoluta: checa sessão remota ativa na nuvem') &&
  W.includes('const sessPromise = SB.auth.getSession();') &&
  W.includes('window.__pendRemoto = data.session.user;') &&
  W.includes('await entrarRemoto(data.session.user);')
);

T('3. Tela de login e cadastro totalmente acessível sem bypass silencioso para modo local',
  W.includes('Sem sessão remota ativa: garante que a tela de login/cadastro fique acessível') &&
  W.includes("document.documentElement.dataset.hasSession = '0';") &&
  W.includes("$('authScreen')?.classList.remove('hidden');") &&
  W.includes('mostrarLogin();')
);

T('4. Pré-preenchimento inteligente de login com foco na senha',
  W.includes("const ln = $('loginNome');") &&
  W.includes("ln.value = window.__pendLocal.u.clinica || window.__pendLocal.u.nome || window.__pendLocal.key;") &&
  W.includes("$('loginSenha')?.focus();")
);

T('5. IniciarSplash direciona para tela de autenticação segura se não autenticado',
  W.includes('window.iniciarSplash = function') &&
  W.includes("mostrarLogin();") &&
  !W.slice(W.indexOf('function iniciarSplash('), W.indexOf('function iniciarSplash(') + 1800).includes("entrarLocal(u, lk)")
);

T('6. Logout (sairDoApp) limpa sessão, reseta status e exibe login limpo',
  W.includes('async function sairDoApp()') &&
  W.includes('await SB.auth.signOut()') &&
  W.includes('localStorage.removeItem(S)') &&
  W.includes("document.documentElement.dataset.hasSession = '0'") &&
  W.includes("$('authScreen')?.classList.remove('hidden')")
);

T('7. index.html e index-ui.html 100% idênticos + Zero erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const js = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('tests/temp_lint_r131.js', js);
      execSync('node --check tests/temp_lint_r131.js', { stdio: 'pipe' });
      fs.unlinkSync('tests/temp_lint_r131.js');
      return true;
    } catch (e) {
      if (fs.existsSync('tests/temp_lint_r131.js')) fs.unlinkSync('tests/temp_lint_r131.js');
      return false;
    }
  })()
);

console.log(`\nTESTE R131: ${ok}/7 verificações passaram (${fail} falhas).`);
if (fail > 0) process.exit(1);
