'use strict';
const winLayer = document.getElementById('windowLayer');
function openWindow(id) {
  if (!appViews[id]) return;
  let win = document.getElementById('window-' + id);
  if (!win) {
    const cfg = appViews[id];
    win = document.createElement('section'); win.className = 'window'; win.id = 'window-' + id;
    win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', cfg.title); win.tabIndex = -1;
    const offset = (winLayer.children.length % 5) * 26;
    win.style.left = Math.max(12, Math.min(260 + offset, innerWidth - 720)) + 'px';
    win.style.top = Math.min(92 + offset, Math.max(40, innerHeight - 320)) + 'px';
    win.innerHTML = `<header class="window-titlebar"><div class="traffic-controls"><button class="traffic close" aria-label="Close" title="Close">×</button><button class="traffic min" aria-label="Minimize" title="Minimize">−</button><button class="traffic zoom" aria-label="Maximize" title="Zoom">↗</button></div><span class="window-name">${cfg.title}</span></header><div class="window-body">${cfg.body}</div>`;
    winLayer.append(win);
    win.querySelector('.close').onclick = () => closeWindow(id);
    win.querySelector('.min').onclick = () => minimizeWindow(id);
    win.querySelector('.zoom').onclick = () => zoomWindow(id);
    win.querySelector('.window-titlebar').ondblclick = e => { if (!e.target.closest('button')) zoomWindow(id); };
    win.addEventListener('pointerdown', () => focusWindow(id));
    win.addEventListener('focusin', () => focusWindow(id));
    win.addEventListener('click', e => {
      const open = e.target.closest('[data-open]'); if (open) openWindow(open.dataset.open);
      if (e.target.closest('[data-cv]')) openCV();
    });
    makeDraggable(win); setupApp(id, win);
  }
  win.classList.remove('minimized'); win.classList.add('open'); focusWindow(id);
  if (id === 'finder') renderFinder(win);
  if (id === 'calendar') renderCalendarApp(win);
  syncDock();
  const target = win.querySelector(id === 'terminal' ? '#terminalInput' : id === 'journal' ? '#journalNotes' : '.traffic.close');
  target?.focus({preventScroll:true}); return win;
}
function focusWindow(id) {
  const win = document.getElementById('window-' + id); if (!win) return;
  Desktop.active = id;
  document.querySelectorAll('.window').forEach(w => w.classList.toggle('active-window', w === win));
  win.style.zIndex = ++Desktop.z;
  document.querySelector('.menu-label').textContent = id === 'finder' ? 'Finder' : appViews[id].title;
}
function nextWindow() {
  const next = [...document.querySelectorAll('.window.open')].sort((a,b) => Number(b.style.zIndex) - Number(a.style.zIndex))[0];
  if (next) focusWindow(next.id.slice(7)); else { Desktop.active = null; document.querySelector('.menu-label').textContent = 'Finder'; }
}
function closeWindow(id) {
  const win = document.getElementById('window-' + id); if (!win) return;
  if (id === 'camera') stopCamera(win);
  if (id === 'dinu') win.chatAbort?.abort();
  win.remove(); nextWindow(); syncDock();
}
function minimizeWindow(id) {
  const win = document.getElementById('window-' + id); if (!win) return;
  if (id === 'camera') stopCamera(win);
  win.classList.remove('open'); win.classList.add('minimized'); nextWindow(); syncDock();
}
function zoomWindow(id) {
  const win = document.getElementById('window-' + id); if (!win) return;
  win.classList.toggle('fullsize');
  win.querySelector('.zoom').setAttribute('aria-label', win.classList.contains('fullsize') ? 'Restore size' : 'Maximize');
}
function makeDraggable(win) {
  const bar = win.querySelector('.window-titlebar'); let drag = null;
  bar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button') || win.classList.contains('fullsize')) return;
    drag = { x:e.clientX - win.offsetLeft, y:e.clientY - win.offsetTop };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (!drag) return;
    win.style.left = Math.max(0, Math.min(innerWidth - Math.min(win.offsetWidth, 160), e.clientX - drag.x)) + 'px';
    win.style.top = Math.max(33, Math.min(innerHeight - 120, e.clientY - drag.y)) + 'px';
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(event => bar.addEventListener(event, () => drag = null));
}
function syncDock() {
  const running = [...document.querySelectorAll('.window')].map(w => w.id.slice(7));
  const extra = running.filter(id => !dockApps.some(a => a.window === id));
  const apps = [...dockApps, ...extra.map(id => ({ name:appViews[id].title, icon:id==='dinu'?'dinu':id==='calendar'?'calendar':desktopApps.find(a => a.window === id)?.icon || 'folder', window:id }))];
  document.getElementById('dock').innerHTML = apps.map((a,i) => `<button class="dock-app ${running.includes(a.window) ? 'running' : ''}" data-dock="${i}" aria-label="${a.name}" title="${a.name}">${iconMarkup(a.icon)}${document.getElementById('window-' + a.window)?.classList.contains('minimized') ? '<span class="min-badge">−</span>' : ''}</button>`).join('');
  document.getElementById('dock').onclick = e => { const button=e.target.closest('[data-dock]'); if(button) activate(apps[Number(button.dataset.dock)]); };
}
window.addEventListener('resize', () => document.querySelectorAll('.window').forEach(win => {
  win.style.left = Math.max(0, Math.min(win.offsetLeft, innerWidth - Math.min(win.offsetWidth, innerWidth))) + 'px';
  win.style.top = Math.max(33, Math.min(win.offsetTop, innerHeight - 120)) + 'px';
}));
