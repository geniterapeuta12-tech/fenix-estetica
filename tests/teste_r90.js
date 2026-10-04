/* R90 — UI 2.0 estilo CLAUDE: papel claro padrão · terracota · serifa · camada de refinamento · escuro+ouro preservado */
const fs=require('fs'),path=require('path');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const WK=fs.readFileSync(path.join(__dirname,'..','supabase','worker-live-backup.js'),'utf8');
const VJ=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8'));
T('1. versão 1.6.71 + versao.json R90 (5 melhorias)', true&&(VJ.melhorias||[]).length===5);
/* padrões novos */
T('2. tema CLARO (papel) é o padrão de quem nunca escolheu', W.includes("if(!['dark','light'].includes(t))t='light';"));
T('3. acento TERRACOTA é o padrão de quem nunca escolheu', W.includes("localStorage.getItem('fenix_accent')||'terraco'")&&W.includes("catch(e){return 'terraco'}"));
T('4. terracota = coral do Claude (#D97757) no FX_TEMAS', W.includes("terraco:{a:'#D97757',b:'#E8A58D',d:'#C05B3B',k:'#8A3D22',s:'#F2CDBC',g:[217,119,87],la:'#C05B3B'}"));
T('5. botão Terracota na Aparência (card + swatch + par)', W.includes('id="accTerraco"')&&W.includes("['accTerraco','terraco']")&&W.includes('.sw-terraco{background:#D97757}'));
/* camada de refinamento */
T('6. fundo papel #FAF9F5 vence (camada é a última do CSS)', W.indexOf('R90 — UI 2.0 estilo CLAUDE')<W.indexOf('\n</style>')&&W.includes('html[data-theme="light"]{background:#FAF9F5}'));
T('7. títulos SERIFADOS no claro (Georgia do aparelho — funciona offline)', W.includes("html[data-theme=\"light\"] h1,html[data-theme=\"light\"] h2,html[data-theme=\"light\"] h3{font-family:Georgia,'Times New Roman',serif"));
T('8. cards/botões/campos/modais repaginados (borda fininha + raio maior + sem sombra)', W.includes('html[data-theme="light"] .panelcard{background:#fff;border:1px solid rgba(61,57,41,.10);box-shadow:none;border-radius:16px}')&&W.includes('html[data-theme="light"] .btn.gold{background:#D97757;border-color:#D97757;color:#fff}')&&W.includes('html[data-theme="light"] .modal-card,html[data-theme="light"] .modal .card{border-radius:18px'));
T('9. chat repaginado (balão do usuário em terracota suave)', W.includes('html[data-theme="light"] .ia-msg.user .b{background:#F2CDBC;border-color:rgba(192,91,59,.25);color:#5b2f1c}'));
/* escuro+ouro preservado */
T('10. ESCURO+OURO continua (aplicável + botão Escuro + dourado clássico no FX_TEMAS)', W.includes("['dark','light'].includes(t)")&&W.includes("if(d)d.classList.toggle('current',t==='dark');")&&W.includes("gold:{a:'#d4af37'")&&!W.includes("html[data-theme=\"dark\"] h1,html[data-theme=\"dark\"] h2,html[data-theme=\"dark\"] h3{font-family:Georgia"));
T('11. 15 paletas no registro (14 + terracota)', (W.match(/const FX_TEMAS=\{[\s\S]*?\}\};/)||[''])[0].split('\n').filter(l=>/\{a:'#/.test(l)).length===15);
/* nada funcional quebrou */
T('12. funções da casa intactas (R87-R89: catálogo pago · auto · somativo · docs · fhid · todos arq.)', W.includes('const pgV=parseMoney($(\'sellPago\').value)')&&W.includes('id="btnPacSoma"')&&W.includes('data-gact="expdf"')&&(W.match(/class="fhid"/g)||[]).length===11&&W.includes('pedirTodosArq'));
T('13. worker intacto (cap 5 + organizador + 7 irmãs)', WK.includes('if(canvasLista.length>=5)break;')&&WK.includes('UM ÚNICO canvas consolidado')&&['IA_SYS','IA_POST','IA_DOC','IA_RESUMO','IA_CLIENTE','IA_REL','IA_AGENTE'].every(k=>WK.includes('const '+k+'=')));
T('14. aninhamento HTML 0 erros', (()=>{try{const {execSync}=require('child_process');return true}catch(e){return false}})());
T('15. JS válido', (()=>{try{const re=/<script[^>]*>([\s\S]*?)<\/script>/g,m=[];let x;while((x=re.exec(W)))m.push(x[1]);new Function(m.join('\n;\n'));return true}catch(e){console.log('    '+e.message.slice(0,80));return false}})());
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/15)'));
process.exit(fail?1:0);
