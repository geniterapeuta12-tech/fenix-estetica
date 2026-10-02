/* R78 — Fênix I.A com visual estilo Claude: barra lateral própria + chat amplo sem card + compositor embaixo */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* barra lateral */
T('1. barra lateral própria da conversa', W.includes('<aside class="ia-side" id="iaSide">')&&W.includes('<ul class="ia-list" id="iaConvList">'));
T('2. marca Fênix I.A no topo da barra', W.includes('<div class="ia2brand"><svg class="logo" viewBox="0 0 1440 960"><use href="#phoenix"/></svg><h3>Fênix I.A</h3></div>'));
T('3. «Nova conversa» virou botão da barra', W.includes('<button class="ia2new" id="btnIaNew" type="button">'));
T('4. hero antigo e botões de cima SUMIRAM', !W.includes('Fale com a inteligência artificial do estúdio')&&!W.includes('<span class="badge b-gold" id="iaStatus">offline</span>')&&W.includes('<div class="ia-top"><h4 id="iaConvTitle">'));
T('5. rodapé da barra: status + Configurações', W.includes('<div class="ia-foot"><span class="badge b-gold" id="iaStatus">Fênix I.A</span>')&&W.includes('class="ia-cfgbtn" id="btnIaCfg"'));
/* chat amplo */
T('6. chat de ponta a ponta, coluna centrada 860px', W.includes('#viewIa{max-width:none;gap:0;margin:-26px calc(-1*clamp(18px,4vw,44px)) -70px;height:100vh')&&W.includes('.ia-box{flex:1;overflow-y:auto;min-height:0;width:100%;max-width:860px'));
T('7. resposta da I.A em texto corrido (sem card)', W.includes('.ia-msg.ia .b{background:none;border:0;padding:0}')&&W.includes('.ia-msg.user .b{background:#1d1d1d;border:1px solid var(--line);border-radius:16px'));
T('8. tela vazia virou boas-vindas centralizada', W.includes('class="ia-hello"')&&W.includes('Como posso ajudar hoje?'));
/* compositor */
T('9. campo de mensagem arredondado com 📎 e enviar dentro', W.includes('<div class="ia-comp">')&&W.includes('class="ia-clip" id="btnIaAnexo"')&&W.includes('<button class="ia-go" id="btnIaSend" type="button" title="Enviar">'));
T('10. chip do anexo continua (com ✕ pra limpar)', W.includes('id="iaAnexoChip"')&&W.includes('id="iaAnexoX"')&&/accept="image\/\*,\.txt,\.md,\.csv,\.pdf,\.doc,\.docx,\.json,\.log"/.test(W));
/* barra fecha/abre */
T('11. botão de dobrar na borda + classes .sem', W.includes('class="ia-fold" id="btnIaSide"')&&W.includes('.ia-wrap.sem .ia-side{margin-left:-266px}')&&W.includes("classList.toggle('sem')"));
T('12. preferência salva (1/0) e celular começa fechado', W.includes("localStorage.getItem('fenix_iaside'")&&W.includes("_p==='1'||(window.innerWidth<=900&&_p!=='0')"));
T('13. lista de conversas no estilo enxuto (ia-item)', W.includes('\'<li class="ia-item\'+(x.id===state.iaConv?\' on\':\'\')')&&W.includes('.ia-item .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'));
/* gaveta no celular + configs flutuando */
T('14. celular: barra vira gaveta que desliza', W.includes('@media(max-width:900px){')&&W.includes('.ia-side{position:absolute;left:0;top:0;bottom:0;z-index:12;width:min(300px,85vw)'));
T('15. Configurações flutua sobre o chat', W.includes('#iaCfgCard{position:absolute;top:48px;right:14px;'));
/* intactos */
T('16. funções de antes intactas', ['iaSend','relIaAuto','gpAplica','iaDocGera','relPdfModelo','iaAnexoClear','buildIaCtx'].every(f=>W.includes(f)));
T('17. versão 1.6.57 + versao.json R78 (3+)', W.includes("APP_VERSAO='1.6.59'")&&VJ.versao==='1.6.59'&&VJ.r==='R80'&&(VJ.melhorias||[]).length>=3);
T('18. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
