// Build/server only: never import this module from a browser script.
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { z } from 'astro/zod';

const optionalText = z.string().trim().optional();
const quoteSchema = z.object({
  original: z.string().trim().min(1),
  translations: z.object({ ja: optionalText }).optional(),
  speaker: optionalText,
  description: optionalText,
  source: z.object({
    type: optionalText,
    title: optionalText,
    location: optionalText,
    url: z.url().refine((url) => /^https?:\/\//i.test(url), 'Use an HTTP(S) URL').optional(),
  }).optional(),
  private: z.boolean().default(false),
});

const workTypes = new Set(['book', 'film', 'flim', 'animation', 'series', 'game']);

/** Validate on the build side and explicitly allow only public display fields. */
export function parsePublicQuotes(source) {
  const entries = z.array(quoteSchema).parse(parse(source) ?? []);
  return entries.filter((entry) => !entry.private).map((entry) => {
    const source = entry.source;
    let title = source?.title || '';
    if (title && workTypes.has(source?.type)) title = `『${title}』`;
    else if (title && source?.type === 'song') title = `「${title}」`;
    if (!title && source?.url) title = new URL(source.url).hostname;
    return {
      text: entry.translations?.ja || entry.original,
      ...(entry.speaker && { speaker: entry.speaker }),
      ...(entry.description && { description: entry.description }),
      ...(source && (title || source.location) && {
        source: {
          ...(title && { title }),
          ...(source.location && { location: source.location }),
          ...(source.url && { url: source.url }),
        },
      }),
    };
  });
}

let cachedSource;
let cachedData;

export function createQuoteData(source) {
  if (cachedData && cachedSource === source) return cachedData;
  const quotes = parsePublicQuotes(source);
  const json = JSON.stringify(quotes);
  const version = createHash('sha256').update(json).digest('hex').slice(0, 16);
  cachedSource = source;
  cachedData = { quotes, json, version };
  return cachedData;
}
