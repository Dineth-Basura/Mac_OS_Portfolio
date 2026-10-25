const assert=require('node:assert/strict');
const {createChatHandler}=require('../server/dinu-chat.cjs');
const {createServer}=require('../server/dev.cjs');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 let upstream;
 const event={httpMethod:'POST',headers:{host:'localhost',origin:'http://localhost'},body:JSON.stringify({messages:[{role:'user',text:'What are Dineth’s projects?'}]})};
 const handler=createChatHandler({apiKey:'test-key',fetchImpl:async(url,options)=>{upstream={url,options};return {ok:true,json:async()=>({candidates:[{content:{parts:[{thought:true,text:'private thought'},{text:'Dineth built a CTF platform.'}]}}]})};}});
 let result=await handler(event);assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).reply,'Dineth built a CTF platform.');assert.equal(upstream.options.headers['x-goog-api-key'],'test-key');assert(!result.body.includes('test-key'));
 assert.equal((await handler({...event,httpMethod:'GET'})).statusCode,405);assert.equal((await handler({...event,headers:{host:'localhost',origin:'https://other.test'}})).statusCode,403);assert.equal((await handler({...event,body:'bad json'})).statusCode,400);
 const failed=createChatHandler({apiKey:'test',fetchImpl:async()=>({ok:false,status:403,json:async()=>({error:{message:'secret diagnostic'}})})});result=await failed(event);assert.equal(result.statusCode,502);assert(!result.body.includes('secret diagnostic'));
 const server=createServer();const origin='http://portfolio.test';
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(origin+'/**',route=>{const name=new URL(route.request().url()).pathname;const file=path.resolve(__dirname,'..','.'+(name==='/'?'/index.html':name));if(!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});return route.fulfill({path:file,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':undefined});});
  let contactPayload,formSuccess=false,chatPayload;
  await page.route('https://api.web3forms.com/submit',async route=>{contactPayload=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:formSuccess})});});
  await page.route('**/api/dinu-chat',async route=>{chatPayload=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'Hello! <b>Dineth builds security tools.</b>'})});});
  await page.goto(origin);await page.click('#dinuLauncher');
  await page.fill('#dinuForm [name=name]','Test Visitor');await page.fill('#dinuForm [name=email]','test@example.com');await page.fill('#dinuForm [name=message]','A test message.');
  await page.click('#dinuForm [type=submit]');await page.waitForFunction(()=>document.getElementById('dinuStatus').textContent.includes('couldn'));
  assert.equal(await page.locator('#dinuForm [name=message]').inputValue(),'A test message.');assert.equal(contactPayload.access_key,'099dd01f-1fa6-4a0a-ad7b-6405755aa15a');
  formSuccess=true;await page.click('#dinuForm [type=submit]');await page.waitForFunction(()=>document.getElementById('dinuStatus').textContent.includes('Message sent'));assert.equal(await page.locator('#dinuForm [name=message]').inputValue(),'');
  await page.click('#dinuAITab');await page.fill('#dinuChatInput','What does Dineth build?');await page.press('#dinuChatInput','Enter');await page.waitForFunction(()=>document.querySelectorAll('.dinu-chat-message').length===3&&!document.querySelector('.thinking'));
  assert.equal(chatPayload.messages[0].text,'What does Dineth build?');assert.equal(await page.locator('.dinu-chat-message b').count(),0);
  await page.fill('#dinuChatInput','And his skills?');await page.press('#dinuChatInput','Enter');await page.waitForFunction(()=>document.querySelectorAll('.dinu-chat-message').length===5&&!document.querySelector('.thinking'));assert.equal(chatPayload.messages.length,3);
  await page.click('#dinuClearChat');assert.equal(await page.locator('.dinu-chat-message').count(),1);
  await page.route('**/api/dinu-chat',route=>route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'Please try again later.'})}));await page.fill('#dinuChatInput','Retry me');await page.press('#dinuChatInput','Enter');await page.waitForFunction(()=>document.getElementById('dinuChatStatus').textContent.includes('try again'));assert.equal(await page.locator('#dinuChatInput').inputValue(),'Retry me');
  await page.screenshot({path:'tmp/dinu-ai-preview.png'});await page.setViewportSize({width:375,height:667});await page.screenshot({path:'tmp/dinu-ai-mobile.png'});
  for(const route of ['/.env','/server/dinu-chat.cjs','/assets/../.env','/assets/..%2f.env']){let status;await server.listeners('request')[0]({url:route,headers:{}},{writeHead(code){status=code;},end(){}});assert.equal(status,404);}
  assert.deepEqual(errors,[]);console.log('PASS: Web3Forms success/failure, AI conversation/reset/retry, safe rendering, Gemini proxy validation/auth, private files excluded, mobile. Mocked APIs; no email sent.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
