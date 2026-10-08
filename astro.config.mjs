// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      weights: ['400 700'],
      styles: ['normal'],
      display: 'swap',
      fallbacks: [
        'Hiragino Sans',
        'Yu Gothic',
        'Meiryo',
        'sans-serif',
      ],
    },
  ],
});