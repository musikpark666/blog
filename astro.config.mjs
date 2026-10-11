// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { unified } from '@astrojs/markdown-remark';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkBreaks from 'remark-breaks';

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkCjkFriendly, remarkBreaks],
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
  ],
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
