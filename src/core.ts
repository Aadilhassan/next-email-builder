import { EmailNode, SectionProps, TextProps, ImageProps, ButtonProps, SpacerProps, ColumnProps } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const createSection = (props: Partial<SectionProps> = {}, children: EmailNode[] = []): EmailNode<SectionProps> => ({
  id: uid(),
  type: 'section',
  props: {
    backgroundColor: '#ffffff',
    padding: '24px 24px',
    align: 'left',
    ...props,
  },
  children,
});

export const createColumn = (props: Partial<ColumnProps> = {}, children: EmailNode[] = []): EmailNode<ColumnProps> => ({
  id: uid(),
  type: 'column',
  props: {
    width: '100%',
    padding: '0px',
    align: 'left',
    ...props,
  },
  children,
});

export const createText = (props: Partial<TextProps> = {}): EmailNode<TextProps> => ({
  id: uid(),
  type: 'text',
  props: {
    content: 'Write something…',
    align: 'left',
    color: '#111111',
    fontSize: '14px',
    lineHeight: '1.5',
    ...props,
  },
});

export const createImage = (props: Partial<ImageProps> = {}): EmailNode<ImageProps> => ({
  id: uid(),
  type: 'image',
  props: {
    src: 'https://via.placeholder.com/600x200',
    alt: 'Image',
    width: '600',
    ...props,
  },
});

export const createButton = (props: Partial<ButtonProps> = {}): EmailNode<ButtonProps> => ({
  id: uid(),
  type: 'button',
  props: {
    label: 'Click me',
    href: '#',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: '4px',
    ...props,
  },
});

export const createSpacer = (props: Partial<SpacerProps> = {}): EmailNode<SpacerProps> => ({
  id: uid(),
  type: 'spacer',
  props: {
    height: '16px',
    ...props,
  },
});

export function findNode(root: EmailNode, id: string): EmailNode | undefined {
  if (root.id === id) return root;
  if (!root.children) return undefined;
  for (const child of root.children) {
    const res = findNode(child, id);
    if (res) return res;
  }
  return undefined;
}

export function updateNode(root: EmailNode, id: string, patch: Partial<EmailNode['props']>): EmailNode {
  if (root.id === id) {
    return { ...root, props: { ...root.props, ...patch } } as EmailNode;
  }
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map((c) => updateNode(c, id, patch)),
  };
}

export function insertNode(root: EmailNode, parentId: string, node: EmailNode, index?: number): EmailNode {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])];
    const i = index === undefined ? children.length : Math.max(0, Math.min(children.length, index));
    children.splice(i, 0, node);
    return { ...root, children };
  }
  if (!root.children) return root;
  return { ...root, children: root.children.map((c) => insertNode(c, parentId, node, index)) };
}

export function removeNode(root: EmailNode, id: string): EmailNode {
  if (!root.children) return root.id === id ? root : root;
  const filtered = root.children.filter((c) => c.id !== id).map((c) => removeNode(c, id));
  return { ...root, children: filtered };
}

export function moveNode(root: EmailNode, id: string, newParentId: string, newIndex: number): EmailNode {
  // Extract node
  let extracted: EmailNode | undefined;
  function _remove(n: EmailNode): EmailNode {
    if (!n.children) return n;
    const idx = n.children.findIndex((c) => c.id === id);
    if (idx >= 0) {
      extracted = n.children[idx];
      const nextChildren = [...n.children.slice(0, idx), ...n.children.slice(idx + 1)];
      return { ...n, children: nextChildren };
    }
    return { ...n, children: n.children.map(_remove) };
  }
  const without = _remove(root);
  if (!extracted) return root;
  return insertNode(without, newParentId, extracted, newIndex);
}

export function findParent(
  root: EmailNode,
  id: string,
  parent: EmailNode | null = null
): { parent: EmailNode | null; index: number } | null {
  if (!root.children) return null;
  const idx = root.children.findIndex((c) => c.id === id);
  if (idx >= 0) return { parent: root, index: idx };
  for (const child of root.children) {
    const res = findParent(child, id, root);
    if (res) return res;
  }
  return null;
}

export function moveSibling(root: EmailNode, id: string, delta: number): EmailNode {
  const info = findParent(root, id);
  if (!info || !info.parent) return root;
  const { parent, index } = info;
  const children = [...(parent.children ?? [])];
  const to = Math.max(0, Math.min(children.length - 1, index + delta));
  if (to === index) return root;
  const [node] = children.splice(index, 1);
  children.splice(to, 0, node);
  const replaced = { ...parent, children };
  // write back replaced parent into tree
  if (root.id === replaced.id) return replaced;
  function write(n: EmailNode): EmailNode {
    if (!n.children) return n;
    if (n.id === replaced.id) return replaced;
    return { ...n, children: n.children.map(write) };
  }
  return write(root);
}
