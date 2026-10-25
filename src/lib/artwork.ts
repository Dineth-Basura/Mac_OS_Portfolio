import type { AnimationItem } from 'lottie-web';

export function initArtwork() {
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll<HTMLElement>('[data-artwork]').forEach(element=>{
  if(element.dataset.initialized)return;
  element.dataset.initialized='true';
  let animation:AnimationItem|undefined;
  let visible=false, loading=false, disposed=false;
  const scrollDriven=element.dataset.scrollArtwork==='true';
  const sync=()=>{
   if(!animation)return;
   if(preference.matches){animation.goToAndStop(0,true);return;}
   if(scrollDriven){
    const progress=Number(document.querySelector<HTMLElement>('[data-studio-scene]')?.dataset.progress||0);
    animation.goToAndStop(progress*Math.max(0,animation.totalFrames-1),true);
   }else if(visible && !document.hidden)animation.play();else animation.pause();
  };
  const observer=new IntersectionObserver(async entries=>{
   visible=entries[0].isIntersecting;
   if(visible&&!animation&&!loading){
    loading=true;
    try{
     const {default:lottie}=await import('lottie-web/build/player/lottie_light');
     if(disposed)return;
     animation=lottie.loadAnimation({container:element,renderer:'svg',loop:!scrollDriven,autoplay:false,path:element.dataset.artwork!,rendererSettings:{preserveAspectRatio:'xMidYMid meet',progressiveLoad:true}});
     animation.addEventListener('DOMLoaded',()=>{element.dataset.ready='true';sync();});
    }catch{element.dataset.failed='true';}
   }
   sync();
  },{rootMargin:'120px'});
  observer.observe(element);
  preference.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  if(scrollDriven)document.addEventListener('studio-progress',sync);
  window.addEventListener('pagehide',event=>{
   if(event.persisted)return;
   disposed=true;observer.disconnect();animation?.destroy();
   preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);document.removeEventListener('studio-progress',sync);
  },{once:true});
 });
}
