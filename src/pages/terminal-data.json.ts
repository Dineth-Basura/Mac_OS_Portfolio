import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import {profile,site,skills} from '../lib/data';
import type {TerminalData} from '../lib/terminal/types';
export const GET:APIRoute=async()=>{
 const projects=(await getCollection('projects',({data})=>data.visible)).sort((a,b)=>Number(b.data.featured)-Number(a.data.featured)||a.data.order-b.data.order);
 const education=(await getCollection('experience',({data})=>data.visible&&data.kind==='Education')).sort((a,b)=>a.data.order-b.data.order);
 const certifications=(await getCollection('certifications',({data})=>data.visible)).sort((a,b)=>a.data.order-b.data.order);
 const data:TerminalData={
  profile:{name:profile.name,role:profile.role,status:profile.status,bio:profile.bio,aboutDetail:profile.aboutDetail,email:profile.email,location:profile.location,github:profile.github,linkedin:profile.linkedin},
  cv:site.cv,skills:skills.categories.map(({title,items})=>({title,items})),
  projects:projects.map(p=>({slug:p.id,title:p.data.title,category:p.data.category,description:p.data.description,technologies:p.data.technologies,href:`/projects/${p.id}/`,repository:p.data.repository})),
  education:education.map(({data})=>({title:data.title,organization:data.organization,period:data.period,description:data.description})),
  certifications:certifications.map(({data})=>({title:data.title,issuer:data.issuer,date:data.date,credentialUrl:data.credentialUrl})),
 };
 return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};
