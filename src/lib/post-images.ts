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

interface ImageDownload {
  href: string;
  name: string;
}

// Each page collects its own images, including nested ImgCollage children.
const imageDownloads = new WeakMap<object, Promise<ImageDownload>[]>();
const imageNames = new WeakMap<ImageMetadata, string>();

export function collectPostImages(locals: object) {
  const images: Promise<ImageDownload>[] = [];
  imageDownloads.set(locals, images);
  return images;
}

export function registerPostImage(locals: object, pendingImage: Promise<PostImage['src']>) {
  const images = imageDownloads.get(locals);
  if (!images) return;
  // Reserve the position before loading so async images retain their document order.
  images.push(pendingImage.then((image) => {
    // Reading the imported source also keeps the unmodified file in Astro's build.
    const href = typeof image === 'string' ? image : image.src;
    let name = typeof image === 'string' ? undefined : imageNames.get(image);
    if (!name) {
      name = new URL(href, 'https://musik.gallery').pathname.split('/').pop() || 'image';
      try { name = decodeURIComponent(name); } catch { /* Keep malformed escapes as written. */ }
    }
    return { href, name };
  }));
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
  const image = await assets[matches[0]]();
  imageNames.set(image, matches[0].split('/').pop()!);
  return image;
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
