import rehypeCallouts from 'rehype-callouts';

/** Keep remark-breaks line breaks intact when rendering callouts. */
export default function rehypeCalloutsWithBreaks(options) {
  const renderCallouts = rehypeCallouts(options);

  return (tree) => {
    const originals = [];

    function separateTitle(node) {
      if (node.type === 'element' && node.tagName === 'blockquote') {
        const index = node.children.findIndex((child) => child.type === 'element');
        const paragraph = node.children[index];
        const first = paragraph?.children?.[0];

        if (paragraph?.tagName === 'p' && first?.type === 'text'
          && /^\[![\w-]+\]/.test(first.value)) {
          const lineBreak = paragraph.children.findIndex(
            (child) => child.type === 'element' && child.tagName === 'br'
          );

          if (lineBreak !== -1) {
            originals.push({ node, children: node.children });
            node.children = [...node.children];
            node.children.splice(index, 1,
              { ...paragraph, children: paragraph.children.slice(0, lineBreak) },
              { ...paragraph, children: paragraph.children.slice(lineBreak + 1) }
            );
          }
        }
      }

      for (const child of node.children ?? []) separateTitle(child);
    }

    separateTitle(tree);
    renderCallouts(tree);

    // Leave unrecognized callout types as ordinary, unchanged blockquotes.
    for (const { node, children } of originals) {
      if (node.tagName === 'blockquote') node.children = children;
    }
  };
}
