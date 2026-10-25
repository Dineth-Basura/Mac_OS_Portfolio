'use strict';
function startBoot(){
  closeOverlays();const boot=document.getElementById('bootScreen'),video=document.getElementById('bootVideo'),desktop=document.getElementById('desktop');
  document.getElementById('lockScreen').hidden=true;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){boot.hidden=true;desktop.inert=false;return;}
  boot.classList.remove('leaving');boot.hidden=false;desktop.inert=true;video.currentTime=0;
  let finished=false;let limit;
  const finish=()=>{if(finished)return;finished=true;clearTimeout(limit);video.pause();desktop.inert=false;boot.classList.add('leaving');video.removeEventListener('ended',finish);video.removeEventListener('error',finish);setTimeout(()=>{boot.hidden=true;document.querySelector('.desktop-app')?.focus({preventScroll:true});},550);};
  limit=setTimeout(finish,12000);video.addEventListener('ended',finish);video.addEventListener('error',finish);
  document.getElementById('skipBoot').onclick=finish;
  boot.onkeydown=e=>{if(e.key==='Escape')finish();if(e.key==='Tab'){e.preventDefault();document.getElementById('skipBoot').focus();}};
  video.play().catch(finish);
}
function lockDesktop(){
  closeOverlays();const camera=document.getElementById('window-camera');if(camera)stopCamera(camera);
  document.getElementById('lockScreen').hidden=false;document.getElementById('desktop').inert=true;document.getElementById('unlockButton').focus();
}
document.getElementById('unlockButton').onclick=()=>{document.getElementById('lockScreen').hidden=true;document.getElementById('desktop').inert=false;document.querySelector('.desktop-app')?.focus();};
document.getElementById('lockScreen').onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();document.getElementById('unlockButton').focus();}};
window.addEventListener('pagehide',()=>{const camera=document.getElementById('window-camera');if(camera)stopCamera(camera);});
