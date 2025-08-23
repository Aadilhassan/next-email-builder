import React, { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas';
import { Palette } from './components/Palette';
import { Inspector } from './components/Inspector';
import { ChatPanel, ChatAdapter } from './chat/ChatPanel';
import { EmailNode } from './types';
import { createButton, createColumn, createImage, createSection, createSpacer, createText, findNode, insertNode, removeNode, uid, updateNode } from './core';
import { renderToHtml } from './renderers/html';

export type EditorProps = {
  initial?: EmailNode;
  chatAdapter?: ChatAdapter;
  onChange?: (root: EmailNode) => void;
};

export const Editor: React.FC<EditorProps> = ({ initial, chatAdapter, onChange }) => {
  const [root, setRoot] = useState<EmailNode>(() => initial ?? createSection({}, [createColumn({}, [createText({ content: 'Hello' }), createSpacer(), createButton()])]))
  const [selectedId, setSelectedId] = useState<string | undefined>(root.id);

  const selected = useMemo(() => (selectedId ? findNode(root, selectedId) : undefined), [root, selectedId]);

  function emit(next: EmailNode) {
    setRoot(next);
    onChange?.(next);
  }

  function add(node: EmailNode) {
    const parentId = selectedId ?? root.id;
    emit(insertNode(root, parentId, node));
  }

  function applyActions(actions: Array<{ type: string; [k: string]: any }>) {
    let current = root;
    for (const a of actions) {
      switch (a.type) {
        case 'insert':
          current = insertNode(current, a.parentId, a.node, a.index);
          break;
        case 'update':
          current = updateNode(current, a.id, a.props);
          break;
        case 'remove':
          current = removeNode(current, a.id);
          break;
        case 'select':
          setSelectedId(a.id);
          break;
      }
    }
    emit(current);
  }

  const factories = {
    text: () => createText(),
    image: () => createImage(),
    button: () => createButton(),
    spacer: () => createSpacer(),
    column: () => createColumn(),
    section: () => createSection(),
  } as const;

  const adapter: ChatAdapter = chatAdapter ?? {
    async send({ message }) {
      // naive local adapter: parse a very simple command
      if (/add text/i.test(message)) {
        return [{ type: 'insert', parentId: selectedId ?? root.id, node: createText({ content: 'New text' }) }];
      }
      if (/add button/i.test(message)) {
        return [{ type: 'insert', parentId: selectedId ?? root.id, node: createButton({ label: 'Buy now' }) }];
      }
      if (/remove/i.test(message) && selectedId) {
        return [{ type: 'remove', id: selectedId }];
      }
      if (/title:\s*(.+)/i.test(message)) {
        const m = message.match(/title:\s*(.+)/i)!;
        return [{ type: 'update', id: selectedId ?? root.id, props: { content: m[1] } }];
      }
      return [];
    },
  };

  const html = useMemo(() => renderToHtml(root), [root]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: 12, alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Palette</div>
        <Palette onInsert={add} factories={factories as any} />
        {chatAdapter !== null && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>AI</div>
            <ChatPanel root={root} onActions={applyActions} adapter={adapter} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Canvas</div>
        <Canvas root={root} onSelect={setSelectedId} selectedId={selectedId} />
        <div style={{ fontWeight: 700 }}>Preview (HTML)</div>
        <iframe title="preview" style={{ width: '100%', height: 360, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} srcDoc={html} />
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Inspector</div>
        <Inspector node={selected} onChange={(patch) => selected && emit(updateNode(root, selected.id, patch))} />
        <button onClick={() => navigator.clipboard?.writeText(html)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}>Copy HTML</button>
      </div>
    </div>
  );
};

export default Editor;
