'use strict';
// Normalized coordinates keep saved positions inside the screen after resizing.
const DesktopLayout = {
  positions: Desktop.read('layout', {}), items: new Map(), dragging: false,
  bounds(element) {
    return {left:8, top:40, width:Math.max(0,innerWidth-element.offsetWidth-16), height:Math.max(0,innerHeight-element.offsetHeight-145)};
  },
  place(element, position) {
    const b=this.bounds(element);
    element.style.left=Math.round(b.left+position.x*b.width)+'px';
    element.style.top=Math.round(b.top+position.y*b.height)+'px';
    element.style.right='auto';
  },
  capture(element) {
    const b=this.bounds(element);
    return {x:Math.max(0,Math.min(1,(element.offsetLeft-b.left)/(b.width||1))), y:Math.max(0,Math.min(1,(element.offsetTop-b.top)/(b.height||1)))};
  },
  persist(key, element) {this.positions[key]=this.capture(element);Desktop.save('layout',this.positions);},
  register(key, element, fallback, isApp=false) {
    this.items.set(key,{element,fallback});this.place(element,this.positions[key]||fallback());
    element.classList.add('draggable-desktop-item');
    element.draggable=false;
    element.addEventListener('dragstart',e=>e.preventDefault());
    element.dataset.layoutKey=key;
    let drag=null,suppressUntil=0;
    element.addEventListener('pointerdown',e=>{
      if(e.button!==0||(!isApp&&e.target.closest('button:not(.widget-grip),input,textarea')))return;
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:element.offsetLeft,top:element.offsetTop,moved:false,grip:!!e.target.closest('.widget-grip')};
      element.setPointerCapture(e.pointerId);
    });
    element.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved&&Math.hypot(dx,dy)<7)return;
      if(!drag.moved){drag.moved=true;element.setPointerCapture(e.pointerId);element.classList.add('is-dragging');document.body.classList.add('desktop-dragging');this.dragging=true;}
      e.preventDefault();
      const b=this.bounds(element);element.style.left=Math.max(b.left,Math.min(b.left+b.width,drag.left+dx))+'px';element.style.top=Math.max(b.top,Math.min(b.top+b.height,drag.top+dy))+'px';
    });
    const finish=e=>{
      if(!drag||e.pointerId!==drag.id)return;
      if(drag.moved)this.persist(key,element);
      if(drag.moved||drag.grip)suppressUntil=performance.now()+350;
      if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);
      drag=null;element.classList.remove('is-dragging');document.body.classList.remove('desktop-dragging');this.dragging=false;
    };
    ['pointerup','pointercancel','lostpointercapture'].forEach(event=>element.addEventListener(event,finish));
    element.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
    element.addEventListener('dblclick',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
    element.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||(!e.altKey&&!e.target.classList.contains('widget-grip')))return;
      e.preventDefault();e.stopPropagation();const b=this.bounds(element),step=e.shiftKey?24:8;
      const left=element.offsetLeft+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),top=element.offsetTop+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0);
      element.style.left=Math.max(b.left,Math.min(b.left+b.width,left))+'px';element.style.top=Math.max(b.top,Math.min(b.top+b.height,top))+'px';this.persist(key,element);
    });
  },
  refresh(){this.items.forEach(({element,fallback},key)=>{if(element.offsetWidth&&element.offsetHeight)this.place(element,this.positions[key]||fallback());});},
  reset(){this.positions={};Desktop.save('layout',{});this.refresh();Desktop.notify('Desktop layout reset.');},
  init(){
    document.getElementById('desktop').classList.add('free-layout');
    document.querySelectorAll('[data-app]').forEach((element,i)=>{
      const app=desktopApps[i];
      this.register('app:'+app.name,element,()=>{
        const step=innerWidth<=560?84:94,rows=Math.max(1,Math.floor((innerHeight-145)/step)),b=this.bounds(element);
        return {x:Math.min(1,Math.floor(i/rows)*(innerWidth<=560?82:96)/(b.width||1)),y:Math.min(1,(i%rows)*step/(b.height||1))};
      },true);
      element.title=app.name+' · Double-click to open · Drag to move';
    });
    const widgets=[['clock',document.getElementById('clockWidget'),()=>({x:.52,y:.34})],['calendar',document.querySelector('.calendar.widget'),()=>({x:Math.max(0,1-194/(innerWidth-176)),y:.04})],['weather',document.getElementById('weatherWidget'),()=>({x:1,y:.04})]];
    widgets.forEach(([key,element,fallback])=>{
      // Weather stays a link; a dedicated grip gives keyboard/touch users a drag target.
      const grip=document.createElement('span');grip.className='widget-grip';grip.tabIndex=0;grip.setAttribute('role','button');grip.setAttribute('aria-label','Move '+key+' widget; use arrow keys');grip.textContent='⠿';element.prepend(grip);
      grip.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();grip.focus();});
      grip.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();grip.focus();}});
      this.register('widget:'+key,element,fallback);
    });
    window.addEventListener('resize',()=>{clearTimeout(this.resizeTimer);this.resizeTimer=setTimeout(()=>this.refresh(),80);});
  }
};
