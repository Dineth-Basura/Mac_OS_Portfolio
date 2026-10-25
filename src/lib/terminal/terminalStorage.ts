import type {Stage} from './types';
const key='db-security-terminal-progress-v1';
export function loadStage():Stage{
 try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored?.version===1&&Number.isInteger(stored.stage)&&stored.stage>=0&&stored.stage<=4)return stored.stage;}catch{}
 return 0;
}
export function saveStage(stage:Stage):void{try{if(stage===0)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify({version:1,stage}));}catch{}}
