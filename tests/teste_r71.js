/* R70.1 — Gerador de Posts turbinado: fidelidade ao termo + benefícios no cartão e na legenda */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* worker: fidelidade ao serviço */
T('1. worker: regra FIDELIDADE AO PEDIDO', WK.includes('FIDELIDADE AO PEDIDO')&&WK.includes('ozônio terapia capilar')&&WK.includes('NUNCA troque por termo genérico'));
T('2. worker: JSON com beneficios[]', WK.includes('"beneficios":["..."]')&&WK.includes('SEMPRE inclua 3 ou 4 benefícios REAIS e ESPECÍFICOS'));
T('3. worker: legenda com ✨ Benefícios + ✅ e hashtags específicas', WK.includes('✨ Benefícios:')&&WK.includes('hashtags ESPECÍFICAS do serviço')&&WK.includes('#ozonioterapiacapilar'));
T('4. worker: exemplo de benefícios capilares', WK.includes('Fortalece os fios')&&WK.includes('Estimula o crescimento'));
T('5. worker: cérebro estético intacto (sem promessa médica)', WK.includes('NUNCA prometa resultado médico'));
/* app: benefícios desenhados */
T('6. card: benefícios com ✓ dourado no preview', /✓ '\+esc\(b\)/.test(W));
T('7. PNG: benefícios ✓ desenhados (dourado)', W.includes("'✓  '+j2")&&W.includes('fillStyle=\'#d4af37\''));
T('8. gpData guarda benefícios (gbf)', /const gbf=Array\.isArray\(g\.beneficios\)/.test(W)&&W.includes('beneficios:gbf'));
T('9. título vira 2 linhas quando tem benefícios (cabe no cartão)', /slice\(0,bf\.length\?2:3\)/.test(W));
T('10. benefícios limitados a 4 e 42 caracteres', /slice\(0,42\)\)\.slice\(0,4\)/.test(W));
T('11. placeholder ensina pedir benefícios', W.includes('ozônio terapia capilar com os benefícios'));
T('12. versão 1.6.52', W.includes("APP_VERSAO='1.6.80'"));
T('13. versao.json 1.6.50/R70.1 (3+ melhorias)', VJ.versao==='1.6.80'&&VJ.r==='R106'&&(VJ.melhorias||[]).length>=3);
/* nada quebrou */
T('14. chat R69 intacto', W.includes("$('viewIa').classList.toggle('hidden',!(studio&&state.sview==='ia'))"));
T('15. resumo R66 intacto', /sc\[0\]==='resumo'\?relIaBloco\(\):''/.test(W));
T('16. PNG mecânica intacta (canvas→post-fenix.png)', /gpPngV2/.test(W)&&W.includes("'post-fenix.png'"));
T('17. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('18. worker sintaxe válida (node --check)', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/18)'));
process.exit(fail?1:0);
