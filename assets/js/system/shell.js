'use strict';
let overlayReturnFocus = null;
function closeOverlays() {
  ['menuPopover','controlCenter','spotlight'].forEach(id=>document.getElementById(id).hidden=true);
  document.querySelectorAll('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));
  if(overlayReturnFocus?.isConnected)overlayReturnFocus.focus({preventScroll:true});overlayReturnFocus=null;
}
function activeWindow() {return Desktop.active&&document.getElementById('window-'+Desktop.active);}
const item = (label,action,shortcut='',disabled=false) => ({label,action,shortcut,disabled});
function menuItems(name) {
  const active=!!activeWindow();
  const menus={
    apple:[item('About This Mac','open:system'),null,item('System Settings…','open:settings'),item('Enter Full Screen','fullscreen'),null,item('Sleep','lock'),item('Restart…','restart'),item('Lock Screen','lock','⌃⌘Q')],
    app:[item('About '+(Desktop.active?appViews[Desktop.active].title:'Finder'),'open:system'),null,item('Hide Window','minimize','⌘H',!active),item('Quit Window','close','⌘Q',!active)],
    file:[item('New Finder Window','open:finder','⌘N'),item('Open Selected Item','open-selected','⌘O',Desktop.selected===null),item('Open CV','cv'),null,item('Close Window','close','⌘W',!active)],
    edit:[item('Undo','undo','⌘Z',Desktop.active!=='journal'),item('Redo','redo','⇧⌘Z',Desktop.active!=='journal'),null,item('Cut','cut','⌘X',Desktop.active!=='journal'),item('Copy','copy','⌘C',Desktop.active!=='journal'),item('Paste','paste','⌘V',Desktop.active!=='journal'),item('Select All','select-all','⌘A',Desktop.active!=='journal')],
    view:[item('Show Desktop','show-desktop'),item(Desktop.preferences.widgets?'Hide Widgets':'Show Widgets','toggle-widgets'),item('Change Wallpaper…','open:settings'),item('Toggle Full Screen','fullscreen'),null,item('Search','spotlight','⌘Space')],
    go:[item('Recents','finder:recents'),item('Applications','finder:applications'),item('Documents','finder:documents'),null,item('About Me','open:about'),item('Projects','open:projects'),item('Contacts','open:contact')],
    window:[item('Minimize','minimize','⌘M',!active),item('Zoom','zoom','',!active),item('Bring All to Front','bring-front'),null,...[...document.querySelectorAll('.window')].map(w=>item((w.classList.contains('open')?'✓ ':'')+appViews[w.id.slice(7)].title,'open:'+w.id.slice(7)))],
    help:[item('Desktop Help','open:help'),item('Search Apps…','spotlight'),item('Contact Dineth','open:contact')],
    desktop:[item('New Finder Window','open:finder'),item('Open Selected Item','open-selected','',Desktop.selected===null),null,item('Show Desktop','show-desktop'),item('Reset Icon & Widget Positions','reset-layout'),item('Change Wallpaper…','open:settings'),item('Get Info','open:system')]
  };return menus[name]||[];
}
function showMenu(name,anchor,point) {
  const menu=document.getElementById('menuPopover'),same=!menu.hidden&&menu.dataset.menu===name;closeOverlays();if(same&&!point)return;
  overlayReturnFocus=anchor;menu.dataset.menu=name;
  menu.innerHTML=menuItems(name).map(entry=>entry?`<button role="menuitem" data-action="${entry.action}" ${entry.disabled?'disabled':''}><span>${escapeHTML(entry.label)}</span><kbd>${entry.shortcut}</kbd></button>`:'<hr role="separator">').join('');
  menu.hidden=false;const bounds=anchor?.getBoundingClientRect();menu.style.left=Math.min(point?.x??bounds.left,innerWidth-menu.offsetWidth-8)+'px';menu.style.top=Math.min(point?.y??bounds.bottom+4,innerHeight-menu.offsetHeight-8)+'px';
  anchor?.setAttribute('aria-expanded','true');menu.querySelector('button:not(:disabled)')?.focus();
}
document.querySelectorAll('[data-menu]').forEach(button=>{
  button.onclick=()=>showMenu(button.dataset.menu,button);
  button.onpointerenter=()=>{if(!document.getElementById('menuPopover').hidden)showMenu(button.dataset.menu,button);};
});
document.getElementById('menuPopover').onkeydown=e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const buttons=[...e.currentTarget.querySelectorAll('button:not(:disabled)')];const i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}
};
async function runAction(action) {
  // Preserve editor selection before dismissing the menu.
  const note=document.getElementById('journalNotes');const selection=note?{start:note.selectionStart,end:note.selectionEnd}:null;
  closeOverlays();
  if(action.startsWith('open:'))return openWindow(action.slice(5));
  if(action.startsWith('finder:')){const win=openWindow('finder');win.folder=action.slice(7);renderFinder(win);return;}
  const win=activeWindow();
  switch(action){
    case 'open-selected':if(Desktop.selected!==null)activate(desktopApps[Desktop.selected]);break;
    case 'cv':openCV();break;
    case 'reset-layout':DesktopLayout.reset();break;
    case 'test-sound':{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio){Desktop.notify('Audio preview is unavailable in this browser.');break;}
      const context=new Audio(),tone=context.createOscillator(),gain=context.createGain();
      tone.type='sine';tone.frequency.value=660;gain.gain.setValueAtTime(Desktop.preferences.volume/500,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.35);
      tone.connect(gain);gain.connect(context.destination);tone.start();tone.stop(context.currentTime+.4);tone.onended=()=>context.close();break;
    }
    case 'close':if(win)closeWindow(Desktop.active);break;
    case 'minimize':if(win)minimizeWindow(Desktop.active);break;
    case 'zoom':if(win)zoomWindow(Desktop.active);break;
    case 'bring-front':document.querySelectorAll('.window').forEach(w=>openWindow(w.id.slice(7)));break;
    case 'show-desktop':document.querySelectorAll('.window.open').forEach(w=>minimizeWindow(w.id.slice(7)));break;
    case 'toggle-widgets':Desktop.preferences.widgets=!Desktop.preferences.widgets;applyPreferences();break;
    case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{Desktop.notify('Use your browser’s full-screen command.');}break;
    case 'spotlight':openSpotlight();break;
    case 'lock':lockDesktop();break;
    case 'restart':document.querySelectorAll('.window').forEach(w=>closeWindow(w.id.slice(7)));startBoot();break;
    case 'wallpaper-photo':Desktop.preferences.wallpaper='photo';applyPreferences();Desktop.notify('Desktop wallpaper updated.');break;
    case 'new-note':if(note?.value&&!confirm('Clear the current note? Export it first if you want to keep a copy.'))return;if(note){note.value='';note.dispatchEvent(new Event('input'));note.focus();}break;
    case 'export-note':if(note){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([note.value],{type:'text/plain'}));a.download='Notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}break;
    case 'reset-settings':Object.assign(Desktop.preferences,{theme:'light',brightness:100,volume:50,focus:false,widgets:true,autoHide:false,wallpaper:'photo'});applyPreferences();document.querySelectorAll('#window-settings,#controlCenter').forEach(bindPreferences);break;
    case 'select-all':note?.focus();note?.select();break;
    case 'copy':case 'cut':case 'paste':case 'undo':case 'redo':
      if(!note)return;note.focus();note.setSelectionRange(selection.start,selection.end);
      try{
        if(action==='paste'){const value=await navigator.clipboard.readText();document.execCommand('insertText',false,value);}
        else if(action==='copy'||action==='cut'){const value=note.value.slice(selection.start,selection.end);if(navigator.clipboard)await navigator.clipboard.writeText(value);else document.execCommand('copy');if(action==='cut')document.execCommand('delete');}
        else document.execCommand(action);
        note.dispatchEvent(new Event('input'));
      }catch{Desktop.notify('Use '+(navigator.platform.includes('Mac')?'⌘':'Ctrl')+'+'+({copy:'C',cut:'X',paste:'V'}[action]||'Z')+' in the note.');}
      break;
  }
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button)runAction(button.dataset.action);});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.popover,#spotlight,[data-menu],#controlButton,#spotlightButton,#networkButton,#batteryButton'))closeOverlays();});
document.getElementById('desktop').addEventListener('contextmenu',e=>{if(e.target.closest('.window,.dock,.menubar,input,textarea,a'))return;e.preventDefault();const icon=e.target.closest('[data-app]');if(icon)selectDesktopIcon(Number(icon.dataset.app));showMenu('desktop',null,{x:e.clientX,y:e.clientY});});
function selectDesktopIcon(index) {
  Desktop.selected=index;document.querySelectorAll('[data-app]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.app)===index));
}
function showControlCenter() {
  const panel=document.getElementById('controlCenter'),wasOpen=!panel.hidden;closeOverlays();if(wasOpen)return;
  overlayReturnFocus=document.getElementById('controlButton');
  panel.innerHTML=`<div class="control-tiles"><div class="control-tile"><strong>Wi-Fi</strong><span>${navigator.onLine?'Connected to the internet':'Offline'}</span></div><button class="control-tile" data-action="focus"><strong>☾ Focus</strong><span>${Desktop.preferences.focus?'Do Not Disturb on':'Do Not Disturb off'}</span></button></div><label>Display<input data-pref="brightness" type="range" min="25" max="100" aria-label="Display brightness"></label><label>Sound<input data-pref="volume" type="range" min="0" max="100" aria-label="Media volume"></label><label class="control-check">Dark appearance<input data-theme-toggle type="checkbox" ${Desktop.preferences.theme==='dark'?'checked':''}></label><p class="muted">Display and sound apply to this web desktop.</p><button class="control-settings" data-open="settings">System Settings…</button>`;
  bindPreferences(panel);panel.querySelector('[data-theme-toggle]').onchange=e=>{Desktop.preferences.theme=e.target.checked?'dark':'light';applyPreferences();};
  panel.querySelector('[data-action="focus"]').onclick=e=>{e.stopPropagation();toggleFocus();panel.hidden=true;showControlCenter();};
  panel.querySelector('[data-open]').onclick=()=>{closeOverlays();openWindow('settings');};panel.hidden=false;
}
function toggleFocus(){Desktop.preferences.focus=!Desktop.preferences.focus;applyPreferences();Desktop.notify('Do Not Disturb '+(Desktop.preferences.focus?'on':'off'),true);}
document.getElementById('focusButton').onclick=toggleFocus;
document.getElementById('controlButton').onclick=showControlCenter;
document.getElementById('networkButton').onclick=showControlCenter;
document.getElementById('batteryButton').onclick=()=>{Desktop.notify(Desktop.batteryText||'Battery information is managed by your device.');};
if(navigator.getBattery)navigator.getBattery().then(battery=>{const update=()=>{Desktop.batteryText=Math.round(battery.level*100)+'%'+(battery.charging?' · Charging':' · On battery');document.getElementById('batteryButton').textContent='▰ '+Math.round(battery.level*100)+'%';};update();battery.addEventListener('levelchange',update);battery.addEventListener('chargingchange',update);}).catch(()=>{});
function openSpotlight() {
  closeOverlays();overlayReturnFocus=document.activeElement;const panel=document.getElementById('spotlight');panel.hidden=false;const input=document.getElementById('spotlightInput');input.value='';Desktop.searchIndex=0;renderSpotlight();input.focus();
}
function searchApps(){return [...desktopApps,...dockApps,{name:'Calendar',icon:'calendar',window:'calendar'},{name:'System Settings',icon:'settings',window:'settings'},...projects.map(([name],i)=>({name,icon:'github',href:projectLinks[i]}))].filter((a,i,all)=>all.findIndex(b=>b.name===a.name)===i).filter(a=>a.name.toLowerCase().includes(document.getElementById('spotlightInput').value.toLowerCase()));}
function renderSpotlight() {
  const apps=searchApps();Desktop.searchIndex=Math.max(0,Math.min(Desktop.searchIndex,apps.length-1));
  document.getElementById('spotlightResults').innerHTML=apps.map((a,i)=>`<button role="option" aria-selected="${i===Desktop.searchIndex}" data-result="${i}">${iconMarkup(a.icon)}<span>${escapeHTML(a.name)}</span><small>${a.href?'Open website':'Application'}</small></button>`).join('')||'<p>No results found.</p>';
  document.querySelector('[data-result="'+Desktop.searchIndex+'"]')?.scrollIntoView({block:'nearest'});
}
document.getElementById('spotlightInput').oninput=()=>{Desktop.searchIndex=0;renderSpotlight();};
document.getElementById('spotlight').onkeydown=e=>{const apps=searchApps();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();Desktop.searchIndex+=e.key==='ArrowDown'?1:-1;renderSpotlight();}if(e.key==='Enter'&&apps[Desktop.searchIndex]){e.preventDefault();activate(apps[Desktop.searchIndex]);}if(e.key==='Tab'){e.preventDefault();document.getElementById('spotlightInput').focus();}};
document.getElementById('spotlightResults').onclick=e=>{const b=e.target.closest('[data-result]');if(b)activate(searchApps()[Number(b.dataset.result)]);};
document.getElementById('spotlightButton').onclick=openSpotlight;document.getElementById('closeSpotlight').onclick=closeOverlays;
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeOverlays();return;}
  if(!document.getElementById('lockScreen').hidden||!document.getElementById('bootScreen').hidden)return;
  if((e.metaKey||e.ctrlKey)&&e.code==='Space'){e.preventDefault();openSpotlight();return;}
  if(!(e.metaKey||e.ctrlKey)||e.target.matches('input,textarea'))return;
  const actions={w:'close',m:'minimize',n:'open:finder',o:'open-selected'};if(actions[e.key.toLowerCase()]){e.preventDefault();runAction(actions[e.key.toLowerCase()]);}
});
