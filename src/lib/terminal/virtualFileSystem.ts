import {investigationGuide} from './ctfChallenges';
export const virtualFiles=[
 {path:'/investigation/README.txt',stage:1,content:investigationGuide},
 {path:'/investigation/memo.txt',stage:1,content:`SYNTHETIC INCIDENT RECORD / 2026-09-14 / UTC
Approved handover window: 09:00–09:30.
Signed handovers: MT-018 and MT-026.
Expected destination: partner-vault.
Any unsigned notice outside the window requires review.

Find the suspicious handover in transfer.log. Submit its identifier.
Its dispatch record will become available after the first stage.`},
 {path:'/investigation/transfer.log',stage:1,content:`2026-09-14T09:04Z handover=MT-018 approved=yes destination=partner-vault
2026-09-14T09:16Z handover=MT-026 approved=yes destination=partner-vault
2026-09-14T09:43Z handover=MT-042 approved=no  destination=unresolved dispatch=evidence/dispatch.b64`},
 {path:'/investigation/evidence/README.txt',stage:2,content:`The dispatch record is encoded using Base64, not encrypted.
Read dispatch.b64 and use: decode base64 <encoded-text>
The decoded text links the suspicious handover with a destination and correlation token.
Submit only the correlation token to unlock the audit archive.`},
 {path:'/investigation/evidence/dispatch.b64',stage:2,content:'aGFuZG92ZXI9TVQtMDQyOyBkZXN0aW5hdGlvbj1yZWxheS1ub3J0aDsgY29ycmVsYXRpb249UjdONA=='},
 {path:'/investigation/archive/README.txt',stage:3,content:`Use all the earlier evidence, not just one matching field.
Identify the successful transfer event with the matching handover, correlation token, and destination.
Blocked attempts and verification events are not completed transfers.
Submit the matching transfer event ID.`},
 {path:'/investigation/archive/audit.log',stage:3,content:`SYNTHETIC AUDIT LOG / all times UTC
09:18 event=TX-119 type=transfer handover=MT-026 correlation=J2A1 destination=partner-vault result=success
09:44 event=TX-201 type=transfer handover=MT-042 correlation=R7N4 destination=relay-north  result=blocked
09:45 event=TX-202 type=transfer handover=MT-042 correlation=R7N4 destination=partner-vault result=success
09:47 event=TX-204 type=transfer handover=MT-042 correlation=R7N4 destination=relay-north  result=success
09:48 event=TX-205 type=transfer handover=MT-018 correlation=L9P2 destination=relay-north  result=success
09:49 event=TX-206 type=verify   handover=MT-042 correlation=R7N4 destination=relay-north  result=success`},
] as const;
export const virtualDirectories=[{path:'/investigation',stage:1},{path:'/investigation/evidence',stage:2},{path:'/investigation/archive',stage:3}] as const;
export function resolveVirtualPath(cwd:string,value:string):string|null{
 const input=value.startsWith('/')?value:`${cwd}/${value}`;const parts:string[]=[];
 for(const part of input.split('/')){if(!part||part==='.')continue;if(part==='..')parts.pop();else parts.push(part);}
 const path='/'+parts.join('/');return path==='/investigation'||path.startsWith('/investigation/')?path:null;
}
