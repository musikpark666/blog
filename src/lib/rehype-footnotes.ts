import type { Element, Root, RootContent } from 'hast';
import type { Blockquote, Nodes, Parents, Root as MarkdownRoot, FootnoteDefinition } from 'mdast';

/** Keep unused definitions in the normal Markdown pipeline instead of discarding them. */
export function remarkFootnotes() {
  return (tree: MarkdownRoot) => {
    const referenced = new Set<string>();
    const definitions = new Map<string, FootnoteDefinition>();
    const unreferenced: Blockquote[] = [];

    function collect(node: Nodes) {
      if (node.type === 'footnoteReference') referenced.add(node.identifier.toUpperCase());
      if (node.type === 'footnoteDefinition') {
        const identifier = node.identifier.toUpperCase();
        if (definitions.has(identifier)) return;
        definitions.set(identifier, node);
      }
      if ('children' in node) node.children.forEach(collect);
    }

    function preserve(parent: Parents) {
      parent.children = parent.children.filter((node) => {
        if (node.type === 'footnoteDefinition' && !referenced.has(node.identifier.toUpperCase())) {
          // Match Markdown's first-definition-wins behavior, including case variants.
          if (definitions.get(node.identifier.toUpperCase()) === node) {
            unreferenced.push({
              type: 'blockquote',
              data: { hName: 'div', hProperties: { dataUnreferencedFootnote: true } },
              children: node.children,
            });
          }
          return false;
        }
        if ('children' in node) preserve(node);
        return true;
      }) as typeof parent.children;
    }

    collect(tree);
    if ([...definitions.keys()].every((identifier) => referenced.has(identifier))) return;
    preserve(tree);
    // References inside these entries are rendered after references in the body.
    tree.children.push(...unreferenced);
  };
}

/** Fold references and put return links in their numbered labels. */
export default function rehypeFootnotes() {
  return (tree: Root) => {
    const unreferenced: Element[] = [];
    let section: Element | undefined;

    function collectUnreferenced(parent: Root | Element) {
      parent.children = parent.children.filter((node) => {
        if (node.type === 'element') {
          if ('dataFootnoteRef' in node.properties) {
            const number = node.children[0];
            if (number?.type === 'text') {
              node.properties.ariaLabel = `参考 ${number.value}`;
              number.value = `[${number.value}]`;
            }
          }
          if ('dataFootnotes' in node.properties) section = node;
          collectUnreferenced(node);
          if ('dataUnreferencedFootnote' in node.properties) {
            unreferenced.push({
              type: 'element', tagName: 'li',
              properties: { className: ['footnote-unreferenced'] },
              children: node.children,
            });
            return false;
          }
        }
        return true;
      });
    }

    collectUnreferenced(tree);
    if (unreferenced.length) {
      if (!section) {
        section = {
          type: 'element', tagName: 'section',
          properties: { dataFootnotes: true, className: ['footnotes'] },
          children: [{
            type: 'element', tagName: 'h2', properties: { id: 'footnote-label' },
            children: [{ type: 'text', value: '参考' }],
          }],
        };
        tree.children.push(section);
      }
      section.children.push({
        type: 'element', tagName: 'ul', properties: {}, children: unreferenced,
      });
    }

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
        if ('dataFootnotes' in node.properties) {
          const heading = node.children.find(
            (child): child is Element => child.type === 'element' && child.tagName === 'h2'
          );
          const lists = node.children.filter(
            (child): child is Element => child.type === 'element' && ['ol', 'ul'].includes(child.tagName)
          );
          for (const list of lists) {
            list.properties.role = 'list';
            let number = 0;

            for (const item of list.children) {
              if (item.type !== 'element' || item.tagName !== 'li') continue;
              const numbered = list.tagName === 'ol';
              if (numbered) number += 1;
              const links: Element[] = [];
              takeBackrefs(item, links);

              links.forEach((link, index) => {
                link.properties.ariaLabel = `本文の引用 ${number}${index ? `（${index + 1}箇所目）` : ''}に戻る`;
                link.children = [{ type: 'text', value: `[${number}${index ? `·${index + 1}` : ''}]` }];
              });

              item.children = [
                {
                  type: 'element', tagName: 'span',
                  properties: { className: ['footnote-number'], ...(!numbered && { ariaHidden: 'true' }) },
                  children: numbered ? links : [{ type: 'text', value: '[-]' }],
                },
                {
                  type: 'element', tagName: 'div',
                  properties: { className: ['footnote-content'] },
                  children: item.children,
                },
              ];
            }
          }
          if (heading && lists.length) {
            node.children = [{
              type: 'element', tagName: 'details', properties: {},
              children: [
                {
                  type: 'element', tagName: 'summary', properties: {},
                  children: [heading],
                },
                ...lists,
              ],
            }];
          }
        }
      }

      if ('children' in node) {
        for (const child of node.children) visit(child);
      }
    }

    // The body was already processed while collecting references.
    if (section) visit(section);
  };
}
