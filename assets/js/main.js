'use strict';
const desktopIcons=document.getElementById('desktopIcons');
desktopIcons.innerHTML=desktopApps.map((app,i)=>`<button class="desktop-app" data-app="${i}" aria-label="${app.name}">${iconMarkup(app.icon)}<span class="app-label">${app.name}</span></button>`).join('');
desktopIcons.onclick=e=>{const button=e.target.closest('[data-app]');if(button){selectDesktopIcon(Number(button.dataset.app));if(matchMedia('(pointer: coarse)').matches)activate(desktopApps[Number(button.dataset.app)]);}};
desktopIcons.ondblclick=e=>{const button=e.target.closest('[data-app]');if(button&&!matchMedia('(pointer: coarse)').matches)activate(desktopApps[Number(button.dataset.app)]);};
desktopIcons.onkeydown=e=>{const button=e.target.closest('[data-app]');if(button&&(e.key==='Enter'||e.key===' ')){e.preventDefault();activate(desktopApps[Number(button.dataset.app)]);}};
document.getElementById('desktop').addEventListener('pointerdown',e=>{if(e.target.id==='desktop'){Desktop.selected=null;document.querySelectorAll('.desktop-app').forEach(b=>b.classList.remove('selected'));}});
applyPreferences();syncDock();initCalendar();initClock();DesktopLayout.init();startBoot();
