import {commandRegistry} from './terminalCommands';
import {parseCommand} from './commandParser';
import {stages,completionFlag,investigationGuide} from './ctfChallenges';
import {validateAnswer} from './ctfValidator';
import {virtualFiles,virtualDirectories,resolveVirtualPath} from './virtualFileSystem';
import type {CommandContext,CommandResult,Session,Stage} from './types';

export function executeCommand(raw:string,ctx:CommandContext):CommandResult|null{
 let parsed;try{parsed=parseCommand(raw);}catch(error){return {text:error instanceof Error?error.message:'Invalid command.'};}
 if(!parsed)return null;
 const {name,args}=parsed;const {data,session}=ctx;const value=args.join(' ');
 const definition=commandRegistry.find(command=>command[0]===name);
 if(!definition)return {text:`Command not found: ${name}. Type help for available commands.`,suggestions:['help']};
 if(definition[3]==='challenge'&&session.stage===0&&name!=='reset')return {text:'No investigation is active. Type challenge to begin.',suggestions:['challenge']};
 const result=(text:string,extras:Partial<CommandResult>={}):CommandResult=>({text,...extras});
 switch(name){
  case 'help':{
   if(value==='challenge')return result(investigationGuide,{suggestions:['challenge','ls','cat memo.txt','hint']});
   if(value){const command=commandRegistry.find(c=>c[0]===value.toLowerCase());return result(command?`${command[1]}\n${command[2]}`:`No help entry for ${value}. Try help.`);}
   return result(commandRegistry.filter(c=>c[3]==='portfolio').map(c=>`${c[1].padEnd(30)}${c[2]}`).join('\n')+'\n\nCurious? Try challenge. More guidance: help challenge.',{suggestions:['whoami','projects','skills','challenge']});
  }
  case 'whoami':return result(`${data.profile.name}\n${data.profile.role}\n${data.profile.status}\n${data.profile.location}`);
  case 'about':return result(`${data.profile.bio}\n\n${data.profile.aboutDetail}`);
  case 'skills':return result(data.skills.map(s=>`${s.title}\n  ${s.items.join(' · ')}`).join('\n\n'));
  case 'projects':{
   if(!value)return result(data.projects.map(p=>`${p.slug}\n  ${p.title}`).join('\n\n')+'\n\nInspect one with: projects <slug>',{suggestions:data.projects.slice(0,3).map(p=>`projects ${p.slug}`)});
   const project=data.projects.find(p=>p.slug===value.toLowerCase());
   return project?result(`${project.title}\n${project.category}\n\n${project.description}\n\nStack: ${project.technologies.join(', ')}`,{links:[{label:'View case study',href:project.href},{label:'Source on GitHub',href:project.repository}]}):result(`Unknown project slug: ${value}. Use projects to list the real project slugs.`,{suggestions:['projects']});
  }
  case 'education':return result(data.education.map(e=>`${e.title}\n${e.organization}${e.period?' · '+e.period:''}\n${e.description}`).join('\n\n'));
  case 'certifications':return result(data.certifications.length?data.certifications.map(c=>`${c.title}\n${c.issuer}${c.date?' · '+c.date:''}`).join('\n\n'):'No published certifications.',{links:data.certifications.filter(c=>c.credentialUrl).map(c=>({label:c.title,href:c.credentialUrl!}))});
  case 'contact':return result(`${data.profile.email}\n${data.profile.location}`,{links:[{label:'Open contact form',href:'/contact/'},{label:'Email Dineth',href:`mailto:${data.profile.email}`}]});
  case 'socials':return result('Find Dineth online:',{links:[{label:'GitHub',href:data.profile.github},{label:'LinkedIn',href:data.profile.linkedin}]});
  case 'cv':return result('Downloading the portfolio CV. You can also use the link below.',{action:'cv',links:[{label:'Download CV',href:data.cv,download:true}]});
  case 'date':return result(new Intl.DateTimeFormat(undefined,{dateStyle:'full',timeStyle:'long'}).format(ctx.now||new Date()));
  case 'clear':return result('',{action:'clear'});
  case 'history':return result(ctx.history.map((command,i)=>`${i+1}  ${command}`).join('\n')||'No previous commands.');
  case 'theme':{
   if(!value)return result(`Current portfolio theme: ${ctx.theme}. Use theme dark, theme light, or theme auto.`);
   if(!['dark','light','auto'].includes(value.toLowerCase()))return result('Usage: theme dark | theme light | theme auto');
   const theme=value.toLowerCase() as 'dark'|'light'|'auto';return result(`Portfolio theme: ${theme}.`,{action:'theme',theme});
  }
  case 'exit':return result('Returning to the portfolio.',{action:'close'});
  case 'challenge':{
   if(session.stage===4)return result(`INVESTIGATION COMPLETE\n${completionFlag}\nUse reset to start again.`);
   const next:Session={...session,stage:session.stage||1,cwd:'/investigation'};
   const guidance=next.stage===1?'Read README.txt, memo.txt, and transfer.log.':next.stage===2?'Read evidence/README.txt and evidence/dispatch.b64.':'Read archive/README.txt and archive/audit.log.';
   return result(`Meridian Transfer — The Hidden Incident\n\nAn unusual research-data handover needs investigation. All records are fictional. This short puzzle is separate from the full Meridian Transfer project.\n\n${session.stage?'Resuming':'Starting'} stage ${next.stage}: ${stages[next.stage-1].title}\n${guidance} Use hint whenever you need a nudge.\n\nBrowser-side answers are inspectable. Progress is stored on this device when available.`,{session:next,suggestions:next.stage===1?['ls','cat memo.txt','cat transfer.log']:['status','ls','help challenge']});
  }
  case 'pwd':return result(session.cwd);
  case 'ls':{
   const path=resolveVirtualPath(session.cwd,value||'.');const dir=virtualDirectories.find(d=>d.path===path);
   if(!dir)return result('Directory not found in the virtual investigation.');
   if(session.stage<dir.stage)return result(`Directory locked until stage ${dir.stage}.`);
   const dirs=virtualDirectories.filter(d=>d.path!==path&&d.path.slice(0,d.path.lastIndexOf('/'))===path).map(d=>`${d.path.split('/').at(-1)}/${session.stage<d.stage?` [locked until stage ${d.stage}]`:''}`);
   const files=virtualFiles.filter(f=>f.path.slice(0,f.path.lastIndexOf('/'))===path&&f.stage<=session.stage).map(f=>f.path.split('/').at(-1));
   return result([...files,...dirs].join('\n')||'(empty)');
  }
  case 'cd':{
   const path=resolveVirtualPath(session.cwd,value||'/investigation');const dir=virtualDirectories.find(d=>d.path===path);
   if(!dir)return result('Only predefined directories inside /investigation are available.');
   if(session.stage<dir.stage)return result(`Directory locked until stage ${dir.stage}.`);
   return result(path!,{session:{...session,cwd:path!}});
  }
  case 'cat':{
   if(!value)return result('Usage: cat <file>');
   const path=resolveVirtualPath(session.cwd,value);const file=virtualFiles.find(f=>f.path===path);
   if(!file)return result('File not found in the virtual investigation. Use ls to see available evidence.');
   if(session.stage<file.stage)return result(`Evidence locked until stage ${file.stage}.`);
   return result(file.content);
  }
  case 'decode':{
   const encoded=args.slice(1).join('');
   if(args[0]?.toLowerCase()!=='base64'||!encoded)return result('Usage: decode base64 <encoded-text>');
   if(encoded.length%4!==0||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded))return result('That is not valid Base64. Copy the complete encoded evidence.');
   try{return result(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))));}catch{return result('Unable to decode that Base64 as UTF-8 text.');}
  }
  case 'hint':{
   if(session.stage===4)return result('All stages are complete. Use reset to begin again.');
   if(value&&value!=='1'&&value!=='2')return result('Usage: hint or hint 2');
   return result(`Stage ${session.stage} / Hint ${value||'1'}\n${stages[session.stage-1].hints[value==='2'?1:0]}`);
  }
  case 'status':return result(stages.map((s,i)=>`${i+1}. ${s.title} — ${session.stage>i+1?'Completed':session.stage===i+1?'In progress':'Locked'}`).join('\n')+(session.stage===4?`\n\n${completionFlag}`:''));
  case 'submit':{
   if(session.stage===4)return result('The investigation is already complete. Use reset to restart.');
   if(!value)return result('Usage: submit <answer>');
   if(!validateAnswer(session.stage,value))return result('That answer does not match this stage. Recheck the evidence, or use hint.',{suggestions:['hint','hint 2']});
   const current=stages[session.stage-1];const nextStage=(session.stage+1) as Stage;
   const next:Session={stage:nextStage,cwd:'/investigation',resetPending:false};
   if(nextStage===4)return result(`INVESTIGATION COMPLETE\n\nWell done, Analyst. You traced the Meridian Transfer incident.\n\n${current.learning}\n\n${completionFlag}`,{session:next});
   return result(`Stage ${session.stage} complete.\n${current.learning}\n\nStage ${nextStage} unlocked: ${stages[nextStage-1].title}.\n${nextStage===2?'Read evidence/README.txt and evidence/dispatch.b64.':'Read archive/README.txt and archive/audit.log.'}`,{session:next,suggestions:nextStage===2?['cat evidence/README.txt','cat evidence/dispatch.b64']:['cat archive/README.txt','cat archive/audit.log']});
  }
  case 'reset':{
   if(value==='cancel')return result('Restart cancelled. Progress kept.',{session:{...session,resetPending:false}});
   if(value==='confirm'){
    if(!session.resetPending)return result('Run reset first, then confirm the restart.');
    return result('Progress cleared. Type challenge to start a fresh investigation.',{session:{stage:0,cwd:'/investigation',resetPending:false},suggestions:['challenge']});
   }
   if(value)return result('Usage: reset, reset confirm, or reset cancel');
   return result('Restart and delete saved investigation progress? Confirm with reset confirm, or keep it with reset cancel.',{session:{...session,resetPending:true},suggestions:['reset confirm','reset cancel']});
  }
 }
 return result('Use help to view available commands.');
}

export function autocomplete(input:string,ctx:{data:TerminalDataLike;session:Session}):string[]{
 if(input.length>256)return [];
 const parts=input.trimStart().split(/\s+/);const command=parts[0].toLowerCase();
 if(parts.length===1)return commandRegistry.map(c=>c[0]).filter(name=>name.startsWith(command));
 const prefix=parts.slice(1).join(' ');
 let choices:string[]=[];
 if(command==='projects')choices=ctx.data.projects.map(p=>p.slug);
 if(command==='theme')choices=['dark','light','auto'];
 if(command==='help')choices=['challenge',...commandRegistry.map(c=>c[0])];
 if(command==='cat'||command==='cd'){
  const entries=command==='cat'?virtualFiles:virtualDirectories;
  choices=entries.filter(e=>e.stage<=ctx.session.stage).flatMap(e=>[e.path,e.path.startsWith(ctx.session.cwd+'/')?e.path.slice(ctx.session.cwd.length+1):e.path]);
 }
 return [...new Set(choices)].filter(choice=>choice.startsWith(prefix)).map(choice=>`${command} ${choice}`);
}
type TerminalDataLike={projects:{slug:string}[]};
