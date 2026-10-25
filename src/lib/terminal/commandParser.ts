export function parseCommand(raw:string):{name:string;args:string[]}|null{
 if(raw.length>256)throw Error('Commands must be 256 characters or fewer.');
 const input=raw.trim();if(!input)return null;
 const tokens:string[]=[];let token='';let quote='';let started=false;
 for(const character of input){
  if(quote){if(character===quote)quote='';else token+=character;started=true;}
  else if(character==='"'||character==="'"){quote=character;started=true;}
  else if(/\s/.test(character)){if(started){tokens.push(token);token='';started=false;}}
  else{token+=character;started=true;}
 }
 if(quote)throw Error('Close the quotation mark and try again.');
 if(started)tokens.push(token);
 return {name:tokens[0].toLowerCase(),args:tokens.slice(1)};
}
