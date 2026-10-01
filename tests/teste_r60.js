/* R60 — R2: anexos 10MB, upload via worker, cleanup R2, versão 1.6.39 */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* app */
T('1. APP_VERSAO 1.6.40', W.includes("APP_VERSAO='1.6.40'"));
T('2. TG_MAXR2 = 10 MB', W.includes('TG_MAXR2=10485760'));
T('3. tgSobeR2 existe (upload pro R2)', W.includes('async function tgSobeR2'));
T('4. upload usa rota do worker (sem chave no app)', /tgSobeR2[\s\S]{0,400}storage\/v1\/object\/fenix-arquivos/.test(W));
T('5. upload autenticado com sessão (Bearer SB_TOKEN)', /tgSobeR2[\s\S]{0,400}Bearer '\+\(SB_TOKEN/.test(W));
T('6. caminho público devolvido é o /public/', /tgSobeR2[\s\S]{0,600}object\/public\/fenix-arquivos/.test(W));
T('7. limite no cliente: 10 MB', W.includes('máximo 10 MB'));
T('8. foto grande → reduz; ainda pesada → R2', /u\.length<=TG_MAXB64\)return res\(\{url:u[\s\S]{0,300}return sobeR2\(\)/.test(W));
T('9. arquivo grande (não-imagem) → R2', /u\.length>TG_MAXB64\)\{[\s\S]{0,200}return sobeR2\(\)/.test(W));
T('10. tgEhImgUrl aceita URL pública do R2 como foto', W.includes('function tgEhImgUrl')&&(W.match(/tgEhImgUrl\(m\.url\)\)/g)||[]).length===2);
T('11. render antigo data:image-only removido', !W.includes("if(/^data:image/.test(m.url))"));
T('12. FAQ/texto: anexos até 10 MB', W.includes('Anexos de mensagem de até <b>10 MB</b>'));
T('13. inline rápido preservado (TG_MAXB64)', W.includes('TG_MAXB64=1400000'));
T('14. falha R2 → mensagem clara, não perde arquivo', W.includes('não consegui subir o arquivo'));
/* worker */
T('15. worker: helpers R2 (r2Put/r2Get/r2Del)', WK.includes('r2Put')&&WK.includes('r2Get')&&WK.includes('r2Del'));
T('16. worker: DELETE de mensagens limpa o R2', WK.includes("if (t === 'mensagens' && env.R2_TOKEN)"));
T('17. worker: R2 falhou → banco apaga mesmo assim', /catch \(e\) \{ \/\* R2 falhou → apaga só no banco \*\/ \}/.test(WK));
T('18. worker: upload POST → R2 primeiro', /if \(env\.R2_TOKEN\) \{[\s\S]{0,200}r2Put/.test(WK));
T('19. worker: GET público → R2 primeiro, D1 fallback', /const rf = await r2Get/.test(WK)&&/SELECT mime,data FROM fotos WHERE path/.test(WK)&&WK.indexOf('const rf = await r2Get')<WK.indexOf('SELECT mime,data FROM fotos'));
T('20. worker: diagnóstico /r2-ok', WK.includes("p === '/r2-ok'"));
/* versao.json */
T('21. versao.json 1.6.40 / R61', VJ.versao==='1.6.40'&&VJ.r==='R61');
T('22. melhorias listadas (≥3)', (VJ.melhorias||[]).length>=3);
/* center intocado */
T('23. Center 1.8.0 intocado', fs.readFileSync(path.join(__dirname,'..','center-src','www','index.html'),'utf8').includes("CENTER_V='1.8.0'"));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/23)'));
process.exit(fail?1:0);
