/* R8 — Fênix Clients: tela pública do cliente (link) */
const fs=require('fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(__dirname+'/fenix-estetica.html','utf8');
let pass=0,fail=0;
const ok=(c,l)=>{if(c){pass++;console.log('  OK  '+l);}else{fail++;console.log('  ** FALHOU: '+l);}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const PUB_JSON={
 cliente:{nome:'Marina Costa'},
 clinica:'Clínica Aurora',
 pacotes:[{nome:'Detox Glow',valor:900,qtd:8,feitas:3,pago:300},{nome:'Pós-Operatório',valor:450,qtd:4,feitas:4,pago:450}],
 pago_total:750,
 proximas:[{data:'2026-10-02',num:4,obs:'Drenagem',pacote:'Detox Glow'}],
 realizadas:[{data:'2026-09-18',num:3,obs:'Peeling anterior',pacote:'Detox Glow'}],
 pagamentos:[{valor:300,data:'2026-09-15',metodo:'Pix'},{valor:450,data:'2026-09-01',metodo:'Cartão'}]};

function makeStub(){
 const rows={clinics:[{id:'u-dono',key:'aurora',nome:'Clínica Aurora'}],usuarios:[]};
 const stub={rows,rpcCalls:[],auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange(){},
  signInWithPassword:async()=>({data:{user:{id:'u-dono',email:'a@b.c',user_metadata:{}}},error:null}),
  signUp:async()=>({data:{session:null},error:null}),
  resetPasswordForEmail:async()=>({data:{},error:null}),signOut:async()=>({}),
  updateUser:async()=>({data:{},error:null})},
  rpc(fn,p){stub.rpcCalls.push([fn,p]);
   if(fn==='fenix_cliente_pub')return Promise.resolve({data:(p.p_id==='cliX'?PUB_JSON:(p.p_id==='cliBloq'?{erro:'sem_acesso'}:null)),error:null});
   return Promise.resolve(null);},
  from(t){
   const eq={eq(){return eq;},
    maybeSingle:async()=>({data:(t==='clinics'?(rows.clinics[0]||null):null),error:null}),
    update(){return {eq:async()=>({data:null,error:null})};},
    then(f){return Promise.resolve(f({data:[],error:null}));}};
   return {select(){return eq;},insert(){return Promise.resolve({data:null,error:null});},update(){return {eq(){return Promise.resolve({data:null,error:null});}};}};
  }}
 return stub;
}
const stub=makeStub();
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://fenix.test/',pretendToBeVisual:true,
 beforeParse(w){w.supabase={createClient:()=>stub};}});
const w=dom.window,d=w.document,ev=s=>w.eval(s);

(async()=>{
try{
 await sleep(700);
 console.log('— Parse do link —');
 ok(ev(`cliTokenFromUrl('https://app.com/#cli=abc123')`)==='abc123','#cli=abc123 → abc123');
 ok(ev(`cliTokenFromUrl('https://app.com/?cli=xyz.')`)==='xyz','?cli=xyz. (ponto final limpo)');
 ok(ev(`cliTokenFromUrl('https://app.com/#resp=abc')`)===null,'Não confunde com link de formulário');
 ok(ev(`cliTokenFromUrl('https://app.com/')`)===null,'Sem link → null');

 console.log('— Tela pública com dados (RPC stubado) —');
 await ev(`enterClientPub('cliX')`);
 await sleep(150);
 ok(stub.rpcCalls.some(c=>c[0]==='fenix_cliente_pub'&&c[1].p_id==='cliX'),'RPC fenix_cliente_pub chamado com o id');
 ok(!d.getElementById('clientPub').classList.contains('hidden'),'Tela Fênix Clients pública aparece');
 ok(d.getElementById('authScreen').classList.contains('hidden'),'Login fica atrás');
 ok(d.getElementById('cpBody').textContent.includes('Marina Costa'),'Nome do cliente no topo');
 ok(d.getElementById('cpBody').textContent.includes('Clínica Aurora'),'Nome da clínica');
 ok(d.getElementById('clientPub').textContent.includes('em trabalho'),'Aviso de ambiente em trabalho');
 ok(d.getElementById('cpBody').textContent.includes('Detox Glow'),'Pacote listado');
 ok(d.getElementById('cpBody').textContent.includes('3 de 8 sessões'),'Progresso do pacote');
 ok(d.getElementById('cpBody').textContent.includes('02/10/2026'),'Próxima sessão com data formatada');
 ok(d.getElementById('cpBody').textContent.includes('Pix'),'Último pagamento com método');
 ok(d.getElementById('cpBody').textContent.includes('Meu financeiro'),'Card Meu financeiro no topo');
 ok(d.getElementById('cpBody').textContent.includes('Contratado')&&d.getElementById('cpBody').textContent.includes('1.350,00'),'Total contratado (R$ 1.350)');
 ok(d.getElementById('cpBody').textContent.includes('Já pagou')&&d.getElementById('cpBody').textContent.includes('750,00'),'Já pagou (R$ 750)');
 ok(d.getElementById('cpBody').textContent.includes('Em aberto')&&d.getElementById('cpBody').textContent.includes('600,00'),'Em aberto (R$ 600)');
 ok(d.getElementById('cpBody').textContent.includes('falta'),'Pacote mostra quanto falta pagar');
 ok(d.getElementById('cpBody').textContent.includes('% concluído'),'Progresso do pacote em texto (documento sem barras)');
 ok(d.querySelectorAll('#cpBody .cpnav').length===10,'10 botões de navegação (5 na lateral + 5 na barra do celular)');
 ok(!!d.querySelector('#clientPub .cpside')&&d.getElementById('clientPub').textContent.includes('FÊNIX CLIENTS'),'Sidebar do computador com a marca Fênix Clients');
 ok(!!d.querySelector('#clientPub .cpbnav'),'Barra inferior estilo celular');
 ok(!!d.querySelector('#cp-inicio.on')&&d.querySelectorAll('#cpBody .cpnav.on').length===2,'Início ativo nas duas barras ao mesmo tempo');
 ok(d.getElementById('cp-inicio').textContent.includes('Sua próxima sessão'),'Início destaca a próxima sessão');
 d.querySelector('[data-cpt="fin"]').click();
 ok(!!d.querySelector('#cp-fin.on'),'Aba Financeiro abre');
 d.querySelector('[data-cpt="pac"]').click();
 ok(!!d.querySelector('#cp-pac.on')&&d.getElementById('cp-pac').textContent.includes('% concluído'),'Aba Pacotes com progresso em texto');
 d.querySelector('[data-cpt="ses"]').click();
 ok(d.getElementById('cp-ses').textContent.includes('Já realizadas'),'Aba Sessões tem histórico');
 ok(d.getElementById('cp-ses').textContent.includes('Peeling anterior'),'Sessão realizada aparece no histórico');
 d.querySelector('[data-cpt="pag"]').click();
 ok(d.getElementById('cp-pag').textContent.includes('Cartão'),'Aba Pagamentos lista tudo');
 ok(d.getElementById('clientPub').textContent.includes('em breve'),'App pra baixar: em breve');

 console.log('— Acesso pausado pela clínica —');
 await ev(`enterClientPub('cliBloq')`);
 await sleep(120);
 ok(d.getElementById('cpBody').textContent.includes('pausado'),'Acesso pausado mostra aviso próprio');
 ok(d.getElementById('cpBody').textContent.includes('reativar'),'Orienta a falar com a clínica');

 console.log('— Link inválido —');
 await ev(`enterClientPub('zzz')`);
 await sleep(120);
 ok(d.getElementById('cpBody').textContent.includes('Link inválido'),'Link inválido avisado com clareza');

 console.log('— Fluxo da clínica: lista e link —');
 await ev(`entrarRemoto({id:'u-dono',email:'aurora@fenix.app',user_metadata:{}})`);
 await sleep(300);
 ev(`getCli().unshift({id:'cliX',nome:'Marina Costa',tel:'(31) 98888-1234',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:9});setCli(getCli().slice())`);
 ev(`setMode('clients')`);
 ok(ev(`state.mode`)==='clients','Modo Fênix Clients ativa');
 ok(d.getElementById('clientLinkList').textContent.includes('Marina Costa'),'Cliente aparece na lista de links');
 d.querySelector('[data-clink="cliX"]').click();
 ok(d.getElementById('cliLinkMsg').textContent.includes('#cli=cliX'),'Link montado com o id do cliente');
 ok(d.getElementById('cliLinkMsg').textContent.includes('Link copiado'),'Cópia confirmada');
 ok(d.getElementById('viewClients').textContent.includes('Seus clientes')&&!d.getElementById('viewClients').textContent.includes('Relatório IA'),'Modo enxuto: só links (relatório no Studio e no app próprio)');
 // WhatsApp na clínica
 ok(!!d.querySelector('[data-cwa="cliX"]'),'Botão WhatsApp por cliente');
 ev(`getCli().unshift({id:'cliSemTel',nome:'Sem Telefone',tel:'',info:'',nasc:'',cpf:'',email:'',end:'',obs:'',criadoEm:'',ts:8});setCli(getCli().slice())`);
 ev(`renderClientsList()`);
 d.querySelector('[data-cwa="cliSemTel"]').click();
 ok(d.getElementById('cliLinkMsg').textContent.includes('telefone'),'WhatsApp sem telefone avisa');
 console.log('RESULTADO: '+pass+' passaram, '+fail+' falharam');
 process.exit(fail?1:0);
}catch(e){console.log('ERR '+(e&&e.message));process.exit(1);}
})();
