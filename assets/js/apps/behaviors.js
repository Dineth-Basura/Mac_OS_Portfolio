'use strict';
appViews.finder = {title:'Finder',body:'<div class="finder"><nav class="finder-sidebar" aria-label="Finder sidebar"></nav><main class="finder-main"><div class="finder-toolbar"><button data-finder-back aria-label="Back">‹</button><strong id="finderLocation">Recents</strong><button data-finder-layout aria-label="Switch view">☷</button><input id="finderSearch" type="search" placeholder="Search" aria-label="Search this folder"></div><div id="finderItems"></div><p class="finder-status"></p></main></div>'};
appViews.settings = {title:'System Settings',body:`<h1>Appearance</h1><div class="settings-grid">
<label>Appearance<select data-pref="theme"><option value="light">Light</option><option value="dark">Dark</option></select></label>
<label>Wallpaper<select data-pref="wallpaper"><option value="photo">Sunset café</option><option value="gradient">Sonoma gradient</option></select></label>
<label>Display brightness<input data-pref="brightness" type="range" min="25" max="100"></label>
<label>Media volume<input data-pref="volume" type="range" min="0" max="100"></label>
<label>Show desktop widgets<input data-pref="widgets" type="checkbox"></label>
<label>Automatically hide Dock<input data-pref="autoHide" type="checkbox"></label>
<label>Do Not Disturb<input data-pref="focus" type="checkbox"></label></div><p class="muted">Settings apply to this desktop and are remembered in your browser.</p><div class="chips"><button class="action-link" data-action="test-sound">Test sound</button><button class="action-link" data-action="fullscreen">Enter full screen</button><button class="action-link" data-action="reset-settings">Restore defaults</button></div>`};
appViews.photos = {title:'Photos',body:'<h1>Library</h1><p>Sunset café · Desktop wallpaper</p><img class="gallery-image" src="assets/images/wallpaper.jpg" alt="Sunset café overlooking the sea"><div class="chips"><button class="action-link" data-action="wallpaper-photo">Set as wallpaper</button><a class="action-link" href="assets/images/wallpaper.jpg" download="Sunset-Cafe.jpg">Download photo</a></div>'};
appViews.journal = {title:'Notes',body:'<div class="notes-toolbar"><button data-action="new-note">New note</button><button data-action="export-note">Export note</button><span id="noteStatus" role="status">Saved locally</span></div><h1>Notes</h1><textarea id="journalNotes" aria-label="Note" placeholder="Start writing…"></textarea>'};
appViews.calendar = {title:'Calendar',body:'<div class="calendar-app"><div class="calendar-toolbar"><button data-calendar-shift="-1" aria-label="Previous month">‹</button><h1 id="calendarTitle"></h1><button data-calendar-shift="1" aria-label="Next month">›</button><button data-calendar-today>Today</button></div><div id="calendarGrid"></div><h2 id="eventDate"></h2><div id="eventList"></div><form id="eventForm"><input id="eventTitle" aria-label="Event title" placeholder="Add an event" maxlength="120" required><input id="eventTime" aria-label="Event time" type="time" value="09:00"><button class="action-link">Add event</button></form></div>'};
appViews.system = {title:'About This Mac',body:`<div class="about-system"><div class="mac-symbol">▱</div><h1>Mac-style Desktop</h1><p>Dineth Basura · Portfolio</p><p class="muted">An interactive web desktop.</p><dl><dt>Display</dt><dd>${screen.width} × ${screen.height}</dd><dt>Platform</dt><dd>${escapeHTML(navigator.platform)}</dd><dt>Storage</dt><dd>Browser local storage</dd></dl><button class="action-link" data-open="settings">System Settings…</button></div>`};
appViews.help.body = '<h1>Desktop Help</h1><p>Double-click a desktop icon to open it. On touch screens, tap once. Dock icons open or restore apps.</p><p>Drag a window by its title bar. Drag its lower-right corner to resize. Red closes, yellow minimizes to the Dock, and green changes window size. Double-click the title bar to zoom.</p><p>Use the menu bar for app actions. Press Ctrl/⌘ + Space for Spotlight, Ctrl/⌘ + W to close, or Ctrl/⌘ + M to minimize. Right-click the desktop for more options.</p><p>Notes, appearance settings, and calendar events are saved in this browser. Camera access needs your permission. External apps open their websites.</p>';
appViews.blog.body = '<h1>Security Notes</h1><div class="cards">'+projects.slice(0,3).map(([name,description],i)=>`<article class="card"><strong>${name}</strong><p>${description}</p><a href="${projectLinks[i]}" target="_blank" rel="noopener noreferrer">Read project source ↗</a></article>`).join('')+'</div>';
const finderFolders = {recents:'Recents',about:'About Me',projects:'Projects',skills:'Skills',experience:'Education',contact:'Contacts',documents:'Documents',applications:'Applications'};
function setupApp(id, win) {
  if (id === 'dinu') setupDinu(win);
  if (id === 'finder') {
    win.folder='recents'; win.history=[]; win.listView=false;
    win.querySelector('.finder-sidebar').innerHTML='<small>Favorites</small>'+Object.entries(finderFolders).map(([key,label])=>`<button data-folder="${key}">${label}</button>`).join('');
    win.querySelector('.finder-sidebar').onclick=e=>{const b=e.target.closest('[data-folder]');if(b){win.history.push(win.folder);win.folder=b.dataset.folder;win.querySelector('#finderSearch').value='';renderFinder(win);}};
    win.querySelector('#finderSearch').oninput=()=>renderFinder(win);
    win.querySelector('[data-finder-back]').onclick=()=>{win.folder=win.history.pop()||'recents';renderFinder(win);};
    win.querySelector('[data-finder-layout]').onclick=()=>{win.listView=!win.listView;renderFinder(win);};
  }
  if (id === 'journal') {
    const input=win.querySelector('#journalNotes');input.value=Desktop.read('note','');
    input.oninput=()=>{Desktop.save('note',input.value);win.querySelector('#noteStatus').textContent='Saved · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});};
  }
  if (id === 'settings') bindPreferences(win);
  if (id === 'terminal') enableTerminal(win);
  if (id === 'camera') enableCamera(win);
  if (id === 'calendar') setupCalendarApp(win);
}
function renderFinder(win) {
  const folder=win.folder||'recents',query=win.querySelector('#finderSearch').value.toLowerCase();
  win.querySelector('#finderLocation').textContent=finderFolders[folder];
  win.querySelectorAll('[data-folder]').forEach(b=>b.classList.toggle('chosen',b.dataset.folder===folder));
  win.querySelector('[data-finder-back]').disabled=!win.history.length;
  const container=win.querySelector('#finderItems');container.className=win.listView?'finder-list':'finder-grid';
  let entries;
  if(folder==='documents')entries=[{name:'Dineth Basura CV.pdf',icon:'pdf',action:'cv'}];
  else if(folder==='applications')entries=[...desktopApps,...dockApps];
  else if(folder==='projects')entries=projects.map(([name],i)=>({name,icon:'github',href:projectLinks[i]}));
  else if(folder==='recents')entries=[{name:'Resume.pdf',icon:'pdf',action:'cv'},...['about','projects','skills','experience','contact'].map(id=>({name:appViews[id].title,icon:'folder',window:id}))];
  else entries=[{name:appViews[folder].title,icon:'folder',window:folder}];
  entries=entries.filter(a=>a.name.toLowerCase().includes(query));
  container.innerHTML=entries.map((a,i)=>`<button class="finder-item" data-file="${i}">${iconMarkup(a.icon)}<span>${escapeHTML(a.name)}</span>${win.listView?'<small>'+ (a.href?'Web link':a.action?'PDF document':'Folder')+'</small>':''}</button>`).join('')||'<p class="muted">No matching items.</p>';
  container.onclick=e=>{const b=e.target.closest('[data-file]');if(b)activate(entries[Number(b.dataset.file)]);};
  win.querySelector('.finder-status').textContent=entries.length+' items';
}
function bindPreferences(container) {
  container.querySelectorAll('[data-pref]').forEach(input=>{
    const key=input.dataset.pref;
    if(input.type==='checkbox')input.checked=Desktop.preferences[key];else input.value=Desktop.preferences[key];
    input.oninput=()=>{Desktop.preferences[key]=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;applyPreferences();
      document.querySelectorAll(`[data-pref="${key}"]`).forEach(other=>{if(other!==input){if(other.type==='checkbox')other.checked=input.checked;else other.value=input.value;}});
    };
  });
}
function enableTerminal(win) {
  const input=win.querySelector('#terminalInput'),out=win.querySelector('#terminalDisplay'),history=[];let position=0;
  out.textContent='Last login: '+new Date().toLocaleString()+'\ndineth@mac ~ %\nType help for commands.';
  input.onkeydown=e=>{
    if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();position=Math.max(0,Math.min(history.length,position+(e.key==='ArrowUp'?-1:1)));input.value=history[position]||'';return;}
    if(e.key!=='Enter')return;
    const text=input.value.trim(),cmd=text.toLowerCase();if(!cmd)return;input.value='';history.push(text);position=history.length;
    if(cmd==='clear'){out.textContent='';return;}
    const responses={help:'help, whoami, pwd, ls, date, skills, projects, cv, open <app>, clear',whoami:'Dineth Basura — Cyber Security Undergraduate',pwd:'/Users/dineth/Desktop',ls:desktopApps.map(a=>a.name).join('  '),date:new Date().toString(),skills:'Python · Java · C · React · AWS · Linux · Networking',projects:projects.map(([n])=>n).join('\n'),cv:'Opening CV…'};
    let result=responses[cmd];
    if(cmd.startsWith('open ')){const name=cmd.slice(5);const app=[...desktopApps,...dockApps].find(a=>a.name.toLowerCase()===name||a.window===name);if(app){activate(app);result='Opened '+app.name;}else result='App not found: '+name;}
    out.textContent+='\ndineth@mac ~ % '+text+'\n'+(result||'Command not found. Type help.');out.scrollTop=out.scrollHeight;if(cmd==='cv')openCV();
  };
}
function enableCamera(win) {
  const video=win.querySelector('#cameraPreview'),start=win.querySelector('#cameraStart');win.cameraRequest=0;
  const status=document.createElement('p');status.setAttribute('role','status');video.after(status);
  const capture=document.createElement('button');capture.className='action-link';capture.textContent='Take photo';capture.disabled=true;win.querySelector('.chips').append(capture);
  capture.onclick=()=>{if(!video.videoWidth)return;const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);const a=document.createElement('a');a.download='Photo-'+Date.now()+'.png';a.href=canvas.toDataURL('image/png');a.click();};
  start.onclick=async()=>{
    if(video.srcObject)return;const request=++win.cameraRequest;start.disabled=true;status.textContent='Waiting for camera permission…';
    try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera requires HTTPS or localhost.');const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
      if(request!==win.cameraRequest||!win.isConnected||!win.classList.contains('open')){stream.getTracks().forEach(t=>t.stop());return;}
      video.srcObject=stream;video.style.display='block';capture.disabled=false;status.textContent='Camera is on.';
    }catch(error){if(request===win.cameraRequest)status.textContent='Camera unavailable. '+error.message;}
    finally{if(request===win.cameraRequest)start.disabled=false;}
  };
  win.querySelector('#cameraStop').onclick=()=>{stopCamera(win);capture.disabled=true;status.textContent='Camera is off.';};
}
function stopCamera(win) {
  ++win.cameraRequest;const video=win.querySelector('#cameraPreview');
  video?.srcObject?.getTracks().forEach(track=>track.stop());if(video){video.srcObject=null;video.style.display='none';}
  const start=win.querySelector('#cameraStart');if(start)start.disabled=false;
}
