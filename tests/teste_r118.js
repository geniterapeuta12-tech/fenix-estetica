/* R118 — AS 3 NOVAS FUNÇÕES EXTRAS: VALE-PRESENTE VIP + STORIES & ENGAJAMENTO + ANALISADOR DE PERFIL */
const fs = require('fs');
const { execSync } = require('child_process');

let ok = 0, fail = 0;
const T = (n, c) => { if (c) { ok++; } else { fail++; console.log('  ✗ ' + n); } };

const basePath = fs.existsSync('/home/user/index.html') ? '/home/user' : 'PACOTE-ANTIGRAVITY';
const W = fs.readFileSync(basePath + '/index.html', 'utf8');
const WUI = fs.readFileSync(basePath + '/index-ui.html', 'utf8');
const VJ = JSON.parse(fs.readFileSync(basePath + '/versao.json', 'utf8'));

T('1. Versão 1.6.92 + versao.json R118 com EXATAMENTE 5 melhorias canônicas',
  W.includes("APP_VERSAO='1.6.92'") &&
  VJ.versao === '1.6.92' &&
  VJ.r === 'R118' &&
  VJ.melhorias.length === 5 &&
  VJ.melhorias[0].includes('Vale-Presente & Voucher VIP') &&
  VJ.melhorias[1].includes('Stories') &&
  VJ.melhorias[2].includes('Analisador de Perfil') &&
  VJ.melhorias[3].includes('biografia magnética') &&
  VJ.melhorias[4].includes('100% das funções')
);

T('2. Três novos cartões de acesso (#vouchOpen, #storiesOpen, #perfilAuditOpen) presentes em #viewExtras',
  W.includes('id="vouchOpen"') &&
  W.includes('id="storiesOpen"') &&
  W.includes('id="perfilAuditOpen"')
);

T('3. Painel Vale-Presente & Voucher VIP (#vouchBox) com formulário, card de luxo e compartilhamento WhatsApp',
  W.includes('id="vouchBox"') &&
  W.includes('id="vouchDe"') &&
  W.includes('id="vouchPara"') &&
  W.includes('id="vouchTipo"') &&
  W.includes('id="vouchValor"') &&
  W.includes('id="vouchValidade"') &&
  W.includes('id="btnGerarVouch"') &&
  W.includes('id="vouchCard"') &&
  W.includes('id="btnCopiarVouchMsg"') &&
  W.includes('id="btnZapVouch"') &&
  W.includes('function geraTextoVoucher(')
);

T('4. Painel Ideias de Stories & Engajamento (#storiesBox) com sorteador, cópia e banco com >= 25 ganchos',
  W.includes('id="storiesBox"') &&
  W.includes('id="btnSortearStory"') &&
  W.includes('id="btnCopiarStory"') &&
  W.includes('id="storyCard"') &&
  W.includes('const BANCO_STORIES=[') &&
  (() => {
    const match = W.match(/const BANCO_STORIES\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) return false;
    try {
      const arr = eval(match[1]);
      return Array.isArray(arr) && arr.length >= 25;
    } catch(e) {
      return false;
    }
  })()
);

T('5. Painel Analisador de Perfil (#perfilAuditBox) com 3 abas, score 0-100, gerador de bio e 4 destaques',
  W.includes('id="perfilAuditBox"') &&
  W.includes('id="tabAuditScore"') &&
  W.includes('id="tabAuditBio"') &&
  W.includes('id="tabAuditDestaques"') &&
  W.includes('id="auditScoreNum"') &&
  W.includes('id="auditDiagnosticoTitulo"') &&
  W.includes('id="chkAudit1"') &&
  W.includes('id="btnGerarBio"') &&
  W.includes('id="bioResultados"') &&
  W.includes('function recalcularAuditScore(')
);

T('6. Persistência em localStorage (fenix_vouchers e fenix_audit_ig)',
  W.includes("localStorage.getItem('fenix_vouchers')") &&
  W.includes("localStorage.setItem('fenix_vouchers'") &&
  W.includes("localStorage.getItem('fenix_audit_ig')") &&
  W.includes("localStorage.setItem('fenix_audit_ig'")
);

T('7. Preservação integral de funções críticas (Modo Local R110, Financeiro R109, Modal Pasta R117, Pagamento sem vínculo R117)',
  W.includes('id="modalPasta"') &&
  W.includes('Sem vínculo (pagamento avulso / crédito da cliente)') &&
  W.includes('window.prompt=function(m,d)') &&
  W.includes('const paysFromPay=cliPays(c).map(') &&
  W.includes('const paysFromFin=getFin().filter(f=>finCliLink(f,c)&&!finEhCat(f)).map(')
);

T('8. Sincronização sagrada: index-ui.html idêntico a index.html e 0 erros de sintaxe (node --check)',
  W === WUI &&
  (() => {
    try {
      const scriptMatches = [...W.matchAll(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi)];
      const inlineScript = scriptMatches.find(m => !m[1].includes('src='));
      fs.writeFileSync('temp_r118_check.js', inlineScript[2]);
      execSync('node --check temp_r118_check.js', { stdio: 'pipe' });
      fs.unlinkSync('temp_r118_check.js');
      return true;
    } catch (e) {
      if (fs.existsSync('temp_r118_check.js')) fs.unlinkSync('temp_r118_check.js');
      return false;
    }
  })()
);

console.log(fail ? ('FALHAS: ' + fail) : ('TUDO OK (' + ok + '/8)'));
process.exit(fail ? 1 : 0);
