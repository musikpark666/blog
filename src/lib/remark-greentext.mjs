/** Mark ordinary quotes without changing Obsidian-style callouts. */
export default function remarkGreentext() {
  /** @param {import('mdast').Root | import('mdast').RootContent} node */
  function visit(node) {
    if (node.type === 'blockquote') {
      const first = node.children[0];
      const text = first?.type === 'paragraph' && first.children[0]?.type === 'text'
        ? first.children[0].value.trimStart()
        : '';

      if (!/^\[![^\]\r\n]+\]/.test(text)) {
        node.data ??= {};
        node.data.hProperties = {
          ...node.data.hProperties,
          'data-greentext': '',
        };
      }
    }

    if ('children' in node) {
      for (const child of node.children) visit(child);
    }
  }

  return visit;
}

/** Give each authored line its own marker, preserving inline formatting. */
export function rehypeGreentextLines() {
  function splitLines(children) {
    const lines = [[]];
    for (const child of children) {
      if (child.type === 'element' && child.tagName === 'br') {
        lines.push([]);
        continue;
      }
      const parts = child.type === 'element' && child.children.length
        ? splitLines(child.children).map((children) => ({ ...child, children }))
        : [child];
      parts.forEach((part, index) => {
        if (index) lines.push([]);
        lines.at(-1).push(part);
      });
    }
    return lines;
  }

  function visit(node) {
    if (node.type === 'element' && node.tagName === 'blockquote'
      && ('data-greentext' in node.properties || 'dataGreentext' in node.properties)) {
      for (const paragraph of node.children) {
        if (paragraph.type !== 'element' || paragraph.tagName !== 'p') continue;
        paragraph.children = splitLines(paragraph.children).map((children) => ({
          type: 'element', tagName: 'span',
          properties: { className: ['greentext-line'] },
          children,
        }));
      }
    }
    for (const child of node.children ?? []) visit(child);
  }

  return visit;
}
