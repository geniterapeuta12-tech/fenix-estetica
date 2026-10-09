/* R110 — MODO LOCAL DE VERDADE: teste-local abre e entra · 1º acesso cria conta local · cadastro offline · sync agora honesto · login na hora */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
const TL=fs.readFileSync('/home/user/FENIX-TESTE-LOCAL.html','utf8');
T('1. versão 1.6.87 + versao.json R113 (5 melhorias)', W.includes("APP_VERSAO='1.6.87'")&&VJ.versao==='1.6.87'&&VJ.r==='R113'&&VJ.melhorias.length===5);
T('2. login offline: sem NENHUM acesso local → o 1º login CRIA o acesso e entra', W.includes('const us0=loadUsers();')&&W.includes('if(Object.keys(us0).length)return msg($(\'loginMsg\'),\'Sem conexão com a nuvem agora e senha local incorreta.')&&W.includes('us0[nk0]={nome:nome,senha:pass,clinica:nome};saveUsers(us0);')&&W.includes('entrarLocal(us0[nk0],nk0);return;}'));
T('3. senha local errada (já existe acesso) CONTINUA recusando', W.includes("if(Object.keys(us0).length)return msg($('loginMsg'),'Sem conexão com a nuvem agora e senha local incorreta. Verifique a internet e a senha.','err');"));
T('4. cadastro offline cria o acesso local (não recusa) + nome duplicado avisado', W.includes('const usC=loadUsers(),nkC=nome.toLowerCase();')&&W.includes("J\\u00e1 existe um acesso local com esse nome neste aparelho \\u2014 use Entrar.")&&W.includes('entrarLocal(usC[nkC],nkC);return;}'));
T('5. syncAll NUNCA roda em local + «Sincronizar agora» explica o modo local', W.includes('if(!REMOTE)return; /* R110 — modo local: nada vai pra nuvem */')&&W.includes("if(!REMOTE)return msg($('syncMsg'),'💾 Você está no modo local"));
T('6. login abre NA HORA sem acesso lembrado (5s só com lembrete)', W.includes('const temLembrete=!!(window.__pendRemoto||window.__pendLocal);')&&W.includes("},temLembrete?5000:300);});"));
T('7. FENIX-TESTE-LOCAL regenerado CERTO: const SB=null (declaração mantida) + selo + sem update', TL.includes("const SB=null; /* TESTE-LOCAL: nuvem desligada")&&TL.includes("APP_VERSAO='1.6.87-teste'")&&TL.includes('TESTE LOCAL · 1.6.87-teste · NÃO OFICIAL')&&TL.includes('return; /* TESTE-LOCAL: sem update */')&&!TL.includes('const SB=(window.supabase'));
T('8. R113 intacto (status honesto + Análise/I.A) · R108 intacto (Token I.A)', W.includes('function finFaltaReal(f)')&&W.includes('function finCliDe(t)')&&W.includes('id="btnAnalise"')&&W.includes('id="btnAnaliseIA"')&&W.includes('data-dsub="iatok"'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/8)'));
process.exit(fail?1:0);
