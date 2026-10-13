import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';

// Preserve Astro's Unicode subsets and fallback metrics; only share its emitted CSS.
export default function sharedFontCss(cssVariable) {
  let base = '/';
  return {
    name: 'shared-font-css',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = `${config.base.replace(/\/$/, '')}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const styles = new Map();
        let pages = 0;
        async function processDirectory(directory) {
          for (const entry of await readdir(directory, { withFileTypes: true })) {
            const url = new URL(encodeURIComponent(entry.name) + (entry.isDirectory() ? '/' : ''), directory);
            if (entry.isDirectory()) {
              await processDirectory(url);
            } else if (entry.name.endsWith('.html')) {
              const html = await readFile(url, 'utf8');
              const updated = html.replace(/<style>(@font-face[\s\S]*?)<\/style>/g, (tag, css) => {
                if (!css.includes(`${cssVariable}:`)) return tag;
                const name = `fonts-${createHash('sha256').update(css).digest('hex').slice(0, 12)}.css`;
                styles.set(name, css);
                return `<link rel="stylesheet" href="${base}_astro/${name}">`;
              });
              if (updated !== html) {
                await writeFile(url, updated);
                pages++;
              }
            }
          }
        }
        await processDirectory(dir);
        for (const [name, css] of styles) {
          await writeFile(new URL(`_astro/${name}`, dir), css);
        }
        logger.info(`Shared font CSS across ${pages} pages (${styles.size} stylesheet).`);
      },
    },
  };
}
