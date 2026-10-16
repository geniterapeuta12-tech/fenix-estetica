/* TESTE DE SIMULAÇÃO DO FLUXO DE ENTRADA DO APP (R131) */
const fs = require('fs');
const vm = require('vm');

console.log('=== TESTE DE SIMULAÇÃO DE ENTRADA R131 ===\n');

const htmlPath = fs.existsSync('index.html') ? 'index.html' : 'PACOTE-ANTIGRAVITY/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Simulação do <head> boot
function simularHeadBoot(storage) {
  const d = { dataset: {}, style: { setProperty: () => {} } };
  const keys = Object.keys(storage);
  const mockLocalStorage = {
    length: keys.length,
    key: (i) => keys[i] || null,
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); }
  };
  
  // Executa o snippet exato do fenix-theme-boot
  const bootCode = `
    var t = localStorage.getItem('fenix_theme') || 'light';
    var a = localStorage.getItem('fenix_accent') || 'terraco';
    var u = 'classica';
    d.dataset.theme = (t === 'dark') ? 'dark' : 'light';
    d.dataset.accent = a;
    d.dataset.ui = u;
    var s = localStorage.getItem('fenix_sessao');
    var sbTok = null;
    try {
      if (typeof localStorage.key === 'function' && typeof localStorage.length === 'number') {
        for (var i = 0; i < localStorage.length; i++) {
          var ki = localStorage.key(i);
          if (ki && ki.indexOf('sb-') === 0 && ki.indexOf('-auth-token') !== -1) {
            sbTok = localStorage.getItem(ki);
            break;
          }
        }
      }
      if (!sbTok) {
        for (var k in localStorage) {
          if (k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') !== -1) {
            sbTok = localStorage.getItem(k);
            break;
          }
        }
      }
    } catch (_) {}
    if (s && s.trim() && sbTok) {
      d.dataset.hasSession = '1';
    }
  `;
  const ctx = vm.createContext({ localStorage: mockLocalStorage, d });
  vm.runInContext(bootCode, ctx);
  return d;
}

// Teste 1: Sessão remota ativa existente (com token Supabase) -> hasSession === '1'
const d1 = simularHeadBoot({ fenix_sessao: 'clinica_bella', 'sb-123-auth-token': 'token_valido', fenix_theme: 'light', fenix_accent: 'terraco' });
if (d1.dataset.hasSession === '1' && d1.dataset.theme === 'light' && d1.dataset.accent === 'terraco') {
  console.log('✔ Teste 1: Head boot detecta sessão com token e define data-has-session="1".');
} else {
  console.error('❌ Teste 1 falhou:', d1.dataset);
  process.exit(1);
}

// Teste 2: Sem sessão ativa ou sem token -> hasSession é undefined (para mostrar login)
const d2 = simularHeadBoot({ fenix_sessao: 'clinica_bella' });
if (d2.dataset.hasSession === undefined && d2.dataset.theme === 'light') {
  console.log('✔ Teste 2: Head boot sem token Supabase mantém tela limpa para autenticação.');
} else {
  console.error('❌ Teste 2 falhou:', d2.dataset);
  process.exit(1);
}

// Teste 3: Verificação de regras de entrada no código R131
const checks = [
  { name: 'CSS data-has-session presente para descarte condicional de splash', test: html.includes('html[data-has-session="1"] #splash') && html.includes('display: none !important;') },
  { name: 'Bootstrap prioriza sessão remota da nuvem e expõe login seguro', test: html.includes('const sessPromise = SB.auth.getSession();') && html.includes('await entrarRemoto(data.session.user);') && html.includes('mostrarLogin();') },
  { name: 'entrarUI descarta welcomeModal e chama usuarioEntrou diretamente', test: html.includes("$('welcomeModal')?.classList.add('hidden')") && html.includes('usuarioEntrou(wl);') },
  { name: 'iniciarSplash nunca abre rememberModal', test: !html.slice(html.indexOf('function iniciarSplash('), html.indexOf('function iniciarSplash(') + 1500).includes("$('rememberModal')?.classList.remove('hidden')") },
  { name: 'Fast-path iniciarSplash definido no head', test: html.includes('window.iniciarSplash = function') && html.indexOf('window.iniciarSplash = function') < html.indexOf('<style>') }
];

checks.forEach(c => {
  if (c.test) {
    console.log('✔ ' + c.name);
  } else {
    console.error('❌ Falha na verificação: ' + c.name);
    process.exit(1);
  }
});

console.log('\nTODOS OS TESTES DE FLUXO DE ENTRADA DO APP PASSARAM COM 100% DE SUCESSO!');
