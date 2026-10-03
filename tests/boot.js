const fs=require('fs');const {JSDOM,VirtualConsole}=require('jsdom');
const errs=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errs.push('jsdomError: '+e.message));
vc.on('error',(...a)=>errs.push('console.error: '+a.join(' ')));
const html=fs.readFileSync('/home/user/tests/fenix-estetica.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://fenix.test/',virtualConsole:vc});
setTimeout(()=>{
  const d=dom.window.document;
  console.log('Tela de login presente:',!!d.getElementById('authScreen'));
  console.log('Título:',d.title);
  console.log('Erros capturados:',errs.length?errs:'NENHUM ✓');
  process.exit(errs.length?1:0);
},600);
