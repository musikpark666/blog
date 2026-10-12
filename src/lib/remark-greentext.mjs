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
