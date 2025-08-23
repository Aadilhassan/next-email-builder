import React, { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas';
import { Palette } from './components/Palette';
import { Inspector } from './components/Inspector';
import { ChatPanel, ChatAdapter } from './chat/ChatPanel';
// Sidebar removed; left panel will host AI chat
import { Toolbar } from './components/Toolbar';
import { EmailNode } from './types';
import { createButton, createColumn, createImage, createSection, createSpacer, createText, findNode, insertNode, removeNode, updateNode, moveSibling } from './core';
import { renderToHtml } from './renderers/html';

export type EditorProps = {
  initial?: EmailNode;
  chatAdapter?: ChatAdapter;
  onChange?: (root: EmailNode) => void;
};

export const Editor: React.FC<EditorProps> = ({ initial, chatAdapter, onChange }) => {
  const [root, setRoot] = useState<EmailNode>(() => initial ?? createSection({}, [createColumn({}, [createText({ content: 'Hello' }), createSpacer(), createButton()])]))
  const [selectedId, setSelectedId] = useState<string | undefined>(root.id);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [undoStack, setUndoStack] = useState<EmailNode[]>([]);
  const [redoStack, setRedoStack] = useState<EmailNode[]>([]);

  const selected = useMemo(() => (selectedId ? findNode(root, selectedId) : undefined), [root, selectedId]);

  function emit(next: EmailNode, pushHistory: boolean = true) {
    if (pushHistory) {
      setUndoStack((s) => [...s, root]);
      setRedoStack([]);
    }
    setRoot(next);
    onChange?.(next);
  }

  function undo() {
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setRedoStack((r) => [...r, root]);
      setRoot(prev);
      onChange?.(prev);
      return s.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setUndoStack((s) => [...s, root]);
      setRoot(next);
      onChange?.(next);
      return r.slice(0, -1);
    });
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

  const [stageWidth, setStageWidth] = useState(600);
  const html = useMemo(() => renderToHtml(root), [root]);

  // Templates removed; left panel hosts Chat instead

  return (
    <div className="neb neb-reset neb-app" style={{ ['--stage-width' as any]: `${stageWidth}px` }}>
      <Toolbar
        mode={mode}
        onSetMode={setMode}
        onCopyHtml={() => navigator.clipboard?.writeText(html)}
        onExportHtml={() => {
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'email.html';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }}
        onPreviewWidth={(w) => setStageWidth(w)}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="neb-shell" style={{ gridTemplateColumns: '320px 1fr 340px' }}>
        <div className="neb-panel">
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="neb-badges"><span className="neb-badge">AI</span></div>
            <div className="neb-badges"><span className="neb-badge">Chat</span></div>
          </div>
          <div className="body">
            {chatAdapter !== null && (
              <ChatPanel root={root} onActions={applyActions} adapter={adapter} />
            )}
          </div>
        </div>
        <div className="neb-panel">
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="neb-badges">
              <span className="neb-badge">Width {stageWidth}px</span>
              <span className="neb-badge">{mode === 'edit' ? 'Edit' : 'Preview'}</span>
            </div>
            <div className="neb-badges">
              <span className="neb-badge">Blocks</span>
            </div>
          </div>
          <div className="body" style={{ display: 'grid', gap: 12 }}>
            <Palette onInsert={add} factories={factories as any} />
            <Canvas
              root={root}
              onSelect={setSelectedId}
              selectedId={selectedId}
              onMoveUp={(id) => emit(moveSibling(root, id, -1))}
              onMoveDown={(id) => emit(moveSibling(root, id, +1))}
              onRemove={(id) => emit(removeNode(root, id))}
              mode={mode}
            />
          </div>
        </div>

        <div className="neb-panel neb-inspector">
          <div className="header">Inspect</div>
          <div className="body">
            <Inspector node={selected} onChange={(patch) => selected && emit(updateNode(root, selected.id, patch))} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
