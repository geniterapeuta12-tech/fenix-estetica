const fs=require('fs');
const {JSDOM}=require('jsdom');
const cli=new JSDOM(fs.readFileSync('/home/user/clients/index.html','utf-8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/#cli=t',beforeParse(x){x.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({cliente:{nome:'F',ctabs:['pac','ses']},clinica:'c',pacotes:[],proximas:[],realizadas:[],pagamentos:[],documentos:[]})});}});
cli.window.addEventListener('error',e=>console.log('PAGE ERROR:',e.message));
setTimeout(()=>{
const cd=cli.window.document;
[...cd.querySelectorAll('#fcTabs .tab')].forEach(t=>console.log('tab',t.dataset.go,'· display:',JSON.stringify(t.style.display),'· on:',t.classList.contains('on')));
console.log('painéis:',[...cd.querySelectorAll('.fcpanel')].map(p=>p.id));
console.log('vai existe?', typeof cli.window.vai);
setTimeout(()=>{console.log('após 300ms — on:',[...cd.querySelectorAll('.tab.on')].map(t=>t.dataset.go));process.exit(0);},300);
},400);
