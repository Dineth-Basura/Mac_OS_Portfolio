import { z } from 'astro/zod';
import rawProfile from '../data/profile.json';
import rawSite from '../data/site.json';
import rawSkills from '../data/skills.json';
import rawContact from '../data/contact.json';
const https = z.url().refine(v => v.startsWith('https://'), 'Use an HTTPS URL');
export const asset = z.string().regex(/^\/(?!\/)[a-zA-Z0-9_./ -]+$/, 'Use a local public asset path starting with /');
export const profile = z.object({
  name: z.string().min(1), fullName: z.string().min(1), role: z.string(), status: z.string(), headline: z.string(),
  intro: z.string(), typedIntro: z.string().min(1), bio: z.string(), aboutDetail: z.string(), email: z.email(), location: z.string(),
  github: https, linkedin: https, portrait: asset, portraitAlt: z.string().min(1), orbitSkills: z.array(z.string()).max(6, 'Use up to six portrait labels; add other skills to the Skills editor.'),
}).parse(rawProfile);
export const site = z.object({
  url: z.union([https, z.literal('')]), title: z.string(), description: z.string(), cv: asset, socialImage: asset,
  introLabel: z.string(), aboutTitle: z.string(), skillsTitle: z.string(), projectsTitle: z.string(), projectsIntro: z.string(),
  certificationsTitle: z.string(), experienceTitle: z.string(), contactTitle: z.string(), contactIntro: z.string(),
  showCertifications: z.boolean(), showExperience: z.boolean(),
  navigation: z.array(z.object({label:z.string(),id:z.string().regex(/^[a-z-]+$/)})),
}).parse(rawSite);
export const skills = z.object({ stack:z.array(z.object({name:z.string().min(1),icon:asset})),categories: z.array(z.object({title:z.string(),subtitle:z.string(),icon:z.string(),items:z.array(z.string())})) }).parse(rawSkills);
export const contact = z.object({
  accessKey: z.uuid(), eyebrow:z.string(), title:z.string(), intro:z.string(), formTitle:z.string(), formIntro:z.string(),
  nameLabel:z.string(), emailLabel:z.string(), subjectLabel:z.string(), messageLabel:z.string(),
  submitLabel:z.string(), pendingLabel:z.string(), successMessage:z.string(), errorMessage:z.string(),
  privacyNote:z.string(), defaultSubject:z.string(), homepageButton:z.string(),
}).parse(rawContact);
