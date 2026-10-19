import { file, glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";

// Write unquoted YYYY-MM-DDTHH:mm:ss values without a timezone; they represent Japan time.
// YAML parses these as UTC dates, so subtract nine hours to recover the intended JST instant.
const postDateSchema = z.date()
  .transform((date) => new Date(date.getTime() - 9 * 60 * 60 * 1000));

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

// Independent display groups for /m/; these are not parent galleries.
const minorGroup = defineCollection({
  loader: file('./src/content/minor-gallery-groups.yaml'),
  schema: z.object({
    title: z.string(),
    order: z.number().int().nonnegative(),
  }),
});

const minorGallery = defineCollection({
  loader: glob({
    pattern: '*.{yaml,yml}',
    base: './src/content/minor-gallery',
    generateId: ({ entry }) => {
      const id = entry.replace(/\.(yaml|yml)$/, '');
      return z.string().regex(/^[a-z]+(?:-[a-z]+)*$/, 'Use lowercase English words separated by hyphens.').parse(id);
    },
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    yomi: z.string().optional(),
    description: z.string(),
    group: reference('minorGroup'),
    thumbnail: image().optional(),
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
    mcategories: z.array(reference('minorGallery')).default([]),
    pubDate: postDateSchema,
    updDate: postDateSchema.optional(),
  }),
});

export const collections = { post, gallery, minorGroup, minorGallery };
