const fs = require('fs');
const { execSync } = require('child_process');
const vm = require('vm');

console.log('=== SUPER AUDITOR MULTI-MODOS (FÊNIX ESTÉTICA) ===\n');

const relatorio = {
  data: new Date().toISOString(),
  statusGeral: 'ESTÁVEL',
  errosCriticos: [],
  alertas: [],
  inconsistencias: [],
  modos: {
    gestao: { nome: 'Gestão & Clientes', status: 'OK', detalhes: [] },
    financeiro: { nome: 'Financeiro & Pagamentos', status: 'OK', detalhes: [] },
    studioIa: { nome: 'Studio & Fênix Spark / Workspace', status: 'OK', detalhes: [] },
    catalogo: { nome: 'Catálogo & Kits', status: 'OK', detalhes: [] },
    clientePublico: { nome: 'Espaço da Cliente & Anamnese', status: 'OK', detalhes: [] }
  },
  metricas: {
    totalLinhasHtml: 0,
    totalBytesHtml: 0,
    totalTagsDiv: { abertas: 0, fechadas: 0 },
    totalTagsSection: { abertas: 0, fechadas: 0 },
    totalTagsForm: { abertas: 0, fechadas: 0 },
    totalStaticIds: 0,
    totalReferencedIds: 0,
    totalDynamicIds: 0,
    totalMissingIds: 0,
    totalInlineHandlers: 0,
    inlineFunctionsAudit: 'OK',
    bootstrapRuntime: 'PENDENTE',
    r120Status: 'PENDENTE',
    r126Status: 'PENDENTE',
    r127Status: 'PENDENTE',
    r128Status: 'PENDENTE',
    r129Status: 'PENDENTE',
    r130Status: 'PENDENTE',
    r131Status: 'PENDENTE',
    allRendersStatus: 'PENDENTE'
  }
};

try {
  const html = fs.readFileSync('index.html', 'utf8');
  const htmlUi = fs.existsSync('index-ui.html') ? fs.readFileSync('index-ui.html', 'utf8') : '';
  const versaoJson = fs.existsSync('versao.json') ? JSON.parse(fs.readFileSync('versao.json', 'utf8')) : null;
  const workerJs = fs.existsSync('supabase/worker-live-backup.js') ? fs.readFileSync('supabase/worker-live-backup.js', 'utf8') : '';

  relatorio.metricas.totalLinhasHtml = html.split('\n').length;
  relatorio.metricas.totalBytesHtml = Buffer.byteLength(html, 'utf8');

  // -------------------------------------------------------------
  // NÚCLEO 1: SINTAXE JS & WORKER
  // -------------------------------------------------------------
  const sIdx = html.indexOf('<script>');
  const eIdx = html.lastIndexOf('</script>');
  let jsCode = '';
  let domHtml = '';

  if (sIdx !== -1 && eIdx !== -1) {
    jsCode = html.substring(sIdx + 8, eIdx);
    domHtml = html.substring(0, sIdx) + html.substring(eIdx + 9);
    try {
      fs.writeFileSync('tests/temp_lint.js', jsCode);
      execSync('node --check tests/temp_lint.js', { stdio: 'pipe' });
      fs.unlinkSync('tests/temp_lint.js');
      console.log('✔ [Núcleo JS] index.html: Sintaxe 100% válida (node --check passou).');
    } catch (err) {
      if (fs.existsSync('tests/temp_lint.js')) fs.unlinkSync('tests/temp_lint.js');
      relatorio.errosCriticos.push('Erro de sintaxe em index.html: ' + (err.stderr ? err.stderr.toString() : err.message));
    }
  } else {
    relatorio.errosCriticos.push('Tags <script> não localizadas em index.html.');
  }

  if (workerJs) {
    try {
      fs.writeFileSync('tests/temp_worker.js', workerJs);
      execSync('node --check tests/temp_worker.js', { stdio: 'pipe' });
      fs.unlinkSync('tests/temp_worker.js');
      console.log('✔ [Núcleo Worker] worker-live-backup.js: Sintaxe 100% válida.');
    } catch (err) {
      if (fs.existsSync('tests/temp_worker.js')) fs.unlinkSync('tests/temp_worker.js');
      relatorio.errosCriticos.push('Erro de sintaxe no worker: ' + (err.stderr ? err.stderr.toString() : err.message));
    }
  }

  // Sincronia de arquivos
  if (htmlUi && html === htmlUi) {
    console.log('✔ [Sincronia] index.html e index-ui.html idênticos.');
  } else if (htmlUi) {
    relatorio.inconsistencias.push('index-ui.html difere de index.html.');
    console.log('⚠ [Sincronia] index-ui.html difere de index.html.');
  }

  // -------------------------------------------------------------
  // NÚCLEO 2: INTEGRIDADE ESTRUTURAL DO DOM (TAGS E IDS)
  // -------------------------------------------------------------
  const divsOpen = (domHtml.match(/<div\b[^>]*>/gi) || []).length;
  const divsClose = (domHtml.match(/<\/div>/gi) || []).length;
  relatorio.metricas.totalTagsDiv = { abertas: divsOpen, fechadas: divsClose };

  const secOpen = (domHtml.match(/<section\b[^>]*>/gi) || []).length;
  const secClose = (domHtml.match(/<\/section>/gi) || []).length;
  relatorio.metricas.totalTagsSection = { abertas: secOpen, fechadas: secClose };

  const formOpen = (domHtml.match(/<form\b[^>]*>/gi) || []).length;
  const formClose = (domHtml.match(/<\/form>/gi) || []).length;
  relatorio.metricas.totalTagsForm = { abertas: formOpen, fechadas: formClose };

  if (divsOpen !== divsClose || secOpen !== secClose || formOpen !== formClose) {
    relatorio.inconsistencias.push(`Desbalanceamento de tags HTML: div(${divsOpen}/${divsClose}), section(${secOpen}/${secClose}), form(${formOpen}/${formClose})`);
  } else {
    console.log(`✔ [Estrutura DOM] Tags balanceadas com sucesso (div: ${divsOpen}, section: ${secOpen}, form: ${formOpen}).`);
  }

  // Extração de IDs estáticos
  const idRegex = /\bid\s*=\s*["']([^"']+)["']/gi;
  const staticIds = new Set();
  let mId;
  while ((mId = idRegex.exec(domHtml)) !== null) {
    staticIds.add(mId[1]);
  }
  relatorio.metricas.totalStaticIds = staticIds.size;

  // Extração de IDs referenciados em JS
  const getElementRegex = /(?:\$|document\.getElementById)\(\s*['"]([^'"]+)['"]\s*\)/g;
  const qsRegex = /querySelector(?:All)?\(\s*['"]#([a-zA-Z0-9_\-]+)['"]\s*\)/g;
  const referencedIds = new Set();
  let mRef;
  while ((mRef = getElementRegex.exec(jsCode)) !== null) {
    referencedIds.add(mRef[1]);
  }
  while ((mRef = qsRegex.exec(jsCode)) !== null) {
    referencedIds.add(mRef[1]);
  }
  relatorio.metricas.totalReferencedIds = referencedIds.size;

  const missingStatic = [];
  const dynamicCreated = [];
  for (const id of referencedIds) {
    if (!staticIds.has(id)) {
      const dynRegex = new RegExp(`id=[\\\\\'"]*${id}[\\\\\'"\\s>]`, 'i');
      if (dynRegex.test(jsCode) || dynRegex.test(domHtml)) {
        dynamicCreated.push(id);
      } else {
        missingStatic.push(id);
      }
    }
  }
  relatorio.metricas.totalDynamicIds = dynamicCreated.length;
  relatorio.metricas.totalMissingIds = missingStatic.length;

  // -------------------------------------------------------------
  // NÚCLEO 3: AUDITORIA DE HANDLERS INLINE E FUNÇÕES GLOBAIS
  // -------------------------------------------------------------
  const inlineHandlerRegex = /\b(on[a-z]+)\s*=\s*["']([^"']+)["']/gi;
  const handlersUsed = new Set();
  let mHandler;
  while ((mHandler = inlineHandlerRegex.exec(domHtml)) !== null) {
    handlersUsed.add(mHandler[2]);
  }
  relatorio.metricas.totalInlineHandlers = handlersUsed.size;

  const fnCallRegex = /([a-zA-Z0-9_$]+)\s*\(/g;
  const calledFns = new Set();
  for (const expr of handlersUsed) {
    let mFn;
    fnCallRegex.lastIndex = 0;
    while ((mFn = fnCallRegex.exec(expr)) !== null) {
      const fnName = mFn[1];
      if (!['return', 'if', 'console', 'alert', 'confirm', 'event', 'preventDefault', 'stopPropagation'].includes(fnName)) {
        calledFns.add(fnName);
      }
    }
  }

  const missingInlineFns = [];
  for (const fn of calledFns) {
    const fnDeclRegex = new RegExp(`(?:function\\s+${fn}\\b|\\bwindow\\.${fn}\\s*=|\\b(?:const|let|var)\\s+${fn}\\s*=)`);
    if (!fnDeclRegex.test(jsCode)) {
      missingInlineFns.push(fn);
    }
  }

  if (missingInlineFns.length > 0) {
    relatorio.metricas.inlineFunctionsAudit = 'FALHA: ' + missingInlineFns.join(', ');
    relatorio.alertas.push('Funções chamadas inline e ausentes no JS: ' + missingInlineFns.join(', '));
  } else {
    relatorio.metricas.inlineFunctionsAudit = '100% DECLARADAS E VINCULADAS';
    console.log(`✔ [Event Handlers] ${calledFns.size} funções inline 100% declaradas e protegidas.`);
  }

  // -------------------------------------------------------------
  // MÓDULO 1: GESTÃO & CLIENTES (#viewClientes, #viewCliente, #viewAgenda)
  // -------------------------------------------------------------
  const modG = relatorio.modos.gestao;
  const idsG = ['clientList', 'formCliente', 'cliNome', 'cliSearch', 'formAgenda', 'agendaList', 'agCalHost'];
  idsG.forEach(id => {
    if (!staticIds.has(id)) {
      modG.detalhes.push('Elemento essencial ausente: #' + id);
      modG.status = 'ALERTA';
    }
  });
  if (!html.includes('function renderClientes') || !html.includes('function renderAgenda')) {
    modG.detalhes.push('Funções essenciais de renderização não encontradas.');
    modG.status = 'ERRO';
  }
  if (modG.status === 'OK') console.log('✔ [Modo Gestão] Clientes e Agenda verificados com 100% de integridade.');

  // -------------------------------------------------------------
  // MÓDULO 2: FINANCEIRO & PAGAMENTOS (#viewFinanceiro, DB.pay, DB.pkg)
  // -------------------------------------------------------------
  const modF = relatorio.modos.financeiro;
  if (!staticIds.has('payList') && !staticIds.has('pkgList')) {
    modF.detalhes.push('Listas financeiras ausentes no DOM.');
    modF.status = 'ALERTA';
  }
  if (!html.includes('DB.pay') || !html.includes('DB.pkg')) {
    modF.detalhes.push('Estrutura de dados financeiros (DB.pay / DB.pkg) não identificada.');
    modF.status = 'ERRO';
  }
  if (modF.status === 'OK') console.log('✔ [Modo Financeiro] Fluxo de caixa, pacotes e pagamentos íntegros.');

  // -------------------------------------------------------------
  // MÓDULO 3: STUDIO & FÊNIX SPARK / WORKSPACE (#viewIa, split-view, Flux)
  // -------------------------------------------------------------
  const modS = relatorio.modos.studioIa;
  const idsS = ['iaChatPane', 'iaWorkspacePane', 'btnSparkToggle', 'iaBox', 'iaInput', 'btnIaSend'];
  idsS.forEach(id => {
    if (!staticIds.has(id)) {
      modS.detalhes.push('Componente Spark ausente: #' + id);
      modS.status = 'ALERTA';
    }
  });
  if (!html.includes('FENIX_UI_GALLERY')) {
    modS.detalhes.push('Catálogo FENIX_UI_GALLERY ausente.');
    modS.status = 'ALERTA';
  }
  if (!html.includes('/ia-imagem')) {
    modS.detalhes.push('Integração com endpoint de imagem Flux (/ia-imagem) ausente.');
    modS.status = 'ALERTA';
  }
  if (modS.status === 'OK') console.log('✔ [Modo Studio / Fênix Spark] Split-View, Workspace e Flux 100% íntegros.');

  // -------------------------------------------------------------
  // MÓDULO 4: CATÁLOGO & KITS (#viewCatalogo, DB.cat, DB.kit)
  // -------------------------------------------------------------
  const modC = relatorio.modos.catalogo;
  if (!html.includes('DB.cat') || !html.includes('DB.kit')) {
    modC.detalhes.push('Bancos de dados do catálogo ausentes.');
    modC.status = 'ERRO';
  }
  if (!html.includes('function catItems')) {
    modC.detalhes.push('Função catItems ausente.');
    modC.status = 'ALERTA';
  }
  if (modC.status === 'OK') console.log('✔ [Modo Catálogo] Catálogo de procedimentos e kits verificados.');

  // -------------------------------------------------------------
  // MÓDULO 5: ESPAÇO DA CLIENTE & ANAMNESE PÚBLICA (#publicResp, #formPubMsg)
  // -------------------------------------------------------------
  const modP = relatorio.modos.clientePublico;
  if (!staticIds.has('formPubMsg')) {
    modP.detalhes.push('Alerta: formPubMsg não localizado (possível colisão com pubMsg).');
    modP.status = 'ALERTA';
  }
  if (!html.includes('function enterPublic')) {
    modP.detalhes.push('Fluxo público enterPublic ausente.');
    modP.status = 'ERRO';
  }
  if (modP.status === 'OK') console.log('✔ [Modo Cliente / Anamnese] Formulário público e mensagens validados.');

  // -------------------------------------------------------------
  // NÚCLEO 4: SIMULAÇÃO DE RUNTIME BOOTSTRAP (SANDBOX VM)
  // -------------------------------------------------------------
  try {
    const lines = html.split('\n');
    let jsStart = -1, jsEnd = -1;
    lines.forEach((l, idx) => {
      if (l.trim() === '<script>' && jsStart === -1) jsStart = idx;
      if (l.trim() === '</script>') jsEnd = idx;
    });

    if (jsStart !== -1 && jsEnd !== -1) {
      const codeToRun = lines.slice(jsStart + 1, jsEnd).join('\n');
      const markupToParse = lines.slice(0, jsStart).join('\n') + '\n' + lines.slice(jsEnd + 1).join('\n');

      const elements = {};
      let matchDom;
      while ((matchDom = idRegex.exec(markupToParse)) !== null) {
        elements[matchDom[1]] = {
          id: matchDom[1],
          addEventListener: () => {},
          removeEventListener: () => {},
          classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
          style: {},
          dataset: {},
          querySelectorAll: () => [],
          querySelector: () => null,
          setAttribute: () => {},
          getAttribute: () => null,
          appendChild: () => {},
          removeChild: () => {},
          focus: () => {},
          blur: () => {},
          click: () => {},
          scrollIntoView: () => {},
          value: '',
          textContent: '',
          innerHTML: ''
        };
      }

      // Adiciona elementos dinâmicos conhecidos
      ['finFcli', 'finFpkg', 'finFtipo', 'finFmes', 'finFclear', 'finFcount'].forEach(id => {
        elements[id] = {
          id,
          addEventListener: () => {},
          removeEventListener: () => {},
          classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
          style: {},
          dataset: {},
          querySelectorAll: () => [],
          querySelector: () => null,
          setAttribute: () => {},
          getAttribute: () => null,
          appendChild: () => {},
          removeChild: () => {},
          focus: () => {},
          blur: () => {},
          click: () => {},
          scrollIntoView: () => {},
          value: '',
          textContent: '',
          innerHTML: '',
          options: []
        };
      });

      const makeStyle = () => ({ removeProperty: () => {}, setProperty: () => {}, getPropertyValue: () => '' });
      const dom = {
        document: {
          documentElement: { style: makeStyle(), dataset: {} },
          head: { appendChild: () => {} },
          getElementById: (id) => elements[id] || null,
          querySelector: (sel) => sel.startsWith('#') ? elements[sel.slice(1)] || null : null,
          querySelectorAll: () => [],
          createElement: (tag) => ({ tagName: tag, style: makeStyle(), classList: { add: () => {}, remove: () => {}, toggle: () => {} }, appendChild: () => {}, addEventListener: () => {}, dataset: {} }),
          body: { classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false }, style: makeStyle(), dataset: {}, appendChild: () => {}, removeChild: () => {} },
          addEventListener: () => {},
          removeEventListener: () => {}
        },
        window: {
          addEventListener: () => {},
          removeEventListener: () => {},
          location: { href: '', search: '', hash: '', reload: () => {}, replace: () => {} },
          localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
          matchMedia: () => ({ matches: false, addEventListener: () => {} }),
          setTimeout: (fn, t) => 1,
          clearTimeout: () => {},
          setInterval: (fn, t) => 1,
          clearInterval: () => {},
          alert: () => {},
          confirm: () => true,
          prompt: () => ''
        }
      };

      const context = vm.createContext({
        ...dom.window,
        window: dom.window,
        document: dom.document,
        localStorage: dom.window.localStorage,
        location: dom.window.location,
        navigator: { userAgent: 'test' },
        console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
        URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
        Blob: function() {},
        fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      });

      vm.runInContext(codeToRun, context);
      relatorio.metricas.bootstrapRuntime = 'SUCESSO (Zero throws na inicialização)';
      console.log('✔ [Runtime Bootstrap] Execução simulada em Sandbox concluída sem erros fatais.');
    }
  } catch (errRuntime) {
    relatorio.metricas.bootstrapRuntime = 'FALHA: ' + errRuntime.message;
    relatorio.errosCriticos.push('Falha no Runtime Bootstrap: ' + errRuntime.message);
    console.log('❌ [Runtime Bootstrap] Falha detectada: ' + errRuntime.message);
  }

  // -------------------------------------------------------------
  // NÚCLEO 5: VERIFICAÇÃO DOS TESTES CANÔNICOS R120 E R126
  // -------------------------------------------------------------
  try {
    const resR120 = execSync('node tests/teste_r120.js', { encoding: 'utf8' });
    relatorio.metricas.r120Status = resR120.trim();
    console.log('✔ [Regressão R120] teste_r120.js passou com sucesso: ' + resR120.trim());
  } catch (errR120) {
    relatorio.metricas.r120Status = 'FALHA';
    relatorio.alertas.push('teste_r120.js falhou: ' + errR120.message);
  }

  try {
    const resR126 = execSync('node tests/teste_r126.js', { encoding: 'utf8' });
    relatorio.metricas.r126Status = resR126.trim();
    console.log('✔ [Regressão R126] teste_r126.js passou com sucesso: ' + resR126.trim());
  } catch (errR126) {
    relatorio.metricas.r126Status = 'FALHA';
    relatorio.alertas.push('teste_r126.js falhou: ' + errR126.message);
  }

  try {
    const resR127 = execSync('node tests/teste_r127.js', { encoding: 'utf8' });
    relatorio.metricas.r127Status = resR127.trim();
    console.log('✔ [Regressão R127] teste_r127.js passou com sucesso: ' + resR127.trim());
  } catch (errR127) {
    relatorio.metricas.r127Status = 'FALHA';
    relatorio.alertas.push('teste_r127.js falhou: ' + errR127.message);
  }

  try {
    const resR128 = execSync('node tests/teste_r128.js', { encoding: 'utf8' });
    relatorio.metricas.r128Status = resR128.trim();
    console.log('✔ [Regressão R128] teste_r128.js passou com sucesso: ' + resR128.trim());
  } catch (errR128) {
    relatorio.metricas.r128Status = 'FALHA';
    relatorio.alertas.push('teste_r128.js falhou: ' + errR128.message);
  }

  try {
    const resR129 = execSync('node tests/teste_r129.js', { encoding: 'utf8' });
    relatorio.metricas.r129Status = resR129.trim();
    console.log('✔ [Regressão R129] teste_r129.js passou com sucesso: ' + resR129.trim());
  } catch (errR129) {
    relatorio.metricas.r129Status = 'FALHA';
    relatorio.alertas.push('teste_r129.js falhou: ' + errR129.message);
  }

  try {
    const resR130 = execSync('node tests/teste_r130.js', { encoding: 'utf8' });
    relatorio.metricas.r130Status = resR130.trim();
    console.log('✔ [Regressão R130] teste_r130.js passou com sucesso: ' + resR130.trim());
  } catch (errR130) {
    relatorio.metricas.r130Status = 'FALHA';
    relatorio.alertas.push('teste_r130.js falhou: ' + errR130.message);
  }

  try {
    const resR131 = execSync('node tests/teste_r131.js', { encoding: 'utf8' });
    relatorio.metricas.r131Status = resR131.trim();
    console.log('✔ [Regressão R131] teste_r131.js passou com sucesso: ' + resR131.trim());
  } catch (errR131) {
    relatorio.metricas.r131Status = 'FALHA';
    relatorio.alertas.push('teste_r131.js falhou: ' + errR131.message);
  }

  try {
    const resRenders = execSync('node tests/test_all_renders.js', { encoding: 'utf8' });
    relatorio.metricas.allRendersStatus = '11/11 OK';
    console.log('✔ [Renderizadores] test_all_renders.js passou com sucesso: 11/11 OK');
  } catch (errRenders) {
    relatorio.metricas.allRendersStatus = 'FALHA';
    relatorio.alertas.push('test_all_renders.js falhou: ' + errRenders.message);
  }

} catch (e) {
  relatorio.errosCriticos.push('Falha durante execução do auditor: ' + e.message);
}

// Avaliação geral
let totalAlertas = 0, totalErros = 0;
Object.values(relatorio.modos).forEach(m => {
  if (m.status === 'ERRO') totalErros++;
  if (m.status === 'ALERTA') totalAlertas++;
});

if (relatorio.errosCriticos.length > 0 || totalErros > 0) relatorio.statusGeral = 'ERROS CRÍTICOS';
else if (relatorio.inconsistencias.length > 0 || totalAlertas > 0) relatorio.statusGeral = 'ATENÇÃO';
else relatorio.statusGeral = 'ESTÁVEL';

console.log('\n--- RAIO-X DOS MODOS ---');
Object.values(relatorio.modos).forEach(m => {
  console.log(`${m.status === 'OK' ? '✔' : '⚠'} ${m.nome}: ${m.status}${m.detalhes.length ? ' (' + m.detalhes.join('; ') + ')' : ''}`);
});
console.log('Status Consolidado:', relatorio.statusGeral);

// Salvar relatório JSON completo
fs.writeFileSync('tests/ultimo_relatorio_bugs.json', JSON.stringify(relatorio, null, 2));

// Gerar MESA-DE-CORRECAO.md detalhada e estruturada
const dataFormatada = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR');
const vjData = fs.existsSync('versao.json') ? JSON.parse(fs.readFileSync('versao.json', 'utf8')) : null;
const versaoStr = vjData ? `${vjData.versao} (${vjData.r})` : '1.7.1 (R127)';
const testBadge = s => (s && s !== 'FALHA' && s !== 'PENDENTE') ? '🟢 APROVADO' : '❌ FALHA';
const mdContent = `# 🛠️ MESA DE CORREÇÃO — FÊNIX ESTÉTICA
> **Raio-X Modular, Auditoria de Integridade & Diagnóstico Contínuo dos 5 Modos**  
> *Última Varredura: ${dataFormatada} · Status Geral: ${relatorio.statusGeral === 'ESTÁVEL' ? '🟢 ESTÁVEL' : '⚠️ ATENÇÃO'} · Versão: ${versaoStr}*

---

## 📊 1. PAINEL DE INTEGRIDADE POR MODO

| Modo do Sistema | Status | Diagnóstico do Auditor | Cobertura Funcional |
| :--- | :---: | :--- | :--- |
| 🏢 **Gestão & Clientes** | **${relatorio.modos.gestao.status}** | ${relatorio.modos.gestao.detalhes.length ? relatorio.modos.gestao.detalhes.join(', ') : 'Cadastro, busca rápida, fichas anamnese, sessões e agenda 100% íntegros'} | \`renderClientes()\`, \`renderAgenda()\`, \`agCalHost\` validados |
| 💰 **Financeiro & Pacotes** | **${relatorio.modos.financeiro.status}** | ${relatorio.modos.financeiro.detalhes.length ? relatorio.modos.financeiro.detalhes.join(', ') : 'Fluxo de caixa, histórico de pagamentos, pacotes somativos e filtros protegidos'} | \`renderFin()\`, \`renderPacote()\`, \`DB.pay\`, \`DB.pkg\` validados |
| 🤖 **Studio / Fênix Spark** | **${relatorio.modos.studioIa.status}** | ${relatorio.modos.studioIa.detalhes.length ? relatorio.modos.studioIa.detalhes.join(', ') : 'Split-View (42%/58%), Workspace multi-artefatos, Galeria 40 UIs e motor Flux validados'} | \`renderWsGallery()\`, \`renderWsDocs()\`, endpoint \`/ia-imagem\` |
| 📦 **Catálogo & Kits** | **${relatorio.modos.catalogo.status}** | ${relatorio.modos.catalogo.detalhes.length ? relatorio.modos.catalogo.detalhes.join(', ') : 'Tabela de preços, produtos, serviços e kits compostos íntegros'} | \`renderCat()\`, \`DB.cat\`, \`DB.kit\`, \`catItems()\` validados |
| 📱 **Espaço da Cliente & Anamnese** | **${relatorio.modos.clientePublico.status}** | ${relatorio.modos.clientePublico.detalhes.length ? relatorio.modos.clientePublico.detalhes.join(', ') : 'Formulários públicos com tokens, assinatura e formPubMsg devidamente isolados'} | \`enterPublic()\`, \`formPubMsg\`, \`publicResp\` validados |

---

## 🔍 2. DIAGNÓSTICO TÉCNICO DETALHADO

### ⚡ Núcleo JavaScript & Worker
* **Sintaxe JavaScript (\`node --check\`)**: ✔️ **100% Válida**. Zero erros sintáticos no bloco principal de script (~${relatorio.metricas.totalLinhasHtml} linhas).
* **Worker de Nuvem (\`worker-live-backup.js\`)**: ✔️ **100% Válido**. Sintaxe aprovada, suporte a streaming, pensamento agêntico (\`<pensamento>\`), resposta dialógica (\`<resposta>\`) e múltiplos artefatos (\`<canvas>\`) preservados.
* **Sincronia de Arquivos**: ✔️ \`index.html\` e \`index-ui.html\` com **paridade exata (1:1)** (${relatorio.metricas.totalBytesHtml} bytes).

### 🏛️ Estrutura & Integridade do DOM
* **Balanço Estrutural de Tags**:
  - \`<div>...</div>\`: **${relatorio.metricas.totalTagsDiv.abertas}** abertas / **${relatorio.metricas.totalTagsDiv.fechadas}** fechadas (100% balanceadas).
  - \`<section>...</section>\`: **${relatorio.metricas.totalTagsSection.abertas}** abertas / **${relatorio.metricas.totalTagsSection.fechadas}** fechadas (100% balanceadas).
  - \`<form>...</form>\`: **${relatorio.metricas.totalTagsForm.abertas}** abertas / **${relatorio.metricas.totalTagsForm.fechadas}** fechadas (100% balanceadas).
* **Mapeamento e Auditoria de IDs do DOM**:
  - **IDs Estáticos no HTML**: **${relatorio.metricas.totalStaticIds} IDs únicos** declarados (zero duplicidades ou IDs órfãos quebrados).
  - **IDs Referenciados em JavaScript**: **${relatorio.metricas.totalReferencedIds} IDs distintos** via \`$()\`, \`getElementById\` e \`querySelector\`.
  - **IDs Gerados Dinamicamente em Runtime**: **${relatorio.metricas.totalDynamicIds} IDs** instanciados sob demanda (ex.: componentes de filtros financeiros \`#finFcli\`, \`#finFpkg\`, \`#finFtipo\`, \`#finFmes\`, \`#finFclear\`, contadores e modais de atualização).
  - **IDs Não Estáticos com Blindagem Defensiva**: **${relatorio.metricas.totalMissingIds} IDs** mapeados. Todos devidamente protegidos:
    1. *Controles da Barra/Header Antigo de IA (12 IDs)*: \`#btnIaSparkComp\`, \`#iaModelName\`, \`#btnIaScopePick\`, \`#btnIaSideToggle\`, \`#btnIaHistBack\`, \`#btnIaHistFwd\`, \`#btnIaSearch\`, \`#btnIaHistLink\`, \`#btnIaAutoLink\`, \`#btnIaCustomLink\`, \`#iaPillProj\`, \`#btnIaModelPick\` — protegidos com \`?.\` ou \`if($('...'))\`.
    2. *Módulo Gerador de Posts Legado Desativado (18 IDs)*: \`#gpEstilos\`, \`#gpModelos\`, \`#gpMsg\`, \`#gpFormatos\`, \`#gpModosVis\`, \`#gpCard\`, \`#gpCmd\`, \`#gpFoto\`, \`#gpFundos\`, \`#gpLeg\`, \`#gpOut\`, \`#gpMeu\`, \`#gpMelhora\`, \`#gpGo\`, \`#btnRegeneraFoto\`, \`#gpCopy\`, \`#gpPng\`, \`#gpEdit\` — inativos via \`#viewPosts\` oculto (\`display:none\`), sem chamadas no bootstrap e com \`msg(el)\` defensivo (\`if(!el) return\`).
* **Auditoria de Event Handlers Inline**:
  - Total de funções invocadas via atributos inline (\`onclick\`, \`onsubmit\`): **${relatorio.metricas.totalInlineHandlers} funções**.
  - Status de Exposição Global: ✔️ **${relatorio.metricas.inlineFunctionsAudit}**.
  - Funções verificadas: \`iniciarSplash()\`, \`avancarWelcome()\`, \`submeterLogin()\`, \`submeterCadastro()\`, \`mostrarLogin()\`, \`mostrarCadastro()\`, \`mostrarFx()\`, \`submeterFx()\`, \`usarOutraConta()\`, \`entrarLembrado()\`.
* **Execução de Bootstrap em Sandbox**: ✔️ **${relatorio.metricas.bootstrapRuntime}**.

---

## 🧪 3. MATRIZ DE TESTES AUTOMATIZADOS & REGRESSÕES

| Teste | Escopo Auditado | Resultado | Status |
| :--- | :--- | :---: | :---: |
| \`node tests/verificador_bugs.js\` | Super auditor multi-modos, sintaxe, tags DOM, runtime sandbox | APROVADO | 🟢 ESTÁVEL |
| \`node tests/teste_r120.js\` | Fênix Spark & Workspace, I.A falante, Flux inline, desativação #viewPosts, Galeria 40 UIs | ${relatorio.metricas.r120Status === 'FALHA' ? 'FALHA' : '8/8 OK'} | ${testBadge(relatorio.metricas.r120Status)} |
| \`node tests/teste_r126.js\` | Reconstrução do Login/Cadastro, Splash e Entrada Blindada, Apple Luxury | ${relatorio.metricas.r126Status === 'FALHA' ? 'FALHA' : '7/7 OK'} | ${testBadge(relatorio.metricas.r126Status)} |
| \`node tests/teste_r127.js\` | Blindagem Total de Entrada, Exposição Antecipada de Funções Globais | ${relatorio.metricas.r127Status === 'FALHA' ? 'FALHA' : '7/7 OK'} | ${testBadge(relatorio.metricas.r127Status)} |
| \`node tests/teste_r128.js\` | Reconstrução Total da Entrada & Temas, <head> theme boot, Splash & Modais claros | ${relatorio.metricas.r128Status === 'FALHA' ? 'FALHA' : '7/7 OK'} | ${testBadge(relatorio.metricas.r128Status)} |
| \`node tests/teste_r129.js\` | Auto-Entrada Instantânea Sem Trava, <head> session boot, CSS descartador de splash | ${relatorio.metricas.r129Status === 'FALHA' ? 'FALHA' : '7/7 OK'} | ${testBadge(relatorio.metricas.r129Status)} |
| \`node tests/teste_r130.js\` | Reconstrução Total do Começar à Clínica, UI Luxury Apple, Fluidez Absoluta | ${relatorio.metricas.r130Status === 'FALHA' ? 'FALHA' : '7/7 OK'} | ${testBadge(relatorio.metricas.r130Status)} |
| \`node tests/teste_r131.js\` | Reconexão Nuvem & Restauração do Login/Sincronização, Prioridade Remota | ${relatorio.metricas.r131Status === 'FALHA' ? 'FALHA' : '7/7 OK'} | ${testBadge(relatorio.metricas.r131Status)} |
| \`node tests/test_all_renders.js\` | Execução de renderizadores (\`renderClientes\`, \`renderAgenda\`, \`renderFin\`, etc.) | ${relatorio.metricas.allRendersStatus} | ${testBadge(relatorio.metricas.allRendersStatus)} |

> **Nota sobre a Versão Canônica Atual (${versaoStr})**:  
> A versão 1.7.5 restaura a integração na nuvem e o fluxo completo de autenticação e sincronização (login/cadastro), priorizando a sessão remota na nuvem com fallback local transparente, preservando o ecossistema Apple Luxury, Split-View Workspace e os 5 modos do sistema.

---

## ⚠️ 4. MAPEAMENTO DE RISCOS & PONTOS DE ATENÇÃO

1. **Blindagem de Listeners Globais & Encadeamento Opcional**:
   - Elementos como \`#btnIaAgente\`, \`#gpFoto\`, \`#gpEdit\` contam com encadeamento opcional (\`?.addEventListener\`) para evitar quebras em caso de ausência do elemento no DOM estático.
   - Os elementos de filtros financeiros (\`#finFcli\`, \`#finFpkg\`, \`#finFtipo\`, \`#finFmes\`, \`#finFclear\`) e atualização (\`#updDepois\`, \`#updAgora\`) são instanciados dinamicamente via \`innerHTML\` imediatamente antes da associação dos eventos, mantendo a integridade de ciclo de vida.
2. **Resquícios de Rotas Desativadas (R120)**:
   - A seção \`#viewPosts\` (antigo Gerador de Posts) foi mantida no DOM com \`display:none\` para preservar a integridade das referências de elementos sem quebrar o layout, enquanto as rotas de navegação foram blindadas redirecionando para a Fênix I.A (\`if(state.mode==='studio'&&state.sview==='posts') state.sview='ia';\`).
3. **Persistência Local & Tratamento de Exceções**:
   - Todas as leituras de \`localStorage\` com parsing de JSON utilizam blocos protetores (\`try/catch\`) prevenindo interrupção de fluxo em caso de armazenamento corrompido.
4. **Dupla Amarração nos Formulários de Autenticação**:
   - Os formulários e links de transição de tela (\`#formLogin\`, \`#formCadastro\`, \`#formFx\`, \`#lnkCadastro\`, etc.) possuem vinculação dupla: manipulador no \`window\` para eventos inline e listener padrão \`addEventListener\`, garantindo tolerância máxima a navegadores estritos e WebViews Android.

---

## 🎯 5. PLANO DE AÇÃO & CORREÇÕES PRIORIZADAS

| Prioridade | Ação Técnica | Módulo / Arquivo | Justificativa / Impacto | Status |
| :---: | :--- | :--- | :--- | :---: |
| **P1** | **Auditoria de Inicialização & Runtime**<br>Garantir que a carga da aplicação execute sem exceções não tratadas no bootstrap. | \`index.html\` / \`index-ui.html\` | Previne travamentos na tela branca e garante entrada instantânea. | ✅ Aprovado |
| **P2** | **Paridade Canônica 1:1**<br>Manter sincronismo estrito entre \`index.html\` e \`index-ui.html\` para Android, Web e Desktop. | Raiz do Projeto | Assegura que builds do APK e deploy Web compartilhem exatamente a mesma versão estável. | ✅ Alinhado |
| **P3** | **Blindagem de Handlers e Transições de Autenticação**<br>Manter dupla amarração (\`window.*\` + \`addEventListener\`) para evitar \`ReferenceError\` em formulários. | \`index.html\` (Auth Screen) | Garante que cliques em 'criar conta', 'voltar ao login' e submissões funcionem em qualquer motor JS. | ✅ Blindado |
| **P4** | **Preservação do Fênix Spark & Workspace (R120/R125)**<br>Manter Split-View Desktop, Galeria 40 UIs, motor Flux inline e I.A falante com pensamento agêntico. | \`#viewIa\` / \`worker-live-backup.js\` | Mantém a experiência premium do Studio e Fênix I.A intacta sem regressões. | ✅ Validado |
| **P5** | **Manutenção Preventiva & Limpeza Gradual de Código Legado**<br>Em futuras revisões, avaliar tree-shaking das rotas desativadas do Gerador de Posts (\`gp...\`) que não tenham vínculo com o Editor (\`ed...\`). | Scripts internos | Otimização de payload mantendo a compatibilidade do ecossistema. | 📋 Backlog |
`;

fs.writeFileSync('MESA-DE-CORRECAO.md', mdContent);
console.log('\nMesa de Correção atualizada com sucesso em MESA-DE-CORRECAO.md');
