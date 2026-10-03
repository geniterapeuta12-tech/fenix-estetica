/* R81 — teste FUNCIONAL (jsdom): temas, msgCota, termos-aceite, fundo */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let ok=0,fail=0;const T=(n,c)=>{console.log((c?'  ✔ ':'  ✘ ')+n);if(c)ok++;else fail++;};
(async()=>{
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{url:'https://fenix.local/',runScripts:'dangerously',resources:'usable',pretendToBeVisual:true});
const w=dom.window;
await new Promise(r=>{w.addEventListener('load',r);setTimeout(r,9000);});
const ev=c=>w.eval(c);
/* 1) tema troca de verdade */
ev("applyAccent('lava')");
T('1. lava: --gold=#ef4444', ev("document.documentElement.style.getPropertyValue('--gold')")==='#ef4444');
T('2. lava: --glow-c=239,68,68', ev("document.documentElement.style.getPropertyValue('--glow-c')")==='239,68,68');
T('3. lava: dataset.accent + persistido', ev("document.documentElement.dataset.accent")==='lava'&&w.localStorage.getItem('fenix_accent')==='lava');
T('4. botão Lava marcado como current', ev("document.getElementById('accLava').classList.contains('current')")===true);
ev("applyAccent('roxo_coral')");
T('5. roxo_coral: --gold=#8b5cf6', ev("document.documentElement.style.getPropertyValue('--gold')")==='#8b5cf6');
ev("applyAccent('gold')");
T('6. volta pro dourado: --gold=#d4af37 (padrão Fênix intacto)', ev("document.documentElement.style.getPropertyValue('--gold')")==='#d4af37');
/* 7) tema claro usa tom mais escuro */
ev("applyTheme('light');applyAccent('coral')");
T('7. claro + coral: --gold usa o tom escuro (#17755a)', ev("document.documentElement.style.getPropertyValue('--gold')")==='#17755a');
ev("applyTheme('dark');applyAccent('gold')");
/* 8) msgCota */
T('8. msgCota monta a mensagem amigável', ev("msgCota({code:'cota',message:'Cota esgotada'})").includes('🗓')&&ev("msgCota({code:'cota',message:'Cota esgotada'})").includes('Cota esgotada'));
T('9. msgCota ignora erro comum', ev("msgCota({message:'outra coisa'})")===null);
/* 10-13) termos */
T('10. modal de aceite aparece sem aceite salvo', !ev("document.getElementById('termosAceite').classList.contains('hidden')"));
T('11. botão aceitar começa desabilitado', ev("document.getElementById('termosAceitar').disabled")===true);
ev("document.getElementById('termosOk').checked=true;document.getElementById('termosOk').dispatchEvent(new window.Event('change'))");
T('12. marcou «li e aceito» → botão habilita', ev("document.getElementById('termosAceitar').disabled")===false);
ev("document.getElementById('termosAceitar').click()");
T('13. aceitou → salva no aparelho e fecha o modal', w.localStorage.getItem('fenix_termos_v1')==='1'&&ev("document.getElementById('termosAceite').classList.contains('hidden')")===true);
/* 14-16) fundo */
ev("localStorage.setItem('fenix_fundo','data:image/jpeg;base64,AAAA');applyFundo()");
const bg=ev("document.body.style.backgroundImage")||'';
const bgs=bg.replace(/\s+/g,'').replace(/,\(/g,',(');T('14. fundo: camada escura por cima da imagem', bgs.includes('linear-gradient(rgba(8,7,5,0.8)')&&bgs.includes('url("data:image/jpeg;base64,AAAA")'));
T('15. fundo: estado e botão remover habilitam', ev("document.getElementById('fundoEstado').textContent").includes('fundo ativo')&&ev("document.getElementById('fundoRemover').disabled")===false);
ev("localStorage.removeItem('fenix_fundo');applyFundo()");
T('16. remover fundo volta ao padrão', (ev("document.documentElement.style.backgroundImage")||'')===''&&ev("document.getElementById('fundoRemover').disabled")===true);
/* 17-18) painel de uso novo + medidor antigo fora */
T('17. painel de cotas existe no viewUso', !!ev("document.getElementById('usoCotasBox')"));
T('18. sem nuvem: painel de cotas mostra aviso (não quebra)', ev("renderUso();document.getElementById('usoCotasBox').textContent").includes('medidas na nuvem'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
})().catch(e=>{console.error('ERRO:',e.stack||e.message);process.exit(1);});
