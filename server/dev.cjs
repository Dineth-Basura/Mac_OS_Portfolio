'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {createChatHandler}=require('./dinu-chat.cjs');
const root=path.resolve(__dirname,'..'),chat=createChatHandler();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4'};
function createServer(){return http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/dinu-chat'){
    let body='',size=0;for await(const part of req){size+=part.length;if(size>24000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Request too large.'}));return;}body+=part;}
    const result=await chat({httpMethod:req.method,headers:req.headers,body,clientAddress:req.socket.remoteAddress});res.writeHead(result.statusCode,result.headers);res.end(result.body);return;
  }
  let relative;try{relative=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}
  if(relative==='/')relative='/index.html';
  // Only the explicit public entry page and assets are served, never .env or server files.
  if(relative!=='/index.html'&&!relative.startsWith('/assets/')){res.writeHead(404);res.end('Not found');return;}
  const file=path.resolve(root,'.'+relative);
  if(relative!=='/index.html'&&!file.startsWith(path.join(root,'assets')+path.sep)){res.writeHead(404);res.end('Not found');return;}
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  const stat=fs.statSync(file),headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);return;}
  res.writeHead(200,{...headers,'Content-Length':stat.size});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});}
if(require.main===module){const port=Number(process.env.PORT)||3000;createServer().listen(port,'127.0.0.1',()=>console.log(`Portfolio running at http://localhost:${port}`));}
module.exports={createServer};
