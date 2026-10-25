import {useEffect,useRef,useState,type SubmitEvent,type KeyboardEvent} from 'react';
import {executeCommand,autocomplete} from '../../lib/terminal/executeCommand';
import {loadStage,saveStage} from '../../lib/terminal/terminalStorage';
import {stages,completionFlag} from '../../lib/terminal/ctfChallenges';
import type {TerminalData,Session,TerminalLink} from '../../lib/terminal/types';
type Entry={id:number;command:string;text:string;links?:TerminalLink[];suggestions?:string[]};
export default function SecurityTerminal({data,onClose}:{data:TerminalData;onClose:()=>void}){
 const [session,setSession]=useState<Session>(()=>({stage:loadStage(),cwd:'/investigation',resetPending:false}));
 const sessionRef=useRef(session);const [entries,setEntries]=useState<Entry[]>([]);const [value,setValue]=useState('');
 const input=useRef<HTMLInputElement>(null);const output=useRef<HTMLDivElement>(null);const history=useRef<string[]>([]);const historyIndex=useRef(0);const draft=useRef('');const nextId=useRef(0);
 useEffect(()=>{input.current?.focus();},[]);
 useEffect(()=>{const area=output.current;if(area)area.scrollTop=area.scrollHeight;},[entries,session.stage]);
 function run(command:string){
  if(!command.trim()){setValue('');return;}
  const bounded=command.slice(0,256);history.current=[...history.current,bounded].slice(-80);historyIndex.current=history.current.length;draft.current='';
  const result=executeCommand(bounded,{data,session:sessionRef.current,history:history.current,theme:document.documentElement.dataset.theme||'light'});
  setValue('');if(!result)return;
  if(result.session){sessionRef.current=result.session;setSession(result.session);saveStage(result.session.stage);}
  if(result.action==='clear'){setEntries([]);input.current?.focus();return;}
  if(result.action==='theme'&&result.theme){
   const target=result.theme==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):result.theme;
   if(document.documentElement.dataset.theme!==target)document.querySelector<HTMLButtonElement>('.theme-toggle')?.click();
   if(result.theme==='auto')try{localStorage.removeItem('db-theme');}catch{}
  }
  if(result.action==='cv'){const link=document.createElement('a');link.href=data.cv;link.download='';document.body.appendChild(link);link.click();link.remove();}
  setEntries(previous=>[...previous,{id:nextId.current++,command:bounded,text:result.text,links:result.links,suggestions:result.suggestions}].slice(-80));
  if(result.action==='close')onClose();else input.current?.focus();
 }
 function submit(event:SubmitEvent<HTMLFormElement>){event.preventDefault();run(value);}
 function keyboard(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='ArrowUp'){event.preventDefault();if(historyIndex.current===history.current.length)draft.current=value;historyIndex.current=Math.max(0,historyIndex.current-1);setValue(history.current[historyIndex.current]||'');}
  if(event.key==='ArrowDown'){event.preventDefault();historyIndex.current=Math.min(history.current.length,historyIndex.current+1);setValue(historyIndex.current===history.current.length?draft.current:history.current[historyIndex.current]);}
  if(event.key==='Tab'&&!event.shiftKey&&value.trim()){
   const choices=autocomplete(value,{data,session:sessionRef.current});if(choices.length){event.preventDefault();if(choices.length===1)setValue(choices[0]+' ');else setEntries(previous=>[...previous,{id:nextId.current++,command:'',text:'Matches: '+choices.join(' · ')}].slice(-80));}
  }
  if(event.key.toLowerCase()==='l'&&event.ctrlKey){event.preventDefault();run('clear');}
 }
 const project=data.projects.find(p=>p.slug==='meridian-transfer');
 return <div className="security-terminal">
  <header className="terminal-titlebar"><div><span className="terminal-mark" aria-hidden="true">&gt;_</span><h2>Dineth's Security Terminal</h2></div><div className="terminal-window-actions"><button title="Change theme" aria-label="Change terminal theme" onClick={()=>run(`theme ${document.documentElement.dataset.theme==='dark'?'light':'dark'}`)}>◐</button><button title="Minimize" aria-label="Minimize terminal" onClick={onClose}>−</button><button title="Return to portfolio" aria-label="Close terminal" onClick={onClose}>×</button></div></header>
  {session.stage>0&&<section className="terminal-progress" aria-label="Investigation progress"><div className="terminal-progress-heading"><span>MERIDIAN TRANSFER / MINI CTF</span><span>{Math.min(session.stage-1,3)} / 3 complete</span></div><div className="terminal-progress-track" aria-hidden="true"><span style={{width:`${Math.min(session.stage-1,3)/3*100}%`}}/></div><ol>{stages.map((stage,index)=><li key={stage.title} data-state={session.stage>index+1?'complete':session.stage===index+1?'active':'locked'}><span>{session.stage>index+1?'✓':`0${index+1}`}</span><div>{stage.title}<small>{session.stage>index+1?'Completed':session.stage===index+1?'In progress':'Locked'}</small></div></li>)}</ol></section>}
  <div ref={output} className="terminal-output" role="log" aria-label="Terminal output" aria-live="polite" aria-relevant="additions" tabIndex={0}>
   <div className="terminal-welcome"><p>Welcome to Dineth's Security Terminal.</p><p>{data.profile.role}</p><p>Type <button onClick={()=>run('help')}>help</button> to see the commands. This terminal runs entirely in your browser.</p></div>
   {entries.map(entry=><div className="terminal-entry" key={entry.id}>{entry.command&&<div className="terminal-echo"><span aria-hidden="true">$</span> {entry.command}</div>}<pre>{entry.text}</pre>{entry.links&&entry.links.length>0&&<div className="terminal-result-links">{entry.links.map(link=><a key={link.href} href={link.href} download={link.download||undefined} target={link.href.startsWith('https://')?'_blank':undefined} rel="noopener noreferrer">{link.label} ↗</a>)}</div>}{entry.suggestions&&<div className="terminal-suggestions">{entry.suggestions.map(command=><button key={command} onClick={()=>run(command)}>{command}</button>)}</div>}</div>)}
   {session.stage===4&&<section className="terminal-completion" aria-label="Investigation complete"><span className="terminal-completion-check" aria-hidden="true">✓</span><h3>INVESTIGATION COMPLETE</h3><p>Three stages solved. Evidence inspection, Base64 decoding, and log correlation.</p><code>{completionFlag}</code><div><button onClick={()=>run('reset')}>Restart challenge</button><a href={project?.href||'/#projects'} onClick={onClose}>View Meridian Transfer project ↗</a></div></section>}
   {session.resetPending&&<div className="terminal-reset-prompt"><p>Restart this investigation and delete saved progress?</p><button onClick={()=>run('reset confirm')}>Confirm restart</button><button onClick={()=>run('reset cancel')}>Keep progress</button></div>}
  </div>
  <form className="terminal-input-form" onSubmit={submit}><label htmlFor="terminal-command" className="sr-only">Terminal command</label><span className="terminal-prompt" aria-hidden="true">{session.stage>0?session.cwd.replace('/investigation','case'):'guest@dineth'} $</span><input ref={input} id="terminal-command" name="command" value={value} onChange={event=>setValue(event.target.value)} onKeyDown={keyboard} maxLength={256} autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="send" placeholder="Type a command…"/><button type="submit" aria-label="Run command">↵</button></form>
  <footer className="terminal-footer"><div>{['help','whoami','projects','cv'].map(command=><button key={command} onClick={()=>run(command)}>{command}</button>)}</div><span>↑↓ history · Tab complete · Esc exit</span></footer>
 </div>;
}
