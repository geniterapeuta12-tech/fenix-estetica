/* R117 — PAGAMENTOS SEM VÍNCULO + FINANCEIRO GERAL NA CLIENTE + MODAL DE PASTAS SEM PROMPT */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.91 + versao.json R117 com EXATAMENTE 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.6.91'") &&
  VJ.versao === '1.6.91' &&
  VJ.r === 'R117' &&
  VJ.melhorias.length === 5
);

T('2. Modal in-app para Pastas (#modalPasta) implementado sem prompt() nativo que falha no Electron',
  W.includes('id="modalPasta"') &&
  W.includes('id="inputNomePasta"') &&
  W.includes('id="btnSalvaModalPasta"') &&
  W.includes('id="btnCancelaModalPasta"') &&
  W.includes('function abrirModalPasta(') &&
  W.includes('function salvarModalPasta()') &&
  W.includes('function fecharModalPasta()')
);

T('3. Polyfill seguro para window.prompt prevenindo uncaught error no Electron e WebViews',
  W.includes('window.prompt=function(m,d)')
);

T('4. Pagamento sem vínculo na cliente: opção por padrão em payCliPkg e label opcional',
  W.includes('<option value="">Sem vínculo (pagamento avulso / crédito da cliente)</option>') &&
  W.includes('<label>Vínculo (opcional)</label><select id="payCliPkg"></select>')
);

T('5. formPayCli submit aceita e registra pagamentos sem vínculo (pacoteId e sessaoId nulos)',
  W.includes('list.unshift({id:uid(),clientId:state.clientId,pacoteId,sessaoId,valor,data,metodo,obs});') &&
  !W.includes("if(!alvo)return msg($('payCliMsg'),'Escolha um pacote, avulsa ou a distribuição automática.','err');")
);

T('6. Transações manuais do financeiro geral linked à cliente exibidas em finCliPays',
  W.includes('const paysFromPay=cliPays(c).map(') &&
  W.includes('const paysFromFin=getFin().filter(f=>finCliLink(f,c)&&!finEhCat(f)).map(') &&
  W.includes('const pays=[...paysFromPay,...paysFromFin]')
);

T('7. cliTotals e pkgPays integram transações do financeiro geral vinculadas à cliente/pacote',
  W.includes('const finCliLink=(f,cid)=>') &&
  W.includes('const finIn=getFin().filter(f=>finCliLink(f,id)&&!finEhCat(f)&&f.tipo===\'in\').reduce(') &&
  W.includes('const finOut=getFin().filter(f=>finCliLink(f,id)&&!finEhCat(f)&&f.tipo===\'out\').reduce(') &&
  W.includes('paid=cliPays(id).reduce((s,x)=>s+x.valor,0)+catP+finIn-finOut;')
);

T('8. Sincronização sagrada: index-ui.html idêntico a index.html e 0 erros de sintaxe',
  W === WUI &&
  (() => {
    try {
      const scriptMatches = [...W.matchAll(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi)];
      const inlineScript = scriptMatches.find(m => !m[1].includes('src='));
      fs.writeFileSync('temp_r117_check.js', inlineScript[2]);
      execSync('node --check temp_r117_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r117_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r117_check.js')) fs.unlinkSync('temp_r117_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
