/* R109 — Token para I.A (painel em Dados + endpoint no worker + segurança) */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const WK=fs.readFileSync('/home/user/supabase/worker-live-backup.js','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.83 + versao.json R109 (5 melhorias)', W.includes("APP_VERSAO='1.6.83'")&&VJ.versao==='1.6.83'&&VJ.r==='R109'&&VJ.melhorias.length===5);
T('2. tabela ia_tokens na sincronia (LOAD_ORDER + TABLES + helpers)', W.includes("'msg','pub','iatok']")&&W.includes("iatok:{table:'ia_tokens',fromDb:mapIat,toDb:dbIat}")&&W.includes('msg:[],pub:[],iatok:[],bkp:[]')&&W.includes("msg:msgKey,pub:pubKey,iatok:iatokKey")&&W.includes("const getIatok=()=>DB.iatok,setIatok=v=>{DB.iatok=v;persist('iatok');}"));
T('3. painel em Dados (view + sidebar + título + render)', W.includes('id="viewIatok"')&&W.includes('data-dsub="iatok"')&&W.includes("'Dados · Token para I.A'")&&W.includes("function renderIatok()")&&W.includes("if(state.dsub==='iatok')try{renderIatok();}catch(e2){}"));
T('4. geração: token fkia_ + hash SHA-256 (o token NUNCA fica salvo em claro)', W.includes("const tok='fkia_'+btoa(bin)")&&W.includes("crypto.subtle.digest('SHA-256'")&&W.includes('iatokShowVal')&&!W.includes("hash:tok"));
T('5. escopos (clientes/agenda/financeiro/catalogo) + validade + revogar', W.includes('iatokEs_clientes')&&W.includes('iatokEs_agenda')&&W.includes('iatokEs_financeiro')&&W.includes('iatokEs_catalogo')&&W.includes('id="iatokExp"')&&W.includes('data-act="iatokrev"')&&W.includes('Token revogado'));
T('6. endpoint no worker: /pub/ia/dados só-leitura com hash+expiração+isolamento', WK.includes("p === '/pub/ia/dados'")&&WK.includes("tk.startsWith('fkia_')")&&WK.includes('SELECT * FROM ia_tokens WHERE hash = ? AND revogado = 0')&&WK.includes('if (t.expira_em)')&&WK.includes('FROM clientes WHERE clinic_id = ?')&&WK.includes('UPDATE ia_tokens SET ultimo_uso'));
T('7. R107 intacto (Vendas na lateral + finEhCat)', W.includes('data-cview="vendas"')&&W.includes('function finEhCat(f)')&&W.includes('const ehCat=finEhCat(f);'));
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/7)'));
process.exit(fail?1:0);
