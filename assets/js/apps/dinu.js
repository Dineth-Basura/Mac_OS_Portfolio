'use strict';
icons.dinu=SVG('<defs><radialGradient id="dinuIcon"><stop stop-color="#dbfdff"/><stop offset=".4" stop-color="#89a5ff"/><stop offset=".75" stop-color="#be7de7"/><stop offset="1" stop-color="#384eab"/></radialGradient></defs><rect width="64" height="64" rx="14" fill="#1e2948"/><circle cx="32" cy="32" r="25" fill="url(#dinuIcon)"/><path d="M12 34q10-20 20-2t20-3M12 31q10 20 20 0t20 3" fill="none" stroke="#d4ffff" stroke-width="3" opacity=".8"/>');
appViews.dinu={title:'Dinu',body:`<div class="dinu-panel"><div class="dinu-tabs" role="tablist" aria-label="Dinu mode"><button id="dinuContactTab" role="tab" aria-selected="true" aria-controls="dinuContact" type="button">Contact</button><button id="dinuAITab" role="tab" aria-selected="false" aria-controls="dinuAI" tabindex="-1" type="button">Dinu AI <span>✦</span></button></div><section id="dinuContact" role="tabpanel" aria-labelledby="dinuContactTab">
  <div class="dinu-intro"><span class="dinu-orb dinu-orb-large" aria-hidden="true"><span></span></span><span class="dinu-eyebrow">YOUR CONNECTION TO DINETH</span><h1>Hey, I’m Dinu.</h1><p>A small hello can start something great.<br>Leave Dineth a message.</p></div>
  <div class="dinu-suggestions" aria-label="Message suggestions"><button type="button" data-message="Hi Dineth, I’d love to collaborate on a project. ">Let’s collaborate</button><button type="button" data-message="Hi Dineth, I have an opportunity I’d like to discuss. ">Work opportunity</button><button type="button" data-message="Hey Dineth! Just dropping by to say hello. ">Just saying hi</button></div>
  <form id="dinuForm" action="https://api.web3forms.com/submit" method="POST"><input type="hidden" name="access_key" value="${contactConfig.accessKey}"><input type="hidden" name="subject" value="New portfolio message via Dinu"><input type="hidden" name="from_name" value="Dinu Portfolio"><input type="checkbox" name="botcheck" class="dinu-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="dinu-form-row"><label>Your name<input name="name" autocomplete="name" maxlength="100" placeholder="How should I call you?" required></label><label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required></label></div><label>Your message<textarea name="message" maxlength="${contactConfig.maxMessageLength}" placeholder="What’s on your mind?" rows="4" required></textarea></label><div class="dinu-form-footer"><span id="dinuCount">0 / ${contactConfig.maxMessageLength}</span><span class="dinu-private">Only for Dineth</span></div><button class="dinu-send" type="submit">${contactConfig.messageEndpoint?'Send message':'Continue in email'} <span aria-hidden="true">↗</span></button><p class="dinu-delivery">${contactConfig.messageEndpoint?'Your message will be delivered to Dineth.':'Your email app opens with the message ready. Press Send there to deliver it.'}</p><p id="dinuStatus" role="status" aria-live="polite"></p></form>
  <div class="dinu-contact-footer"><span>Prefer a direct hello?</span><a href="mailto:${contactConfig.email}">Email Dineth ↗</a><a href="https://wa.me/94740334036" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div>
</section>${dinuChatMarkup()}</div>`};
function setupDinu(win){
  setupDinuAI(win);
  const form=win.querySelector('#dinuForm'),message=form.elements.message,status=win.querySelector('#dinuStatus'),submit=form.querySelector('[type=submit]');
  const setStatus=text=>{status.textContent=text;status.scrollIntoView({block:'nearest'});};
  win.querySelectorAll('[data-message]').forEach(button=>button.onclick=()=>{message.value=button.dataset.message;message.dispatchEvent(new Event('input'));message.focus();});
  message.oninput=()=>win.querySelector('#dinuCount').textContent=message.value.length+' / '+contactConfig.maxMessageLength;
  form.onsubmit=async e=>{
    e.preventDefault();if(win.dinuAbort||!form.reportValidity())return;
    if(form.elements.botcheck.checked)return;
    const payload={access_key:contactConfig.accessKey,subject:'New portfolio message via Dinu',from_name:'Dinu Portfolio',name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),message:message.value.trim()};
    if(!payload.name||!payload.message){setStatus('Please add your name and a message.');return;}
    if(!contactConfig.messageEndpoint){
      const subject='Portfolio message from '+payload.name,body=payload.message+'\n\nFrom: '+payload.name+'\nReply to: '+payload.email;
      const url='mailto:'+contactConfig.email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      window.open(url,'_self');
      setStatus('Your email draft is ready. Send it from your email app. If it didn’t open, use the Email Dineth link below.');
      return;
    }
    submit.disabled=true;setStatus('Sending your message…');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);win.dinuAbort=controller;
    try{
      const endpoint=new URL(contactConfig.messageEndpoint,location.href);if(endpoint.protocol!=='https:')throw new Error('A secure delivery endpoint is required.');
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result=await response.json().catch(()=>null);
      if(!response.ok||result?.success!==true)throw new Error('Delivery failed.');
      setStatus('Message sent. Thanks for reaching out!');form.reset();message.dispatchEvent(new Event('input'));
    }catch{setStatus('Your message couldn’t be delivered. Please try again or use Email Dineth below.');}
    finally{clearTimeout(timeout);win.dinuAbort=null;submit.disabled=false;}
  };
}
document.getElementById('dinuLauncher').onclick=()=>openWindow('dinu');
