import { glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";

// Post timestamps use YYYY-MM-DDTHH:mm and always represent Japan time.
const postDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, '日時は YYYY-MM-DDTHH:mm 形式で入力してください。')
  .transform((date) => `${date}+09:00`)
  .pipe(z.coerce.date());

const relatedSiteSchema = z.object({
  title: z.string(),
  url: z.url(),
  description: z.string().optional(),
});

const gallery = defineCollection({
  loader: glob({
    pattern: '**/*.{yaml,yml}',
    base: './src/content/gallery',
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    yomi: z.string().optional(),
    description: z.string(),
    thumbnail: image(),
    relatedSites: z.array(relatedSiteSchema).default([]),
  }),
});

const post = defineCollection({
  loader: glob({ 
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/post',
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    image: image().optional(),
    categories: z.array(reference('gallery')).min(1),
    mcategories: z.array(z.string()).optional(),
    pubDate: postDateSchema,
    updDate: postDateSchema.optional(),
  }),
});

export const collections = { post, gallery };
