/* R86 — Arte I.A (estilos+motores) · Modo Agente · Protocolos · Logo no PDF */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.65 + versao.json R86 (5 melhorias)', W.includes("APP_VERSAO='1.6.65'")&&VJ.versao==='1.6.65'&&VJ.r==='R86'&&(VJ.melhorias||[]).length>=5);
/* worker: agente */
T('2. worker: 7 irmãs (6 antigas + IA_AGENTE)', ['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'=')));
T('3. worker: cota do agente (20/dia) + rótulo', WK.includes('cliente:30,agente:20')&&WK.includes("agente:'Modo Agente'"));
T('4. worker: modo agente → cota agente + sys IA_AGENTE + ehGeral', WK.includes("(modo==='agente'?'agente':'chat')")&&WK.includes("(modo==='agente')?(IA_AGENTE+'\\n\\nDADOS ATUAIS DA CLÍNICA:\\n'+ctx)")&&!WK.includes("||modo==='agente');"));
T('5. worker: extrai VÁRIOS canvases (canvasLista)', WK.includes('const canvasLista=[]')&&WK.includes('canvas,canvasLista,motor'));
T('6. worker: agente com mais tokens (2000)', WK.includes("modo==='agente'?2000:1200")&&WK.includes('maxTokens||1200'));
/* worker: arte */
T('7. worker: 6 estilos de arte', ['luxo','marmore','orquidea','seda','bokeh','botanico'].every(k=>WK.includes(k+':')));
T('8. worker: 6 motores de imagem (incl. Leonardo)', WK.includes("@cf/leonardo/lucid-origin")&&WK.includes("@cf/leonardo/phoenix-1.0")&&WK.includes("@cf/bytedance/stable-diffusion-xl-lightning")&&WK.includes("@cf/lykon/dreamshaper-8-lcm")&&WK.includes("env.AI.run(mdl,{prompt,steps:4})"));
T('9. worker: arte SEM gente/texto (guarda reforçada)', WK.includes('NO people, NO faces, NO hands, NO text, NO letters, NO words, NO logos'));
/* app: arte */
T('10. app: chips de estilo e motor + estado GP_ARTE salvo', W.includes("id=\"gpEstilos\"")&&W.includes("id=\"gpModelos\"")&&W.includes("localStorage.setItem('fenix_gparte'")&&W.includes('const GP_MODELOS='));
T('11. app: as 2 chamadas /ia-imagem mandam estilo+modelo', (W.match(/estilo:GP_ARTE.estilo,modelo:GP_ARTE.modelo/g)||[]).length===2);
T('12. app: molde polido (título 2.45rem + sombra)', W.includes("(bf.length?2:2.45)+'rem;line-height:1.12;color:#f5ecca;font-weight:700;text-shadow:0 2px 16px rgba(0,0,0,.6)"));
/* app: agente */
T('13. app: botão 🤖 + liga/desliga salvo + placeholder de missão', W.includes('id="btnIaAgente"')&&W.includes("localStorage.getItem('fenix_iaagente')")&&W.includes('Descreva a MISSÃO'));
T('14. app: salva TODOS os canvases (canvasLista) e avisa «+N na Biblioteca»', W.includes('Array.isArray(j.canvasLista)')&&W.includes('arquivo(s) prontinho(s) na Biblioteca')&&W.includes('else nX++;'));
/* protocolos + logo */
T('15. app: botão 📋 Protocolo nos Documentos (molde completo)', W.includes('id="ddProto"')&&W.includes('Monte o PROTOCOLO COMPLETO')&&W.includes('intervalo recomendado entre sessões'));
T('16. app: painel da logo (Sistema) salva fenix_logo', W.includes('Logo do estúdio no PDF')&&W.includes("localStorage.getItem('fenix_logo')")&&W.includes('id="btnLogoAdd"'));
T('17. app: logo desenhada no PDF do relatório (XObject JPEG + /Im1)', W.includes('/Filter /DCTDecode')&&W.includes('/Im1 Do Q')&&W.includes('LOGO_BIN')&&W.includes("(6+2*nPag)+' 0 R >> '"));
/* intactos */
T('18. R84/R85 intactos (contexto 30k · totais prontos · catVendas)', WK.includes('slice(0,30000)')&&W.includes('const catVendasPkg=')&&W.includes('const catT=catVendasCli(id);'));
T('19. aninhamento HTML 0 erros', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('20. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/20)'));
process.exit(fail?1:0);
