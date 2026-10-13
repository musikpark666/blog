import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const pretendardCssUrl = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-jp-dynamic-subset.min.css';

/** Register the official subsets with Astro's font downloading and fallback optimization. */
export function pretendardJp() {
  /** @type {Parameters<NonNullable<import('astro').FontProvider['init']>>[0]['storage'] | undefined} */
  let storage;

  return /** @satisfies {import('astro').FontProvider} */ ({
    name: 'pretendard-jp',
    config: { url: pretendardCssUrl },
    init(context) {
      storage = context.storage;
    },
    async resolveFont({ familyName }) {
      if (familyName !== 'Pretendard JP Variable') return;
      if (!storage) throw new Error('Pretendard JP provider was not initialized.');

      const fonts = await storage.getItem(pretendardCssUrl, async () => {
        const response = await fetch(pretendardCssUrl, { signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error(`Pretendard JP CSS: HTTP ${response.status}`);
        const css = await response.text();
        const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(([, block]) => {
          const source = /src:\s*url\(([^)]+)\)/.exec(block)?.[1]?.replace(/["']/g, '');
          const range = /unicode-range:\s*([^;}]+)/.exec(block)?.[1];
          const weight = /font-weight:\s*([^;}]+)/.exec(block)?.[1];
          if (!source || !range || !weight) throw new Error('Invalid Pretendard JP subset CSS.');
          return {
            src: [{ url: new URL(source, pretendardCssUrl).href, format: 'woff2' }],
            unicodeRange: range.split(',').map((value) => value.trim()),
            weight,
            style: 'normal',
          };
        });
        // Fail rather than silently lose character coverage if the pinned source changes.
        if (faces.length !== 119) throw new Error('Expected all 119 Pretendard JP subsets.');

        // Astro measures the first subset for Latin fallback metrics; use one containing A.
        const latinIndex = faces.findIndex(({ unicodeRange }) => unicodeRange.some((range) => {
          const [start, end = start] = range.slice(2).split('-').map((value) => parseInt(value, 16));
          return start <= 0x41 && end >= 0x41;
        }));
        if (latinIndex < 0) throw new Error('Pretendard JP Latin subset is missing.');
        faces.unshift(...faces.splice(latinIndex, 1));
        return faces;
      });
      return { fonts };
    },
  });
}

/** Share Astro's emitted CSS without changing its Unicode subsets or fallback metrics. */
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
                let name = styles.get(css);
                if (!name) {
                  name = `fonts-${createHash('sha256').update(css).digest('hex').slice(0, 12)}.css`;
                  styles.set(css, name);
                }
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
        if (pages === 0) throw new Error(`No inline font CSS found for ${cssVariable}.`);
        for (const [css, name] of styles) {
          await writeFile(new URL(`_astro/${name}`, dir), css);
        }
        logger.info(`Shared font CSS across ${pages} pages (${styles.size} stylesheet).`);
      },
    },
  };
}
