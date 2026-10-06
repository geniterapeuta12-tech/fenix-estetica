/* R61 — Fênix I.A: app usa worker sem chave, contexto com dados, worker com histórico */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* app */
T('1. APP_VERSAO 1.6.41', W.includes("APP_VERSAO='1.6.79'"));
T('2. viewIa existe (Studio I.A)', W.includes('id="viewIa"'));
T('3. iaSend chama o worker /ia sem chave', /if\(!cfg\.key\)[\s\S]{0,1700}NUVEM_URL\+'\/ia'/.test(W));
T('4. envia autenticado (Bearer SB_TOKEN)', /NUVEM_URL\+'\/ia'[\s\S]{0,300}Bearer '\+\(SB_TOKEN/.test(W));
T('5. buildIaCtx monta contexto dos dados', W.includes('function buildIaCtx')&&/buildIaCtx[\s\S]{0,900}DB\.cli\.length/.test(W));
T('6. contexto tem previsão de retorno (sem sessão há mais tempo)', W.includes('Sem sessão há mais tempo'));
T('7. contexto tem aniversariantes', W.includes('Aniversariantes do mês'));
T('8. contexto tem faturamento do mês', W.includes('total recebido R$'));
T('9. manda histórico da conversa', /historico:hist/.test(W));
T('10. erro da IA tem mensagem amigável', W.includes('Não consegui falar com a I.A'));
T('11. badge mostra Fênix I.A sem chave', W.includes("'Fênix I.A'"));
T('12. modo offline antigo removido', !W.includes('Modo offline'));
T('13. API própria segue como opcional', W.includes('online (própria)'));
T('14. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
/* worker */
T('15. worker: rota /ia com JWT', /p === '\/ia' && req\.method === 'POST'[\s\S]{0,200}verifyJWT/.test(WK));
T('16. worker: /ia-ok diagnóstico público', WK.includes("p === '/ia-ok'"));
T('17. worker: motor Workers AI (binding)', WK.includes('@cf/meta/llama-3.3-70b-instruct-fp8-fast')&&WK.includes('env.AI.run'));
T('18. worker: fallback 8B se 70B falhar', WK.includes('@cf/meta/llama-3.1-8b-instruct-fast'));
T('19. worker: Groq opcional via secret', WK.includes('groqChat')&&WK.includes('api.groq.com'));
T('20. worker: histórico limitado a 10 turnos', WK.includes('b.historico')&&WK.includes('slice(-10)'));
T('21. worker: sistema em pt-BR sem inventar dados', WK.includes('nunca invente números'));
T('22. worker: R60 intacto (R2)', WK.includes('/r2-ok')&&WK.includes('r2Put'));
/* versao.json */
T('23. versao.json 1.6.49/R70', VJ.versao==='1.6.79'&&VJ.r==='R105');
T('24. melhorias ≥3', (VJ.melhorias||[]).length>=3);
T('25. Center 2.0.0 intocado (UI nova da Plataforma)', fs.readFileSync(path.join(__dirname,'..','center-src','www','index.html'),'utf8').includes("CENTER_V='2.4.0'"));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/25)'));
process.exit(fail?1:0);
