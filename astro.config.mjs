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
        borderColor: '#30363d',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorTabBarBackground: '#161b22',
          editorTabBarBorderBottomColor: '#30363d',
          editorActiveTabBackground: '#161b22',
          editorActiveTabForeground: '#c9d1d9',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: 'transparent',
          terminalTitlebarBackground: '#161b22',
          terminalTitlebarForeground: '#c9d1d9',
          terminalTitlebarBorderBottomColor: '#30363d',
          terminalBackground: '#24292e',
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
