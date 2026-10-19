import type { APIRoute, GetStaticPaths } from 'astro';
import source from '../../content/quotes.yaml?raw';
import { createQuoteData } from '../../lib/quotes.mjs';

const { json, version } = createQuoteData(source);

export const getStaticPaths: GetStaticPaths = () => [{ params: { version } }];

export const GET: APIRoute = () => new Response(json, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
});
