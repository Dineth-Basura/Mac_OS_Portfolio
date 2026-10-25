import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { asset } from './lib/data';
const link = z.url().refine(v => v.startsWith('https://'));
const optionalLink = z.union([link,z.literal('')]).optional();
const projects = defineCollection({
  loader: glob({pattern:'**/*.md',base:'./src/content/projects'}),
  schema: z.object({
    title: z.string().min(1), category: z.enum(['Cybersecurity','Full Stack','AI / Computer Vision','Other']),
    description: z.string().min(1), technologies: z.array(z.string()).default([]), date: z.string().optional(),
    order: z.number().default(100), featured: z.boolean().default(false), visible: z.boolean().default(true),
    repository: link, additionalRepositories: z.array(link).default([]), demo: optionalLink,
    visual: z.enum(['network','plate','book','gym','password','tcp','generic']).default('generic'),
    image: z.union([asset,z.literal('')]).optional(), imageAlt: z.string().optional(),
    imageType:z.enum(['concept','screenshot']).default('concept'),
    screenshots: z.array(z.object({image:asset,alt:z.string().min(1),caption:z.string().optional()})).default([]),
  }),
});
const certifications = defineCollection({
  loader: glob({pattern:'**/*.md',base:'./src/content/certifications'}),
  schema:z.object({title:z.string(),issuer:z.string(),order:z.number().default(100),featured:z.boolean().default(false),visible:z.boolean().default(true),date:z.string().optional(),credentialId:z.string().optional(),credentialUrl:optionalLink,image:z.union([asset,z.literal('')]).optional(),skills:z.array(z.string()).default([]),description:z.string().default('')}),
});
const experience = defineCollection({
  loader:glob({pattern:'**/*.md',base:'./src/content/experience'}),
  schema:z.object({title:z.string(),organization:z.string(),kind:z.enum(['Education','Activity','Experience']),period:z.string().optional(),logo:z.union([asset,z.literal('')]).optional(),logoAlt:z.string().optional(),description:z.string(),order:z.number().default(100),visible:z.boolean().default(true)}),
});
export const collections = {projects,certifications,experience};
