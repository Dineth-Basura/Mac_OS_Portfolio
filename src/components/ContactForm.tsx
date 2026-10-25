import { useRef, useState, type SubmitEvent } from 'react';
import { ArrowUpRight, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';

type Copy = {
  accessKey:string; nameLabel:string; emailLabel:string; subjectLabel:string; messageLabel:string;
  submitLabel:string; pendingLabel:string; successMessage:string; errorMessage:string;
  privacyNote:string; defaultSubject:string;
};
type Props = { copy:Copy; fromName:string };

export default function ContactForm({copy,fromName}:Props){
  const [status,setStatus]=useState<'idle'|'pending'|'success'|'error'>('idle');
  const submitting=useRef(false);
  async function onSubmit(event:SubmitEvent<HTMLFormElement>){
    event.preventDefault();
    if(submitting.current)return;
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const formData=new FormData(form);
    if(formData.get('botcheck'))return;
    formData.delete('redirect');
    if(!String(formData.get('subject')||'').trim())formData.set('subject',copy.defaultSubject);
    submitting.current=true;setStatus('pending');
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:formData,signal:controller.signal,headers:{Accept:'application/json'}});
      const data:unknown=await response.json();
      if(!response.ok||typeof data!=='object'||data===null||!('success' in data)||data.success!==true)throw new Error('Submission failed');
      setStatus('success');form.reset();
    }catch{
      setStatus('error');
    }finally{
      clearTimeout(timeout);submitting.current=false;
    }
  }
  return <form className="contact-form" action="https://api.web3forms.com/submit" method="POST" onSubmit={onSubmit} aria-busy={status==='pending'}>
    <input type="hidden" name="access_key" value={copy.accessKey}/>
    <input type="hidden" name="from_name" value={fromName}/>
    <input type="hidden" name="redirect" value="https://web3forms.com/success"/>
    <input type="checkbox" name="botcheck" className="form-honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off"/>
    <div className="form-row">
      <div className="form-field"><label htmlFor="contact-name">{copy.nameLabel}<span aria-hidden="true"> *</span></label><input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required maxLength={100}/></div>
      <div className="form-field"><label htmlFor="contact-email">{copy.emailLabel}<span aria-hidden="true"> *</span></label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></div>
    </div>
    <input type="hidden" name="subject" value={copy.defaultSubject}/>
    <div className="form-field"><label htmlFor="contact-message">{copy.messageLabel}<span aria-hidden="true"> *</span></label><textarea id="contact-message" name="message" placeholder="Tell me about your project or opportunity…" rows={6} required maxLength={5000}/></div>
    <button type="submit" className="button primary contact-submit" disabled={status==='pending'}>{status==='pending'?copy.pendingLabel:copy.submitLabel}{status==='pending'?<LoaderCircle size={18} className="form-spinner" aria-hidden="true"/>:<ArrowUpRight size={18} aria-hidden="true"/>}</button>
    <div className={`form-result result-${status}`} role="status" aria-live="polite" aria-atomic="true">{status==='success'?<><CheckCircle2 size={18} aria-hidden="true"/><span>{copy.successMessage}</span></>:status==='error'?<><AlertCircle size={18} aria-hidden="true"/><span>{copy.errorMessage}</span></>:null}</div>
    <p className="form-privacy">{copy.privacyNote}</p>
  </form>;
}
