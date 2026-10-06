/* R77 — Fênix I.A (nome) + anexo lê de verdade (docx/pdf/ocr) + UI (altura + barra fecha/abre) */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
/* nome */
T('1. item da barra diz «Fênix I.A»', W.includes('/></svg>Fênix I.A</button>')&&!W.includes('Conversar com a I.A</button>'));
T('2. hero + título Fênix I.A', W.includes('<h3>Fênix I.A</h3>')&&W.includes("'Laboratório I.A · Fênix I.A'"));
T('3. nome antigo sumiu', !W.includes('Conversar com a I.A'));
/* UI */
T('4. chat ocupa a tela toda (sem card apertado)', W.includes('#viewIa{max-width:none')&&W.includes('.ia-box{flex:1;overflow-y:auto')&&W.includes('max-width:860px'));
T('5. barra Conversas abre/fecha (btnIaSide + CSS .sem)', W.includes('id="btnIaSide"')&&W.includes('.ia-wrap.sem')&&W.includes("classList.toggle('sem')"));
T('6. preferência da barra salva (fenix_iaside)', W.includes("localStorage.getItem('fenix_iaside'"));
/* anexo lê de verdade */
T('7. aceita mais tipos (docx/odt/csv/md)', /accept="image\/\*,\.txt,\.md,\.csv,\.pdf,\.doc,\.docx,\.json,\.log"/.test(W));
T('8. docx vai pro worker /doc-texto', /NUVEM_URL\+\\'\/doc-texto\\'/.test(W)||W.includes("NUVEM_URL+'/doc-texto'"));
T('9. worker: /doc-texto lê ZIP (docx/odt) e PDF', WK.includes("p === '/doc-texto'")&&WK.includes('word/document.xml')&&WK.includes('content.xml')&&WK.includes('PDF sem texto extraível'));
T('10. worker: parser ZIP (assinaturas PK)', WK.includes('0x06054b50')&&WK.includes('0x04034b50')&&WK.includes("DecompressionStream('deflate-raw')"));
T('11. chip do anexo NÃO some após enviar (fica pra continuar perguntando)', (()=>{const i=W.indexOf("pushMsg('user',txt+(temImg");const seg=W.slice(i,i+220);return seg.includes('renderIA();')&&!seg.includes('iaAnexoClear();');})());
T('12. OCR: foto pede leitura de texto tb', W.includes('Leia o texto e o conteúdo desta imagem'));
/* intactos */
T('13. chat/resumo/posts/documentos ok', ['iaSend','relIaAuto','gpAplica','iaDocGera','relPdfModelo'].every(f=>W.includes(f)));
T('14. versão 1.6.56 + versao.json R77 (3+)', W.includes("APP_VERSAO='1.6.77'")&&VJ.versao==='1.6.77'&&VJ.r==='R103'&&(VJ.melhorias||[]).length>=3);
T('15. JS válido', (()=>{try{new Function(W.match(/<script>([\s\S]*)<\/script>/)[1]);return true}catch(e){return false}})());
T('16. worker sintaxe (node --check)', (()=>{try{require('child_process').execSync('node --check "'+path.join(__dirname,'..','supabase','worker-live-backup.js')+'"',{stdio:'pipe'});return true}catch(e){return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/16)'));
process.exit(fail?1:0);
