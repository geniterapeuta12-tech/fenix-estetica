/* R107 — Vendas na barra lateral do Catálogo + vendas ANTIGAS (sem origem) funcionam em tudo */
const fs=require('fs');
let ok=0,fail=0;const T=(n,c)=>{if(c){ok++;}else{fail++;console.log('  ✗ '+n);}};
const W=fs.readFileSync('/home/user/index.html','utf8');
const VJ=JSON.parse(fs.readFileSync('/home/user/versao.json','utf8'));
T('1. versão 1.6.85 + versao.json R107 (5 melhorias)', W.includes("APP_VERSAO='1.6.85'")&&VJ.versao==='1.6.85'&&VJ.r==='R111'&&VJ.melhorias.length===5);
T('2. finEhCat: antiga (sem origem, obs «Catálogo: …») é venda do catálogo', W.includes("function finEhCat(f){return !!f&&(f.origem==='cat'||/^\\s*Catálogo:/i.test(String(f.obs||'')));}")&&!W.includes("f.origem==='cat'&&f.link"));
T('3. EDIÇÃO de venda antiga abre o campo do valor pago', W.includes('const ehCat=finEhCat(f);')&&!W.includes("const ehCat=f.origem==='cat';"));
T('4. barra lateral do Catálogo com LOJA × VENDAS (funcionando)', W.includes('data-cview="loja"')&&W.includes('data-cview="vendas"')&&W.includes("b.dataset.cview===(state.cview||'loja')")&&W.includes("state.cview=b.dataset.cview;renderApp()")&&W.includes("cview:'loja'}"));
T('5. vista VENDAS esconde a loja e o + (título vira Vendas do catálogo)', W.includes("['catLojaPanel','catLojaTools','catLojaBusca']")&&W.includes("loja?'Catálogo':'Vendas do catálogo'")&&W.includes("fb.style.display=loja?'':'none'"));
T('6. finRows com finEhCat (antigas com etiqueta e saldo honesto)', W.includes("cat:finEhCat(t)||undefined"));
T('7. R105/R106 intactos (status honesto + Nova venda + Organizador)', W.includes('<h3>Vendas do catálogo</h3>')&&W.includes('function openSellModalCat()')&&W.includes('function renderPerfil()')&&(W.match(/b-green\">✓ Quitado/g)||[]).length===4);
console.log(fail?('FALHAS: '+fail):('TUDO OK ('+ok+'/7)'));
process.exit(fail?1:0);
