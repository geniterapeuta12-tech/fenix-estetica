/* R120 — FÊNIX SPARK & AGENT WORKSPACE + REMOÇÃO DO GERADOR DE POSTS */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));
const WB = fs.readFileSync(basePath + '/supabase/worker-live-backup.js', 'utf8');

T('1. Versão e versao.json com EXATAMENTE 5 melhorias canônicas',
  (W.includes("APP_VERSAO='1.6.94'") || W.includes("APP_VERSAO='1.6.95'") || W.includes("APP_VERSAO='1.6.96'")) &&
  (VJ.versao === '1.6.94' || VJ.versao === '1.6.95' || VJ.versao === '1.6.96') &&
  (VJ.r === 'R120' || VJ.r === 'R121' || VJ.r === 'R122') &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias.some(m => m.includes('Fênix Spark & Workspace')) &&
  VJ.melhorias.some(m => m.includes('I.A falante')) &&
  VJ.melhorias.some(m => m.includes('Geração inline de imagens'))
);

T('2. Backend worker-live-backup.js: instrução agêntica com I.A 100% falante e múltiplos canvas',
  WB.includes('FORMATO OBRIGATÓRIO da resposta: escreva PRIMEIRO entre <pensamento> e </pensamento>') &&
  WB.includes('DEPOIS, escreva entre <resposta> e </resposta> o seu diálogo completo com o usuário') &&
  WB.includes('NUNCA fique em silêncio nem responda apenas avisando que criou') &&
  WB.includes('<canvas tipo="texto|pdf" titulo="Título Claro do Documento">') &&
  WB.includes('Você tem liberdade total para gerar múltiplos arquivos se necessário')
);

T('3. Studio Sidebar: remoção do Gerador de Posts (7 itens nobres) e blindagem de rotas',
  !W.includes('data-sview="posts"') &&
  W.includes('data-sview="docs"') &&
  W.includes('data-sview="editor"') &&
  W.includes('data-sview="forms"') &&
  W.includes('data-sview="planilha"') &&
  W.includes('data-sview="perfil"') &&
  W.includes('data-sview="relatorios"') &&
  W.includes('data-sview="ia"') &&
  W.includes("if(state.mode==='studio'&&state.sview==='posts') state.sview='ia';") &&
  W.includes('id="viewPosts"') &&
  W.includes('display:none')
);

T('4. Fim da biblioteca estática: #iaSide 100% conversas sem #ia2tabs e sem #iaBibWrap',
  !W.includes('id="ia2tabs"') &&
  !W.includes('id="iaBibWrap"') &&
  W.includes('id="iaConvWrap"') &&
  W.includes('id="iaSide"')
);

T('5. Layout Split-View Desktop (42% / 58%) e Alternância Mobile (#iaMobSwitch)',
  W.includes('id="iaSplitContainer"') &&
  W.includes('id="iaChatPane"') &&
  W.includes('id="iaWorkspacePane"') &&
  W.includes('id="iaMobSwitch"') &&
  W.includes('id="btnSparkToggle"') &&
  W.includes('id="btnMobTabChat"') &&
  W.includes('id="btnMobTabWs"') &&
  W.includes('ia-mob-pill')
);

T('6. Catálogo FENIX_UI_GALLERY com as 40 telas canônicas de design do app',
  W.includes('const FENIX_UI_GALLERY = [') &&
  W.includes("id:'ui_login'") &&
  W.includes("id:'ui_facial_body'") &&
  W.includes("id:'ui_recibo_pdf'") &&
  W.includes("id:'ui_icone_marca'") &&
  W.includes('renderWsGallery()') &&
  W.includes('gerarMockupUi(')
);

T('7. Multi-artefatos, Prévia Inteligente (.ia-artifact-card), Flux Inline (.ia-img-card) e Lightbox',
  W.includes('class="ia-artifact-card"') &&
  W.includes('ia-btn-abrir-ws') &&
  W.includes('ia-btn-dl-pdf') &&
  W.includes('class="ia-img-card"') &&
  W.includes('ia-btn-expand-img') &&
  W.includes('ia-btn-dl-img') &&
  W.includes('id="iaLightboxModal"') &&
  W.includes('regexCanvas') &&
  W.includes('/ia-imagem')
);

T('8. Preservação integral + index-ui.html idêntico + Zero Erros de Sintaxe (node --check)',
  W === WUI &&
  W.includes('modalPasta') &&
  W.includes('vouchOpen') &&
  W.includes('storiesOpen') &&
  W.includes('perfilAuditOpen') &&
  (() => {
    try {
      const sIdx = W.indexOf('<script>');
      const eIdx = W.lastIndexOf('</script>');
      const inlineScript = W.substring(sIdx + 8, eIdx);
      fs.writeFileSync('temp_r120_check.js', inlineScript);
      execSync('node --check temp_r120_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r120_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r120_check.js')) fs.unlinkSync('temp_r120_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
