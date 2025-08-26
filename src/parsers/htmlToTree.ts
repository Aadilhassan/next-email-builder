import { EmailNode } from '../types';
import { createButton, createColumn, createImage, createSection, createSpacer, createText, uid } from '../core';

function parseStyle(style: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!style) return out;
  style.split(';').forEach(part => {
    const [k, ...rest] = part.split(':');
    if (!k || rest.length === 0) return;
    const key = k.trim().toLowerCase();
    const val = rest.join(':').trim();
    if (key) out[key] = val;
  });
  return out;
}

function textOf(el: Element): string {
  return (el as HTMLElement).innerHTML ?? '';
}

function parseSectionTd(td: HTMLTableCellElement): EmailNode {
  const s = parseStyle(td.getAttribute('style'));
  const backgroundColor = s['background'] || s['background-color'] || '#ffffff';
  const padding = s['padding'] || '24px 24px';
  const align = (td.getAttribute('align') as any) || 'left';

  const section = createSection({ backgroundColor, padding, align });
  const children: EmailNode[] = [];

  td.childNodes.forEach(node => {
    if (node.nodeType !== 1) return; // element
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === 'table') {
      // Likely a column
      const width = (el.getAttribute('width') || (parseStyle(el.getAttribute('style'))['width'] ?? '100%')).toString();
      // find td inside
      const innerTd = el.querySelector('td');
      const col = createColumn({ width, padding: innerTd ? (parseStyle(innerTd.getAttribute('style'))['padding'] || '0px') : '0px' });
      const blocks: EmailNode[] = innerTd ? parseBlocks(innerTd) : [];
      col.children = blocks;
      children.push(col);
    } else {
      // direct blocks inside section
      const blocks = parseBlocks(td);
      blocks.forEach(b => children.push(b));
    }
  });

  section.children = children;
  return section;
}

function parseBlocks(container: Element): EmailNode[] {
  const out: EmailNode[] = [];
  container.childNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    const el = n as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === 'div') {
      const s = parseStyle(el.getAttribute('style'));
      const hasHeightOnly = !!s['height'] && (s['font-size']?.includes('1px') || s['line-height'] === s['height']);
      if (hasHeightOnly) {
        out.push(createSpacer({ height: s['height'] }));
      } else {
        out.push(createText({
          content: textOf(el),
          align: (s['text-align'] as any) || 'left',
          color: s['color'] || '#111111',
          fontSize: s['font-size'] || '14px',
          lineHeight: s['line-height'] || '1.5',
        }));
      }
      return;
    }

    if (tag === 'a') {
      const s = parseStyle(el.getAttribute('style'));
      // If it's our button style (inline-block + background)
      if ((s['display']?.includes('inline-block') || s['display']?.includes('inline')) && (s['background'] || s['background-color'])) {
        out.push(createButton({
          label: el.textContent || 'Click me',
          href: el.getAttribute('href') || '#',
          backgroundColor: s['background'] || s['background-color'] || '#0f172a',
          color: s['color'] || '#ffffff',
          padding: s['padding'] || '12px 16px',
          borderRadius: s['border-radius'] || '4px',
        }));
        return;
      }
      // Could also be a linked image
      const img = el.querySelector('img');
      if (img) {
        const istyle = parseStyle(img.getAttribute('style'));
        out.push(createImage({
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          width: img.getAttribute('width') || istyle['width']?.replace('px', '') || '600',
          href: el.getAttribute('href') || undefined,
        }));
        return;
      }
    }

    if (tag === 'img') {
      const s = parseStyle(el.getAttribute('style'));
      out.push(createImage({
        src: el.getAttribute('src') || '',
        alt: el.getAttribute('alt') || '',
        width: el.getAttribute('width') || s['width']?.replace('px', '') || '600',
      }));
      return;
    }
  });
  return out;
}

export function parseHtmlToTree(html: string): EmailNode {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const inner = doc.querySelector('table[width="600"]') as HTMLTableElement | null;
    if (!inner) throw new Error('Unable to find inner table');
    const sections: EmailNode[] = [];
    inner.querySelectorAll(':scope > tbody > tr > td, :scope > tr > td').forEach(td => {
      // Different browsers may or may not include tbody
      sections.push(parseSectionTd(td as HTMLTableCellElement));
    });
    if (sections.length === 0) {
      // Fallback: one blank section+column
      const section = createSection({}, [createColumn({}, [createText({ content: 'Hello' })])]);
      return section;
    }
    // If multiple sections detected, wrap them into a root section with columns? Our model expects root to be a section; allow multiple by creating a root with children as sections.
    if (sections.length === 1) return sections[0];
    const root = createSection({}, []);
    root.children = sections;
    return root;
  } catch (e) {
    // Fallback to a simple default if parsing fails
    return createSection({}, [createColumn({}, [createText({ content: 'Hello' })])]);
  }
}

// Expose uid for advanced consumers (not exported in index here)
export { uid };
