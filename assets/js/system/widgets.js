'use strict';
function localDateKey(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function updateClock(){
  const now=new Date(),h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
  document.getElementById('hourHand').style.transform=`rotate(${h*30+m*.5}deg)`;
  document.getElementById('minuteHand').style.transform=`rotate(${m*6+s*.1}deg)`;
  document.getElementById('secondHand').style.transform=`rotate(${s*6}deg)`;
  document.getElementById('clockDate').textContent=now.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  document.getElementById('menuTime').textContent=now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' '+now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  document.querySelector('.clock-zone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.querySelector('.lock-time').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  document.querySelector('.lock-date').textContent=now.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
  const key=localDateKey(now);if(Desktop.today!==key){Desktop.today=key;updateCalendar();}
}
function initClock(){
  const clock=document.getElementById('clockWidget');
  for(let i=0;i<60;i++){const mark=document.createElement('span');mark.className='clock-tick'+(i%5?' small':'');mark.style.transform=`translateX(-50%) rotate(${i*6}deg)`;clock.prepend(mark);}
  for(let i=1;i<=12;i++){const angle=i*Math.PI/6-Math.PI/2,n=document.createElement('span');n.className='clock-number';n.textContent=i;n.style.left=`${50+39*Math.cos(angle)}%`;n.style.top=`${50+39*Math.sin(angle)}%`;clock.append(n);}
  updateClock();setInterval(updateClock,1000);
  clock.tabIndex=0;clock.setAttribute('role','button');clock.setAttribute('aria-label','Open Calendar');clock.onclick=()=>openWindow('calendar');clock.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openWindow('calendar');}};
}
function calendarCells(date,large=false,selected=''){
  const year=date.getFullYear(),month=date.getMonth(),today=localDateKey(new Date()),first=new Date(year,month,1).getDay(),count=new Date(year,month+1,0).getDate();
  let html=['S','M','T','W','T','F','S'].map(d=>'<span class="day-name">'+d+'</span>').join('')+'<span></span>'.repeat(first);
  for(let day=1;day<=count;day++){const key=localDateKey(new Date(year,month,day));html+=`<button class="calendar-day ${key===today?'today':''} ${key===selected?'selected-day':''}" data-date="${key}" aria-label="${new Date(year,month,day).toLocaleDateString([],{dateStyle:'full'})}" ${key===today?'aria-current="date"':''}>${day}</button>`;}return html;
}
function updateCalendar(){
  document.getElementById('yearLabel').textContent=Desktop.calendar.getFullYear();
  document.getElementById('monthLabel').textContent=Desktop.calendar.toLocaleDateString('en-US',{month:'long'});
  document.getElementById('calendarDays').innerHTML=calendarCells(Desktop.calendar);
}
function shiftMonth(date,delta){return new Date(date.getFullYear(),date.getMonth()+delta,1);}
function initCalendar(){
  document.querySelector('.month-prev').onclick=()=>{Desktop.calendar=shiftMonth(Desktop.calendar,-1);updateCalendar();};
  document.querySelector('.month-next').onclick=()=>{Desktop.calendar=shiftMonth(Desktop.calendar,1);updateCalendar();};
  document.getElementById('monthLabel').onclick=()=>openWindow('calendar');
  document.getElementById('dateButton').onclick=()=>openWindow('calendar');
  document.getElementById('calendarDays').onclick=e=>{const b=e.target.closest('[data-date]');if(b){const win=openWindow('calendar');win.selectedDate=b.dataset.date;win.calendarDate=new Date(b.dataset.date+'T12:00:00');renderCalendarApp(win);}};
}
function setupCalendarApp(win){
  win.calendarDate=new Date();win.selectedDate=localDateKey(new Date());
  win.addEventListener('click',e=>{
    const shift=e.target.closest('[data-calendar-shift]'),day=e.target.closest('[data-date]'),remove=e.target.closest('[data-delete-event]');
    if(shift){win.calendarDate=shiftMonth(win.calendarDate,Number(shift.dataset.calendarShift));renderCalendarApp(win);}
    if(day){win.selectedDate=day.dataset.date;renderCalendarApp(win);}
    if(e.target.closest('[data-calendar-today]')){win.calendarDate=new Date();win.selectedDate=localDateKey(new Date());renderCalendarApp(win);}
    if(remove){const events=Desktop.read('events',[]).filter(event=>event.id!==remove.dataset.deleteEvent);Desktop.save('events',events);renderCalendarApp(win);}
  });
  win.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();const title=win.querySelector('#eventTitle').value.trim();if(!title)return;const events=Desktop.read('events',[]);events.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:win.selectedDate,time:win.querySelector('#eventTime').value,title});Desktop.save('events',events);win.querySelector('#eventTitle').value='';renderCalendarApp(win);};
}
function renderCalendarApp(win){
  win.querySelector('#calendarTitle').textContent=win.calendarDate.toLocaleDateString([],{month:'long',year:'numeric'});
  win.querySelector('#calendarGrid').innerHTML=calendarCells(win.calendarDate,true,win.selectedDate);
  win.querySelector('#eventDate').textContent=new Date(win.selectedDate+'T12:00:00').toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
  const events=Desktop.read('events',[]).filter(event=>event.date===win.selectedDate).sort((a,b)=>a.time.localeCompare(b.time));
  win.querySelector('#eventList').innerHTML=events.map(event=>`<div class="event-row"><time>${escapeHTML(event.time)}</time><span>${escapeHTML(event.title)}</span><button data-delete-event="${event.id}" aria-label="Delete ${escapeHTML(event.title)}">×</button></div>`).join('')||'<p class="muted">No events. Add one below.</p>';
}
