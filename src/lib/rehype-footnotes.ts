import type { Element, Root, RootContent } from 'hast';

/** Fold references and put return links in their numbered labels. */
export default function rehypeFootnotes() {
  return (tree: Root) => {
    function takeBackrefs(parent: Element, links: Element[]) {
      parent.children = parent.children.filter((child) => {
        if (child.type === 'element') {
          if ('dataFootnoteBackref' in child.properties) {
            links.push(child);
            return false;
          }
          takeBackrefs(child, links);
        }
        return true;
      });
    }

    function visit(node: Root | RootContent) {
      if (node.type === 'element') {
        if ('dataFootnoteRef' in node.properties) {
          const number = node.children[0];
          if (number?.type === 'text') {
            node.properties.ariaLabel = `参考 ${number.value}`;
            number.value = `[${number.value}]`;
          }
        }

        if ('dataFootnotes' in node.properties) {
          const heading = node.children.find(
            (child): child is Element => child.type === 'element' && child.tagName === 'h2'
          );
          const list = node.children.find(
            (child): child is Element => child.type === 'element' && child.tagName === 'ol'
          );
          if (list) {
            list.properties.role = 'list';
            let number = 0;

            for (const item of list.children) {
              if (item.type !== 'element' || item.tagName !== 'li') continue;
              number += 1;
              const links: Element[] = [];
              takeBackrefs(item, links);

              links.forEach((link, index) => {
                link.properties.ariaLabel = `本文の引用 ${number}${index ? `（${index + 1}箇所目）` : ''}に戻る`;
                link.children = [{ type: 'text', value: `[${number}${index ? `·${index + 1}` : ''}]` }];
              });

              item.children = [
                {
                  type: 'element', tagName: 'span',
                  properties: { className: ['footnote-number'] },
                  children: links,
                },
                {
                  type: 'element', tagName: 'div',
                  properties: { className: ['footnote-content'] },
                  children: item.children,
                },
              ];
            }
          }
          if (heading && list) {
            node.children = [{
              type: 'element', tagName: 'details', properties: {},
              children: [
                {
                  type: 'element', tagName: 'summary', properties: {},
                  children: [heading],
                },
                list,
              ],
            }];
          }
        }
      }

      if ('children' in node) {
        for (const child of node.children) visit(child);
      }
    }

    visit(tree);
  };
}
