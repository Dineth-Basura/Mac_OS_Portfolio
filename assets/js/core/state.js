'use strict';
// Shared browser-only state. Content lives in data/ and apps/views.js.
const Desktop = {
  active: null, selected: null, z: 40, calendar: new Date(), searchIndex: 0,
  read(key, fallback) { try { return JSON.parse(localStorage.getItem('desktop.' + key)) ?? fallback; } catch { return fallback; } },
  save(key, value) { try { localStorage.setItem('desktop.' + key, JSON.stringify(value)); } catch {} },
  notify(message, force = false) {
    if (this.preferences.focus && !force) return;
    const toast = document.getElementById('toast');
    toast.textContent = message; toast.hidden = false;
    clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => toast.hidden = true, 3500);
  }
};
Desktop.preferences = { theme:'light', brightness:100, volume:50, focus:false, widgets:true, autoHide:false, wallpaper:'photo', ...Desktop.read('preferences', {}) };
function applyPreferences() {
  const p = Desktop.preferences;
  document.documentElement.dataset.theme = p.theme;
  document.documentElement.style.setProperty('--screen-dim', (100 - p.brightness) / 130);
  document.body.classList.toggle('hide-widgets', !p.widgets);
  document.body.classList.toggle('dock-autohide', p.autoHide);
  document.getElementById('desktop').classList.toggle('wallpaper-gradient', p.wallpaper === 'gradient');
  document.getElementById('focusButton').setAttribute('aria-pressed', String(p.focus));
  document.getElementById('bootVideo').volume = p.volume / 100;
  Desktop.save('preferences', p);
}
function iconMarkup(icon) {
  const file=iconImages[icon];
  const metric=iconMetrics[icon]||{size:100,x:0,y:0};
  const content=file?`<img src="assets/images/app_icons/${encodeURIComponent(file)}" alt="" width="64" height="64" draggable="false" decoding="async" style="--art-size:${metric.size}%;--art-x:${metric.x}%;--art-y:${metric.y}%" data-icon-fallback="${icon}">`:(icons[icon]||icons.folder);
  return `<span class="app-icon ${icon==='folder'?'is-folder':''} ${file?'has-image':''}" aria-hidden="true">${content}</span>`;
}
// A missing custom file must not leave a broken-image symbol on the desktop.
document.addEventListener('error',event=>{
  const img=event.target;
  if(img instanceof HTMLImageElement&&img.dataset.iconFallback){
    const parent=img.parentElement;parent.classList.remove('has-image');parent.innerHTML=icons[img.dataset.iconFallback]||icons.folder;
  }
},true);
function escapeHTML(text) { return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function openCV() { window.open('assets/documents/Dineth_Basura_CV.pdf', '_blank', 'noopener,noreferrer'); }
function activate(app) {
  closeOverlays();
  if (app.window) return openWindow(app.window);
  if (app.action === 'cv') return openCV();
  if (app.href) window.open(app.href, '_blank', 'noopener,noreferrer');
}
