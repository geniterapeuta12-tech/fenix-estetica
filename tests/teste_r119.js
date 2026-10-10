/* R119 — GERADOR DE POSTS REAL (I.A DE IMAGEM FOTOGRÁFICA + COPY HUMANIZADA + MODOS DE VISUALIZAÇÃO) */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));
const WB = fs.readFileSync(basePath + '/supabase/worker-live-backup.js', 'utf8');

T('1. Versão 1.6.93 + versao.json R119 com EXATAMENTE 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.6.93'") &&
  VJ.versao === '1.6.93' &&
  VJ.r === 'R119' &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias[0].includes('Gerador de Posts real') &&
  VJ.melhorias[1].includes('Fim do modelo engessado') &&
  VJ.melhorias[2].includes('Foto Pura de Alto Padrão') &&
  VJ.melhorias[3].includes('regerar foto da I.A') &&
  VJ.melhorias[4].includes('100% de estabilidade')
);

T('2. Backend worker-live-backup.js: /ia-imagem destravado para fotografias reais de alta qualidade e IA_POST multi-formato',
  WB.includes('High-end luxury aesthetic clinic photography') &&
  !WB.includes('Abstract textures only — NO people, NO faces') &&
  WB.includes('"educativo | mito_verdade | pergunta | autoridade"') &&
  WB.includes('prompt_visual') &&
  WB.includes('titulo_arte')
);

T('3. Frontend: Seletor de Formato do Post em pílulas (#gpFormatos) com 5 formatos',
  W.includes('id="gpFormatos"') &&
  W.includes('data-gpformato="auto"') &&
  W.includes('data-gpformato="educativo"') &&
  W.includes('data-gpformato="mito_verdade"') &&
  W.includes('data-gpformato="pergunta"') &&
  W.includes('data-gpformato="autoridade"')
);

T('4. Frontend: Opções de Visualização da Imagem (#gpModosVis) com Foto Pura e Editorial',
  W.includes('id="gpModosVis"') &&
  W.includes('data-gpmodo="pura"') &&
  W.includes('data-gpmodo="editorial"') &&
  W.includes('MODO 1: Foto Pura de Alto Padrão') &&
  W.includes('MODO 2: Editorial / Revista')
);

T('5. Frontend: Botão 🔄 Gerar Outra Foto (#btnRegeneraFoto) e fluxo gpGeraFotoReal',
  W.includes('id="btnRegeneraFoto"') &&
  W.includes('function gpGeraFotoReal(') &&
  W.includes('btnRegeneraFoto')
);

T('6. Canvas gpDesenha exporta 1080x1080 com suporte aos modos Foto Pura e Editorial',
  W.includes('function gpDesenha(cv,g,fim)') &&
  W.includes("GP_MODO_VIS==='pura'") &&
  W.includes('drawCover(ctx,fim,1080,1080)')
);

T('7. Preservação integral de funções anteriores (Pastas R116, Pagamentos R117, Vouchers VIP R118, Stories R118)',
  W.includes('id="modalPasta"') &&
  W.includes('Sem vínculo (pagamento avulso / crédito da cliente)') &&
  W.includes('id="vouchOpen"') &&
  W.includes('id="storiesOpen"') &&
  W.includes('id="perfilAuditOpen"')
);

T('8. Sincronização sagrada: index-ui.html idêntico a index.html e 0 erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const scriptMatches = [...W.matchAll(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi)];
      const inlineScript = scriptMatches.find(m => !m[1].includes('src='));
      fs.writeFileSync('temp_r119_check.js', inlineScript[2]);
      execSync('node --check temp_r119_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r119_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r119_check.js')) fs.unlinkSync('temp_r119_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
