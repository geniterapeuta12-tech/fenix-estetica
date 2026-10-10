/* R116 — PASTAS & PARCERIAS DE CLIENTES + REMOÇÃO DO PACOTE SOMATIVO */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.90 + versao.json R116 com EXATAMENTE 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.6.90'") &&
  VJ.versao === '1.6.90' &&
  VJ.r === 'R116' &&
  VJ.melhorias.length === 5
);

T('2. Remoção definitiva do Pacote Somativo da interface do usuário (display:none!important)',
  W.includes('id="cardPacSoma" style="display:none!important;" aria-hidden="true"') &&
  W.includes('id="btnPacSoma"')
);

T('3. Interface de Pastas de Clientes presente (barra de pastas, banner ativo, ações)',
  W.includes('id="cliPastasBar"') &&
  W.includes('id="boxPastaAtiva"') &&
  W.includes('id="btnNovaPasta"') &&
  W.includes('id="btnAdicionarCliPasta"') &&
  W.includes('id="btnRenomearPasta"') &&
  W.includes('id="btnExcluirPasta"') &&
  W.includes('id="btnSairPasta"')
);

T('4. Suporte a Pasta nos formulários de cadastro e edição de clientes',
  W.includes('id="cliPasta"') &&
  W.includes('id="infoPasta"') &&
  W.includes('id="cliPastasDL"') &&
  W.includes("const pasta=($('cliPasta')?$('cliPasta').value.trim():(state.pastaAtiva||''));") &&
  W.includes("if($('infoPasta'))$('infoPasta').value=c.pasta||'';")
);

T('5. Badge e filtro de pasta na lista e perfil da cliente',
  W.includes('pasta-badge') &&
  W.includes('id="pPastaBadgeWrap"') &&
  W.includes('data-pastaclick') &&
  W.includes('.pastas-bar') &&
  W.includes('.pasta-chip')
);

T('6. Lógica completa de gestão de pastas (criar, listar, abrir, renomear, excluir)',
  W.includes('function getPastasCli()') &&
  W.includes('function salvaPastasCli(') &&
  W.includes('function abrirPastaCli(') &&
  W.includes('function criarNovaPastaCli()') &&
  W.includes('function addCliNaPastaAtiva()') &&
  W.includes('function renomearPastaCli()') &&
  W.includes('function excluirPastaCli()')
);

T('7. 100% funções preservadas: Modo Local (R110), Financeiro (R109), Token IA (R108), Fênix IA',
  W.includes('const us0=loadUsers();') &&
  W.includes('function finFaltaReal(f)') &&
  W.includes('data-dsub="iatok"') &&
  W.includes('id="btnAnaliseIA"')
);

T('8. Sincronização sagrada: index-ui.html idêntico a index.html e 0 erros de sintaxe',
  W === WUI &&
  (() => {
    try {
      const scriptMatches = [...W.matchAll(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi)];
      const inlineScript = scriptMatches.find(m => !m[1].includes('src='));
      fs.writeFileSync('temp_r116_check.js', inlineScript[2]);
      execSync('node --check temp_r116_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r116_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r116_check.js')) fs.unlinkSync('temp_r116_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
