import rehypeRaw from 'rehype-raw';
import rehypeExternalLinks from 'rehype-external-links';

const announcement = '（新しいタブで開く）';
const mdxNodes = ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression'];

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

function isExternal(href) {
  try {
    const url = new URL(href, 'https://musik.gallery');
    return ['http:', 'https:'].includes(url.protocol) && url.hostname !== 'musik.gallery';
  } catch {
    return false;
  }
}

function externalRel(rel = []) {
  const values = typeof rel === 'string' ? rel.split(/\s+/) : rel;
  return [...new Set([...values.filter(Boolean), 'noopener', 'noreferrer'])];
}

export default function rehypePostLinks() {
  const parseRaw = rehypeRaw({ passThrough: mdxNodes });
  const decorateLinks = rehypeExternalLinks({
    target: '_blank',
    rel: (node) => externalRel(node.properties.rel),
    test: (node) => isExternal(String(node.properties.href)),
    content: { type: 'text', value: announcement },
    contentProperties: { className: ['visually-hidden'] },
  });

  return (tree, file) => {
    // Markdown HTML becomes HAST only after reparsing. Leave MDX syntax intact.
    let hasRaw = false;
    walk(tree, (node) => { if (node.type === 'raw') hasRaw = true; });
    if (hasRaw) tree = parseRaw(tree, file);
    decorateLinks(tree);

    // Literal <a> in MDX remains a JSX node rather than a HAST element.
    walk(tree, (node) => {
      if ((node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') || node.name !== 'a') return;
      const href = node.attributes.find((attr) => attr.name === 'href')?.value;
      if (typeof href !== 'string' || !isExternal(href)) return;
      const rel = node.attributes.find((attr) => attr.name === 'rel')?.value;
      node.attributes = node.attributes.filter((attr) => !['target', 'rel'].includes(attr.name));
      node.attributes.push(
        { type: 'mdxJsxAttribute', name: 'target', value: '_blank' },
        { type: 'mdxJsxAttribute', name: 'rel', value: externalRel(typeof rel === 'string' ? rel : []).join(' ') },
      );
      node.children.push({
        type: 'mdxJsxTextElement', name: 'span',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'visually-hidden' }],
        children: [{ type: 'text', value: announcement }],
      });
    });
    return tree;
  };
}
