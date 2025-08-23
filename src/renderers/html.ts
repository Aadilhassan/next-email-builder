import { EmailNode } from '../types';

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderToHtml(root: EmailNode): string {
  const inner = renderNode(root);
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Email</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f6f6;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;">
            ${inner}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderNode(node: EmailNode): string {
  switch (node.type) {
    case 'section': {
      const { backgroundColor = '#ffffff', padding = '24px 24px', align = 'left' } = node.props as any;
      const children = (node.children ?? []).map(renderNode).join('');
      return `<tr><td align="${align}" style="background:${backgroundColor};padding:${esc(padding)};">${children}</td></tr>`;
    }
    case 'column': {
      const { width = '100%', padding = '0px', align = 'left' } = node.props as any;
      const children = (node.children ?? []).map(renderNode).join('');
      return `<table role="presentation" width="${esc(width)}" style="width:${esc(width)};" cellpadding="0" cellspacing="0"><tr><td align="${align}" style="padding:${esc(padding)};">${children}</td></tr></table>`;
    }
    case 'text': {
      const { content = '', align = 'left', color = '#111111', fontSize = '14px', lineHeight = '1.5' } = node.props as any;
      return `<div style="text-align:${align};color:${color};font-size:${esc(fontSize)};line-height:${esc(lineHeight)};">${content}</div>`;
    }
    case 'image': {
      const { src = '', alt = '', width = '600', href } = node.props as any;
      const img = `<img src="${esc(src)}" alt="${esc(alt)}" width="${esc(width)}" style="display:block;border:0;outline:none;text-decoration:none;width:${esc(width)}px;max-width:100%;" />`;
      return href ? `<a href="${esc(href)}" target="_blank">${img}</a>` : img;
    }
    case 'button': {
      const { label = 'Click me', href = '#', backgroundColor = '#0f172a', color = '#ffffff', padding = '12px 16px', borderRadius = '4px' } = node.props as any;
      return `<a href="${esc(href)}" style="display:inline-block;background:${backgroundColor};color:${color};padding:${esc(padding)};border-radius:${esc(borderRadius)};text-decoration:none;font-weight:600;">${esc(label)}</a>`;
    }
    case 'spacer': {
      const { height = '16px' } = node.props as any;
      return `<div style="height:${esc(height)};line-height:${esc(height)};font-size:1px;">&nbsp;</div>`;
    }
    default:
      return '';
  }
}
