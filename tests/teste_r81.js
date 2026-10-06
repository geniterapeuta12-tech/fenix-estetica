/* R81 — Temas de cores + Mensagens tela cheia + Termos/aceite + Cotas da I.A + Uso e limites + Fundo do app */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* 1) versão */
T('1. versão 1.6.78 + versao.json R81 (6 melhorias)', W.includes("APP_VERSAO='1.6.78'")&&VJ.versao==='1.6.78'&&VJ.r==='R104'&&(VJ.melhorias||[]).length>=5);
/* 2) temas */
T('2. registro com 15 paletas (14 + terracota R90)', (W.match(/const FX_TEMAS=\{[\s\S]*?\}\};/)||[''])[0].split('\n').filter(l=>/\{a:'#/.test(l)).length===15);
T('3. as 7 novas presentes: roxo_coral, limao, roxo_vermelho, azul_cinza, rosa_vermelho, azul_vermelho, lava', ['roxo_coral:','limao:','roxo_vermelho:','azul_cinza:','rosa_vermelho:','azul_vermelho:','lava:{'].every(k=>W.includes(k)));
T('4. botões + swatches + listeners dos 7 novos', ['accRoxoCoral','accLimao','accRoxoVerm','accAzulCinza','accRosaVerm','accAzulVerm','accLava'].every(id=>W.includes('id="'+id+'"'))&&['.sw-roxo_coral{','.sw-limao{','.sw-lava{'].every(c=>W.includes(c))&&W.includes("$('accLava').addEventListener('click',()=>applyAccent('lava'));"));
T('5. applyAccent controla as variáveis (gold/gold2/deep/dark/soft/glow-c) + tom claro', W.includes("st.setProperty('--gold',claro?t.la:t.a)")&&W.includes("st.setProperty('--glow-c',t.g.join(','))")&&W.includes('--gold-deep')&&W.includes('--gold-soft'));
T('6. :root tem os fallbacks novos', W.includes('--gold-deep:#b3902a')&&W.includes('--glow-c:212,175,55')&&W.includes('--gold-soft:#cdb98a'));
T('7. trocar de tema re-aplica no tema claro (applyTheme chama applyAccent)', W.includes('try{consertaContraste();}catch(e){}try{applyAccent(currentAccent());}catch(e){}')&&W.includes('try{applyFundo();}catch(e){}}'));
T('8. cores viraram variáveis: ZERO rgba(212,175,55, e CSS usa rgba(var(--glow-c)', !W.includes('rgba(212,175,55,')&&W.includes('rgba(var(--glow-c),')&&(W.match(/rgba\(var\(--glow-c\),/g)||[]).length>=150);
T('9. dourado literal só onde deve (root, canvas do logo e paletas de conteúdo)', (W.match(/#d4af37/g)||[]).length===10&&W.includes("tx.fillStyle='#d4af37'")&&W.includes("ROL_CORES=['#d4af37'")&&W.includes("ED_CORES=['#d4af37'"));
/* 3) mensagens tela cheia */
T('10. chat da equipe sem card limitado (tela cheia: sem raio/sombra/largura + escape do .view)', W.includes('.chatwrap{display:flex;height:calc(100dvh - 235px);min-height:470px;max-width:none;border-radius:0;overflow:hidden;border-left:0;border-right:0;box-shadow:none')&&W.includes('#eqMsgs{width:calc(100% + 2*clamp(18px,4vw,44px))')&&!W.includes('.chatwrap{display:flex;height:calc(100dvh - 235px);min-height:470px;max-width:1060px'));
/* 4) cotas no worker */
T('11. (R86) cotas por clínica/dia (chat 100 · post/doc/rel/cliente 30 · agente 20)', WK.includes('const IA_COTAS={chat:100,post:30,doc:30,rel:30,cliente:30,agente:20};'));
T('12. worker: contador diário UPSERT + erro 429 «cota» amigável', WK.includes('ON CONFLICT (clinic_id,dia,tipo) DO UPDATE SET qtd=qtd+1 RETURNING qtd')&&WK.includes("429,'cota'")&&WK.includes('zera à meia-noite'));
T('13. worker: guarda em TODOS os usos de I.A (5 pontos)', (WK.match(/cotaBate\(env,/g)||[]).length>=5&&WK.includes('cotaJerr')&&WK.indexOf("p === '/ia-cliente'")<WK.indexOf("rc.clinic_id,'cliente'"));
T('14. worker: /uso com bytes reais por clínica (SUM LENGTH por tabela) + /ia-uso novo', WK.includes('const TABELAS=[')&&WK.includes('COALESCE(SUM(')&&WK.includes("USO_COTA_DB=262144000")&&WK.includes("p === '/ia-uso'"));
T('15. worker: dia de Brasília (UTC-3) no contador', WK.includes('Date.now()-3*3600e3'));
/* 5) cotas/limites no app */
T('16. app: msg amigável de cota em todos os sítios da I.A (9)', (W.match(/j\.erro\|\|msgCota\(j\)/g)||[]).length===9&&(W.match(/j2\.erro\|\|msgCota\(j2\)/g)||[]).length===1&&W.includes("function msgCota(j){return (j&&j.code==='cota')?'🗓 '+j.message:null;}"));
T('17. app: painel de cotas + renderUso novo (banco real + I.A)', W.includes('id="usoCotasBox"')&&W.includes("'/ia-uso'")&&W.includes("Cotas da Fênix I.A — hoje")&&W.includes('da cota de ')&&W.includes('zera à meia-noite (horário de Brasília)'));
T('18. medidor antigo fora (Armazenamento MB e talk de migração)', !W.includes("'+storageMB()+' MB em '")&&!W.includes('Gatilho da migração')&&!W.includes('migração pro Fly.io'));
/* 6) termos + aceite */
T('19. cláusulas do dono nos termos (4) + data nova', W.includes('3A. Regras da comunidade — cláusulas obrigatórias')&&W.includes('banimento temporário')&&W.includes('múltiplas contas de usuário')&&W.includes('atualizado em 02/10/2026'));
T('20. modal de aceite no 1º acesso + reler', W.includes('id="termosAceite"')&&W.includes('id="termosOk"')&&W.includes('id="termosAceitar"')&&W.includes("localStorage.getItem('fenix_termos_v1')")&&W.includes('id="btnReverTermos"'));
/* 7) fundo */
T('21. fundo personalizável (escolher/remover + camada escura por cima)', W.includes('id="fundoArquivo"')&&W.includes('id="fundoEscolher"')&&W.includes("localStorage.getItem('fenix_fundo')")&&W.includes("const st=document.body?document.body.style:null;")&&W.includes("'rgba(8,7,5,.8),rgba(8,7,5,.8)'")&&W.includes("function applyFundo()"));
/* 8) intactos */
T('22. I.A/chat/canvas/biblioteca intactos (R78-R80)', W.includes('class="ia-arq" type="button" data-canabrir=')&&W.includes('return newConv(false);} /* R80')&&W.includes('buildIaCtx')&&W.includes('FORMATO OBRIGATÓRIO')===false&&W.includes('SOMENTE LEITURA'));
T('23. worker: 6 cérebros + canvas pela I.A intactos', ['const IA_POST','const IA_DOC','const IA_SYS','const IA_RESUMO','const IA_CLIENTE','const IA_REL'].every(k=>WK.includes(k))&&WK.includes('CRIAR ARQUIVOS (CANVAS)'));
T('24. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
T('25. worker sintaxe ok', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/25)'));
process.exit(fail?1:0);
