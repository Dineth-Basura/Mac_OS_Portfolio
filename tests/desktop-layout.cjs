const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(10000);
 let delivered;
 await page.route('https://api.web3forms.com/submit',async route=>{delivered=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('index.html')).href);
 await page.waitForSelector('.free-layout');
 assert.equal(await page.getByRole('button',{name:'devlyhub',exact:true}).count(),0);
 assert.equal(await page.locator('.desktop-app').count(),19);
 const drag=async(selector,dx,dy)=>{
  const locator=page.locator(selector),before=await locator.boundingBox();
  await page.mouse.move(before.x+before.width/2,before.y+before.height/2);await page.mouse.down();
  await page.mouse.move(before.x+before.width/2+dx,before.y+before.height/2+dy,{steps:10});await page.mouse.up();
  return {before,after:await locator.boundingBox()};
 };
 let moved=await drag('[data-app="0"]',440,180);assert(moved.after.x-moved.before.x>400);assert.equal(await page.locator('.window').count(),0);
 const saved=await page.evaluate(()=>Desktop.read('layout',{}));assert(saved['app:YouTube']);
 await page.reload();await page.waitForSelector('.free-layout');
 let restored=await page.locator('[data-app="0"]').boundingBox();assert(Math.abs(restored.x-moved.after.x)<=2);assert(Math.abs(restored.y-moved.after.y)<=2);
 await page.locator('[data-app="0"]').focus();await page.keyboard.press('Alt+ArrowRight');const nudged=await page.locator('[data-app="0"]').boundingBox();assert(nudged.x>restored.x);
 // Each individual widget moves and persists; dragging never activates its click action.
 for(const [selector,key] of [['#clockWidget','clock'],['.calendar.widget','calendar'],['#weatherWidget','weather']]){
  const grip=page.locator(selector+' .widget-grip'),bounds=await grip.boundingBox();
  const before=await page.locator(selector).boundingBox();
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width/2-150,bounds.y+bounds.height/2+80,{steps:10});await page.mouse.up();
  const after=await page.locator(selector).boundingBox();assert(Math.abs(after.x-before.x)>100);assert((await page.evaluate(()=>Desktop.read('layout',{})))['widget:'+key]);
 }
 assert.equal(context.pages().length,1);assert.equal(await page.locator('.window').count(),0);
 const layoutBefore=await page.evaluate(()=>Desktop.read('layout',{}));await page.reload();await page.waitForSelector('.free-layout');assert.deepEqual(await page.evaluate(()=>Desktop.read('layout',{})),layoutBefore);
 await page.evaluate(()=>{window.opened=[];window.open=(url)=>{opened.push(url);return {};};});
 await page.locator('#dinuLauncher').click();assert(await page.locator('#window-dinu').isVisible());
 await page.locator('#dinuForm [type=submit]').click();assert.equal((await page.evaluate(()=>opened)).length,0);
 await page.locator('[data-message]').first().click();assert((await page.locator('#dinuForm textarea').inputValue()).includes('collaborate'));
 await page.fill('#dinuForm [name=name]','Visitor & Friend');await page.fill('#dinuForm [name=email]','visitor@example.com');await page.fill('#dinuForm [name=message]','Hello Dineth! <nice work> & thanks.');
 await page.locator('#dinuForm [type=submit]').click();await page.waitForFunction(()=>document.querySelector('#dinuStatus').textContent.includes('Message sent'));assert.equal(delivered.message,'Hello Dineth! <nice work> & thanks.');assert.equal(delivered.email,'visitor@example.com');assert.equal(await page.locator('#dinuForm nice').count(),0);
 await page.screenshot({path:'tmp/dinu-preview.png'});
 await page.locator('#window-dinu .min').click();await page.locator('.dock-app[aria-label="Dinu"]').click();assert(await page.locator('#window-dinu').isVisible());
 await page.locator('#window-dinu .close').click();await page.evaluate(()=>DesktopLayout.reset());assert.deepEqual(await page.evaluate(()=>Desktop.read('layout',{})),{});
 await page.screenshot({path:'tmp/draggable-desktop.png'});
 await page.setViewportSize({width:375,height:667});await page.waitForTimeout(150);
 moved=await drag('[data-app="0"]',900,900);assert(moved.after.x>=0&&moved.after.x+moved.after.width<=375);assert(moved.after.y+moved.after.height<667-70);
 await page.locator('#dinuLauncher').click();const dinu=await page.locator('#window-dinu').boundingBox();assert(dinu.x>=0&&dinu.x+dinu.width<=375);await page.screenshot({path:'tmp/dinu-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: app and widget dragging, launch suppression, saved layouts, keyboard nudging, viewport bounds, reset, devlyhub removal, Dinu form validation/email draft, minimize/restore, mobile.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
