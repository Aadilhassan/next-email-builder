import { describe, it, expect } from 'vitest';
import { createSection, createColumn, createText } from '../core';
import { renderToHtml } from './html';

describe('renderToHtml', () => {
  it('renders a simple tree', () => {
    const tree = createSection({}, [createColumn({}, [createText({ content: 'Hello' })])]);
    const html = renderToHtml(tree);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Hello');
  });
});
