const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('index.html')).href);
 await page.waitForFunction(()=>!document.getElementById('bootScreen').hidden);
 assert.equal(await page.locator('.boot-caption').count(),0);
 await page.locator('#skipBoot').focus();await page.locator('#skipBoot').click();
 await page.waitForSelector('#bootScreen',{state:'hidden'});
 await page.evaluate(()=>{window.opened=[];window.open=(url)=>{opened.push(url);return {};};});
 // Every registered desktop and Dock app can be opened by its actual UI.
 const count=await page.locator('.desktop-app').count();
 for(let i=0;i<count;i++){
  await page.evaluate(()=>document.querySelectorAll('.window').forEach(w=>closeWindow(w.id.slice(7))));
  await page.locator('.desktop-app').nth(i).dblclick();
 }
 for(let i=0;i<7;i++){
  await page.evaluate(()=>document.querySelectorAll('.window').forEach(w=>closeWindow(w.id.slice(7))));
  await page.locator('.dock-app').nth(i).click();
 }
 const open=async id=>page.evaluate(id=>openWindow(id),id);
 await open('projects');assert.equal(await page.locator('#window-projects a').count(),6);
 await page.locator('#window-projects .min').click();assert(await page.locator('#window-projects').isHidden());
 await page.locator('.dock-app[aria-label="Projects"]').click();assert(await page.locator('#window-projects').isVisible());
 await page.locator('#window-projects .zoom').click();assert(await page.locator('#window-projects').evaluate(w=>w.classList.contains('fullsize')));
 await page.locator('#window-projects .zoom').click();
 const before=await page.locator('#window-projects').boundingBox();
 await page.locator('#window-projects .window-titlebar').hover({position:{x:200,y:22}});await page.mouse.down();await page.mouse.move(before.x+270,before.y+72,{steps:4});await page.mouse.up();
 const after=await page.locator('#window-projects').boundingBox();assert(after.x!==before.x||after.y!==before.y);
 await page.locator('#window-projects .close').click();assert.equal(await page.locator('#window-projects').count(),0);
 // Dropdowns, keyboard navigation, Finder navigation and filtering.
 for(const name of ['apple','app','file','edit','view','go','window','help']){
  await page.locator(`[data-menu="${name}"]`).click();assert(await page.locator('#menuPopover').isVisible());await page.keyboard.press('Escape');
 }
 await page.locator('[data-menu="go"]').click();await page.getByRole('menuitem',{name:'Documents',exact:true}).click();
 assert.equal(await page.locator('#finderLocation').textContent(),'Documents');
 await page.locator('[data-folder="applications"]').click();await page.fill('#finderSearch','instagram');assert.equal(await page.locator('.finder-item').count(),1);
 await page.locator('.finder-item').click();assert((await page.evaluate(()=>opened)).includes('https://www.instagram.com/_dineth_basura/'));
 await page.locator('#spotlightButton').click();await page.fill('#spotlightInput','Calendar');await page.keyboard.press('Enter');assert(await page.locator('#window-calendar').isVisible());
 // Events persist, escape user input, and can be deleted.
 await page.fill('#eventTitle','Meeting <test>');await page.locator('#eventForm button').click();
 assert((await page.locator('#eventList').textContent()).includes('Meeting <test>'));assert.equal(await page.locator('#eventList test').count(),0);
 await page.locator('[data-delete-event]').click();assert.equal(await page.locator('[data-delete-event]').count(),0);
 const month=await page.locator('#monthLabel').textContent();await page.locator('.month-next').click();assert.notEqual(await page.locator('#monthLabel').textContent(),month);await page.locator('.month-prev').click();
 await page.locator('#controlButton').click();await page.locator('#controlCenter [data-theme-toggle]').check();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.keyboard.press('Escape');await open('settings');await page.selectOption('#window-settings [data-pref="wallpaper"]','gradient');assert(await page.locator('#desktop').evaluate(d=>d.classList.contains('wallpaper-gradient')));
 await open('journal');await page.fill('#journalNotes','Persistent note');assert.equal(await page.evaluate(()=>Desktop.read('note','')),'Persistent note');
 await open('terminal');await page.fill('#terminalInput','projects');await page.press('#terminalInput','Enter');assert(!(await page.locator('#terminalDisplay').textContent()).includes('\\n'));
 // Camera error is visible; stopping and closing never leave a pending stream active.
 await open('camera');await page.evaluate(()=>Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw new Error('Permission denied (test)')}}));await page.click('#cameraStart');await page.waitForFunction(()=>document.querySelector('#window-camera [role=status]').textContent.includes('Permission denied'));await page.click('#cameraStop');assert(await page.locator('#cameraStart').isEnabled());
 await page.locator('[data-menu="apple"]').click();await page.getByRole('menuitem',{name:'Lock Screen',exact:false}).click();assert(await page.locator('#lockScreen').isVisible());assert(await page.locator('#desktop').evaluate(d=>d.inert));await page.click('#unlockButton');assert(await page.locator('#lockScreen').isHidden());
 await page.evaluate(()=>document.querySelectorAll('.window').forEach(w=>closeWindow(w.id.slice(7))));
 await page.locator('#desktop').click({button:'right',position:{x:650,y:650}});assert(await page.locator('#menuPopover').isVisible());await page.keyboard.press('Escape');
 await page.evaluate(()=>Object.assign(Desktop.preferences,{theme:'light',wallpaper:'photo'}));await page.evaluate(()=>applyPreferences());
 await page.screenshot({path:'tmp/desktop-preview.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert(await page.locator('#bootScreen').isHidden());
 await open('journal');assert.equal(await page.locator('#journalNotes').inputValue(),'Persistent note');
 await page.setViewportSize({width:375,height:667});await open('finder');
 const box=await page.locator('#window-finder').boundingBox();assert(box.x>=0&&box.x+box.width<=375);
 await page.evaluate(()=>document.querySelectorAll('.window').forEach(w=>closeWindow(w.id.slice(7))));
 for(let i=0;i<count;i++)await page.locator('.desktop-app').nth(i).scrollIntoViewIfNeeded();
 await page.screenshot({path:'tmp/mobile-preview.png'});
 assert(await page.locator('.widgets').isHidden());
 await page.setViewportSize({width:1440,height:900});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>startBoot());
 await page.waitForFunction(()=>document.getElementById('bootVideo').currentTime>0);
 await page.waitForSelector('#bootScreen',{state:'hidden',timeout:15000});
 assert(await page.locator('#desktop').evaluate(d=>!d.inert));
 assert.deepEqual(errors,[]);
 console.log('PASS: app launchers, real menus, minimize/restore/close/zoom, Finder, Spotlight, preferences, calendar events, notes persistence, terminal, camera errors, lock screen, startup, mobile. No JavaScript errors.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
