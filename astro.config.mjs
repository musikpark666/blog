// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { unified } from '@astrojs/markdown-remark';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkBreaks from 'remark-breaks';
import remarkWikiLink from 'remark-wiki-link';
import rehypePostLinks from './src/lib/rehype-post-links.mjs';
import sharedFontCss, { pretendardJp } from './src/lib/shared-font-css.mjs';
import remarkGreentext, { rehypeGreentextLines } from './src/lib/remark-greentext.mjs';
import rehypeCallouts from './src/lib/rehype-callouts.mjs';
import rehypeFootnotes from './src/lib/rehype-footnotes.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://musik.gallery',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    build: {
      // Cache the shared quote widget script instead of repeating it in every page.
      assetsInlineLimit: (filePath) => filePath.includes('QuoteWidget.astro') && filePath.endsWith('.js') ? false : undefined,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkCjkFriendly,
        remarkBreaks,
        remarkGreentext,
        [remarkWikiLink, {
          aliasDivider: '|',
          // GFM table aliases escape the divider: [[slug\|Alias]].
          pageResolver: (name) => [name.trim().replace(/\\$/, '')],
          hrefTemplate: (slug) => `/posts/${encodeURIComponent(slug)}/`,
        }],
      ],
      rehypePlugins: [
        rehypeCallouts,
        rehypeGreentextLines,
        rehypeFootnotes,
        rehypePostLinks,
      ],
      remarkRehype: {
        footnoteLabel: '参考',
        // Keep the heading visible in the collapsible section and the TOC.
        footnoteLabelProperties: {},
      },
    }),
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark'],
      styleOverrides: {
        codeFontFamily: 'var(--font-code)',
        codeFontSize: 'var(--text-ui)',
        codeLineHeight: 'var(--leading-code)',
        codePaddingBlock: '0.875rem',
        codePaddingInline: '0.875rem',
        uiFontFamily: 'var(--font-body)',
        uiFontSize: 'var(--text-small)',
        uiLineHeight: 'var(--leading-ui)',
        uiPaddingBlock: '0.375rem',
        uiPaddingInline: '0.875rem',
        borderRadius: '2px',
        borderWidth: '1px',
        // Keep custom code-block colors in src/styles/global.css.
        borderColor: 'var(--color-code-border)',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorTabBarBackground: 'var(--color-code-chrome)',
          editorTabBarBorderBottomColor: 'var(--color-code-border)',
          editorActiveTabBackground: 'var(--color-code-chrome)',
          editorActiveTabForeground: 'var(--color-code-title-text)',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: 'transparent',
          terminalTitlebarBackground: 'var(--color-code-chrome)',
          terminalTitlebarForeground: 'var(--color-code-title-text)',
          terminalTitlebarBorderBottomColor: 'var(--color-code-border)',
          terminalBackground: 'var(--color-code-surface)',
        },
      },
    }),
    mdx(),
    sharedFontCss('--font-pretendard-jp'),
  ],
  fonts: [
    {
      provider: pretendardJp(),
      name: 'Pretendard JP Variable',
      cssVariable: '--font-pretendard-jp',
      weights: ['45 920'],
      styles: ['normal'],
      display: 'swap',
      fallbacks: [
        'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Noto Sans JP', 'Noto Sans KR',
        'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif',
      ],
    },
  ],
});
