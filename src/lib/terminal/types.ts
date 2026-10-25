export type TerminalData={
 profile:{name:string;role:string;status:string;bio:string;aboutDetail:string;email:string;location:string;github:string;linkedin:string};
 cv:string;
 skills:{title:string;items:string[]}[];
 projects:{slug:string;title:string;category:string;description:string;technologies:string[];href:string;repository:string}[];
 education:{title:string;organization:string;period?:string;description:string}[];
 certifications:{title:string;issuer:string;date?:string;credentialUrl?:string}[];
};
export type Stage=0|1|2|3|4;
export type Session={stage:Stage;cwd:string;resetPending:boolean};
export type TerminalLink={label:string;href:string;download?:boolean};
export type CommandResult={text:string;links?:TerminalLink[];suggestions?:string[];session?:Session;action?:'clear'|'close'|'cv'|'theme';theme?:'dark'|'light'|'auto'};
export type CommandContext={data:TerminalData;session:Session;history:string[];theme:string;now?:Date};
