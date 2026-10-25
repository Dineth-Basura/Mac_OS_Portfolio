'use strict';
function dinuChatMarkup(){return `<section id="dinuAI" class="dinu-ai" role="tabpanel" aria-labelledby="dinuAITab" hidden>
  <div class="dinu-ai-heading"><span class="dinu-orb" aria-hidden="true"><span></span></span><div><strong>Dinu AI</strong><span>Powered by Gemini</span></div><button id="dinuClearChat" type="button">New chat</button></div>
  <div id="dinuChatLog" class="dinu-chat-log" role="log" aria-label="Conversation with Dinu" aria-live="polite"><div class="dinu-chat-message assistant">Hi! I’m Dinu, Dineth’s AI assistant. Ask me about his projects, skills, or something you’re building.</div></div>
  <div class="dinu-ai-prompts"><button type="button" data-chat-prompt="Tell me about Dineth’s projects.">Explore projects</button><button type="button" data-chat-prompt="What cybersecurity skills does Dineth have?">Cybersecurity skills</button></div>
  <form id="dinuChatForm"><label for="dinuChatInput" class="sr-only">Ask Dinu a question</label><textarea id="dinuChatInput" placeholder="Ask Dinu anything…" rows="2" maxlength="2000" required></textarea><button type="submit" aria-label="Send question">↑</button></form>
  <p id="dinuChatStatus" role="status"></p><p class="dinu-ai-notice">AI replies can be mistaken. To reach Dineth personally, use Contact.</p>
</section>`;}
function setupDinuAI(win){
  const tabs=[win.querySelector('#dinuContactTab'),win.querySelector('#dinuAITab')],panels=[win.querySelector('#dinuContact'),win.querySelector('#dinuAI')];
  function selectTab(index){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});win.classList.toggle('ai-mode',index===1);if(index===1)win.querySelector('#dinuChatInput').focus();}
  tabs.forEach((tab,i)=>{tab.onclick=()=>selectTab(i);tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-i;selectTab(next);tabs[next].focus();}};});
  const form=win.querySelector('#dinuChatForm'),input=win.querySelector('#dinuChatInput'),log=win.querySelector('#dinuChatLog'),status=win.querySelector('#dinuChatStatus'),button=form.querySelector('button');
  let history=[],pending=false,generation=0;
  const bubble=(text,role)=>{const div=document.createElement('div');div.className='dinu-chat-message '+role;div.textContent=text;log.append(div);log.scrollTop=log.scrollHeight;return div;};
  const setPending=value=>{pending=value;button.disabled=value;input.readOnly=value;form.setAttribute('aria-busy',String(value));};
  win.querySelector('#dinuClearChat').onclick=()=>{generation++;win.chatAbort?.abort();setPending(false);history=[];log.replaceChildren();bubble('A fresh start! What would you like to know?','assistant');status.textContent='';input.value='';input.focus();};
  win.querySelectorAll('[data-chat-prompt]').forEach(b=>b.onclick=()=>{if(pending)return;input.value=b.dataset.chatPrompt;form.requestSubmit();});
  input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit();}};
  form.onsubmit=async e=>{
    e.preventDefault();if(pending||!form.reportValidity())return;const text=input.value.trim();if(!text)return;
    if(location.protocol==='file:'){status.textContent='AI mode needs the local server or the hosted site. See DEVELOPMENT.md to start it.';return;}
    const turn=++generation,user=bubble(text,'user'),thinking=bubble('Thinking…','assistant thinking');
    input.value='';status.textContent='';setPending(true);
    const controller=new AbortController();win.chatAbort=controller;const timeout=setTimeout(()=>controller.abort(),30000);
    try{
      const response=await fetch(contactConfig.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({messages:[...history.slice(-10),{role:'user',text}]}),signal:controller.signal});
      const data=await response.json().catch(()=>null);
      if(!response.ok||typeof data?.reply!=='string'||!data.reply.trim())throw new Error(data?.error||(response.status===404?'AI mode needs the portfolio server. Open the site through the local server or deploy it with its server function.':'Dinu couldn’t reply. Please try again.'));
      if(turn!==generation||!win.isConnected)return;
      thinking.classList.remove('thinking');thinking.textContent=data.reply;log.scrollTop=log.scrollHeight;
      history.push({role:'user',text},{role:'assistant',text:data.reply});history=history.slice(-10);
    }catch(error){if(turn===generation&&win.isConnected){user.remove();thinking.remove();input.value=text;status.textContent=error.name==='AbortError'?'The reply took too long. Please try again.':error.message;}}
    finally{clearTimeout(timeout);if(turn===generation){setPending(false);if(win.isConnected&&!panels[1].hidden)input.focus();}}
  };
}
