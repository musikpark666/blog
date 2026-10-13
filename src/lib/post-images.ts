import type { ImageMetadata } from 'astro';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkBreaks from 'remark-breaks';
import rehypePostLinks from './rehype-post-links.mjs';

export interface PostImage {
  src: ImageMetadata | string;
  alt?: string;
  caption?: string;
  source?: string;
  width?: number;
  height?: number;
  quality?: number;
}

const assets = import.meta.glob<ImageMetadata>(
  '/src/assets/**/*.{avif,webp,png,jpg,jpeg,gif,svg}', { import: 'default' },
);

/** Resolve paths relative to src/assets, or a unique filename such as "chip log.avif". */
export async function resolvePostImage(src: PostImage['src']) {
  if (typeof src !== 'string') return src;
  if (src.startsWith('/') && !src.startsWith('/src/assets/')) return src;
  if (/^https?:\/\//.test(src)) return src;
  const key = src.startsWith('/src/assets/') ? src : `/src/assets/${src}`;
  const matches = assets[key] ? [key] : Object.keys(assets).filter((path) => path.endsWith(`/${src}`));
  if (matches.length !== 1) {
    throw new Error(`<Img>: ${matches.length ? 'Ambiguous' : 'Missing'} image "${src}". Use a path relative to src/assets, e.g. "imgs/chip log.avif".`);
  }
  return assets[matches[0]]();
}

// Reuse one processor; there is no Markdown parser in the visitor's browser.
let markdown: ReturnType<typeof createMarkdownProcessor> | undefined;
export async function renderImageText(text?: string) {
  if (!text?.trim()) return '';
  markdown ??= createMarkdownProcessor({
    syntaxHighlight: false,
    remarkPlugins: [remarkCjkFriendly, remarkBreaks],
    rehypePlugins: [rehypePostLinks],
  });
  return (await (await markdown).render(text)).code;
}
