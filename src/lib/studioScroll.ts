type Trigger = { kill(): void; refresh(): void };
type StudioAPI = Window & {
 gsap?: { registerPlugin(plugin: unknown): void };
 ScrollTrigger?: { create(options: Record<string, unknown>): Trigger };
};

export async function initStudioScroll() {
 const scene = document.querySelector<HTMLElement>('[data-studio-scene]');
 const canvas = scene?.querySelector<HTMLCanvasElement>('[data-studio-frames]');
 const context = canvas?.getContext('2d', { alpha: true });
 if (!scene || !canvas || !context) return;
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 const panels = Array.from(scene.querySelectorAll<HTMLElement>('[data-studio-panel]'));
 const lines = panels.map(p => Array.from(p.querySelectorAll<HTMLElement>('[data-studio-line]')));
 const meter = scene.querySelector<HTMLElement>('[data-studio-progress]');
 const chapter = scene.querySelector<HTMLElement>('[data-studio-chapter]');
 const clamp = (n: number) => Math.max(0, Math.min(1,n));
 let target=0, progress=0, raf=0, lastTime=0, lastFrame=-1, disposed=false;
 let count=1, images: (HTMLImageElement | undefined)[]=[];
 let trigger: Trigger | undefined;
 let api: StudioAPI | undefined;
 let ready=false;
 const draw=()=>{
  const wanted=Math.round(progress*(count-1));
  let frame=wanted;
  if(!images[frame]){
   for(let distance=1;distance<count;distance++){
    if(images[wanted-distance]){frame=wanted-distance;break;}
    if(images[wanted+distance]){frame=wanted+distance;break;}
   }
  }
  const image=images[frame];
  if(!image||lastFrame===frame)return;
  lastFrame=frame;
  context.clearRect(0,0,canvas.width,canvas.height);
  context.drawImage(image,0,0,canvas.width,canvas.height);
  scene.dataset.frame=String(frame);
  scene.dataset.targetFrame=String(wanted);
 };
 const render=()=>{
  scene.dataset.progress=progress.toFixed(5);
  scene.style.setProperty('--studio-progress',String(progress));
  if(meter)meter.style.transform=`scaleX(${progress})`;
  panels.forEach((panel,index)=>{
   const entry=index===0?0:index===1?.27:.65;
   const exit=index===0?.16:index===1?.54:2;
   const visible=index===0?progress<.28:progress>=entry&&progress<exit+.12;
   panel.style.visibility=visible?'visible':'hidden';panel.inert=!visible;
   panel.setAttribute('aria-hidden',String(!visible));
   lines[index].forEach((line,i)=>{
    const enter=index===0?1:clamp((progress-entry-i*.012)/.11);
    const leave=clamp((progress-exit-i*.006)/.09);
    line.style.opacity=String(enter*(1-leave));
    line.style.transform=`translate3d(0,${(1-enter)*35-leave*30}px,0)`;
   });
  });
  if(chapter)chapter.textContent=progress<.27?'01':progress<.65?'02':'03';
  draw();document.dispatchEvent(new Event('studio-progress'));
 };
 const tick=(time:number)=>{
  raf=0;if(disposed)return;
  const dt=Math.min(64,lastTime?time-lastTime:16);lastTime=time;
  progress+= (target-progress)*(1-Math.exp(-dt/65));
  if(Math.abs(target-progress)<.0002)progress=target;
  render();
  if(progress!==target)raf=requestAnimationFrame(tick);else lastTime=0;
 };
 const schedule=()=>{if(!raf&&!disposed)raf=requestAnimationFrame(tick);};
 const setProgress=(p:number)=>{target=preference.matches?0:clamp(p);schedule();};
 const onScroll=()=>{
  const rect=scene.getBoundingClientRect();
  document.documentElement.classList.toggle('studio-header-overlay',rect.bottom>90);
  if(ready)setProgress(-rect.top/Math.max(1,scene.offsetHeight-(scene.querySelector<HTMLElement>('.studio-hero')?.offsetHeight||innerHeight)));
 };
 const configure=()=>{
  trigger?.kill();trigger=undefined;
  scene.classList.toggle('studio-active',ready&&!preference.matches);
  if(preference.matches){target=progress=0;render();return;}
  if(ready&&api?.gsap&&api.ScrollTrigger){
   api.gsap.registerPlugin(api.ScrollTrigger);
   trigger=api.ScrollTrigger.create({trigger:scene,start:'top top',end:()=>`+=${Math.max(1,scene.offsetHeight-(scene.querySelector<HTMLElement>('.studio-hero')?.offsetHeight||innerHeight))}`,invalidateOnRefresh:true,
    onUpdate:onScroll,onRefresh:onScroll});
   scene.dataset.scrollEngine='gsap';
  }else scene.dataset.scrollEngine='native';
  onScroll();
 };
 const onResize=()=>{trigger?.refresh();onScroll();};
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',onResize,{passive:true});
 preference.addEventListener('change',configure);
 render();onScroll();
 window.addEventListener('pagehide',event=>{
  if(event.persisted)return;
  disposed=true;trigger?.kill();cancelAnimationFrame(raf);
  window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize);preference.removeEventListener('change',configure);
 },{once:true});
 try {
  const response=await fetch('/frames/hero/manifest.json');
  if(!response.ok)throw new Error('Frame manifest unavailable');
  const manifest=await response.json();count=manifest.count;
  const mobile=matchMedia('(max-width: 600px)').matches;
  canvas.width=mobile?320:512;canvas.height=Math.round(canvas.width*manifest.height/manifest.width);
  const loadFrame=async(index:number)=>{
   const image=new Image();image.src=`/frames/hero/${mobile?'mobile':'desktop'}/${String(index).padStart(3,'0')}.webp`;
   try{await image.decode();if(disposed)return;images[index]=image;lastFrame=-1;draw();}catch{/* Keep the closest decoded frame if a request fails. */}
  };
  await loadFrame(0);
  if(disposed||!images[0])return;
  ready=true;canvas.classList.add('is-ready');configure();
  void loadGSAP().then(result=>{if(!disposed){api=result;configure();}}).catch(()=>{});
  // Fill gaps evenly first, then fetch all frames with bounded concurrency.
  const order=Array.from({length:count-1},(_,i)=>i+1).sort((a,b)=>(a%6)-(b%6));
  let next=0;
  await Promise.all(Array.from({length:6},async()=>{while(next<order.length&&!disposed){await loadFrame(order[next++]);}}));
  if(!disposed)scene.dataset.framesLoaded=String(images.filter(Boolean).length);
 }catch{scene.dataset.mediaError='true';}
}
async function loadGSAP():Promise<StudioAPI>{
 const api=window as StudioAPI;
 const load=(src:string)=>new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');script.src=src;script.async=true;
  script.onload=()=>resolve();script.onerror=()=>reject(new Error('GSAP unavailable'));document.head.append(script);
 });
 if(!api.gsap)await load('/vendor/gsap/gsap.min.js');
 if(!api.ScrollTrigger)await load('/vendor/gsap/ScrollTrigger.min.js');
 return api;
}

