import React, { useState } from 'react';
import { EmailNode } from '../types';

type Props = {
  root: EmailNode;
  onSelect: (id?: string) => void;
  selectedId?: string;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onRemove?: (id: string) => void;
  mode?: 'edit' | 'preview';
  factories?: Record<string, () => EmailNode>;
  onInsertAt?: (parentId: string, node: EmailNode, index?: number) => void;
  onInsertAfter?: (targetId: string, node: EmailNode) => void;
};

const PlusIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ArrowUpIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 5l-6 6m6-6l6 6M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 19l6-6m-6 6l-6-6M12 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 7h16M9 7V4h6v3m-8 0l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Canvas: React.FC<Props> = ({ root, onSelect, selectedId, onMoveUp, onMoveDown, onRemove, mode = 'edit', factories, onInsertAt, onInsertAfter }) => {
  const [pickerFor, setPickerFor] = useState<string | undefined>(undefined);
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);

  function BlockPicker({ onPick }: { onPick: (type: EmailNode['type']) => void }) {
    const items: Array<{ t: EmailNode['type']; label: string; icon: React.ReactNode }> = [
      { t: 'text', label: 'Text', icon: <span style={{ fontWeight: 700 }}>T</span> },
      { t: 'button', label: 'Button', icon: <span>⬚</span> },
      { t: 'image', label: 'Image', icon: <span>▦</span> },
      { t: 'spacer', label: 'Spacer', icon: <span>—</span> },
      { t: 'column', label: 'Column', icon: <span>▥</span> },
    ];
    return (
      <div className="neb-picker" onClick={(e) => e.stopPropagation()}>
        {items.map((it) => (
          <button key={it.t} className="neb-pick" onClick={() => onPick(it.t)}>
            <div className="icon">{it.icon}</div>
            <div className="lbl">{it.label}</div>
          </button>
        ))}
      </div>
    );
  }
  function NodeView({ node }: { node: EmailNode }) {
    const isSelected = mode === 'edit' && node.id === selectedId;
    const onNodeClick: React.MouseEventHandler = (e) => {
      e.stopPropagation();
      if (mode === 'edit') onSelect(node.id);
    };

    // Render visual preview for each block
    let rendered: React.ReactNode = null;
    if (node.type === 'section') {
      const { backgroundColor = '#ffffff', padding = '24px 24px' } = node.props as any;
      rendered = (
        <div style={{ background: backgroundColor, padding }}>
          {node.children?.map((c) => (
            <NodeView key={c.id} node={c} />
          ))}
        </div>
      );
    } else if (node.type === 'column') {
      const { width = '100%', padding = '0px' } = node.props as any;
      rendered = (
        <div style={{ width, padding }}>
          {node.children?.map((c) => (
            <NodeView key={c.id} node={c} />
          ))}
        </div>
      );
    } else if (node.type === 'text') {
      const { content = '', align = 'left', color = '#111111', fontSize = '14px', lineHeight = '1.5' } = node.props as any;
      rendered = (
        <div style={{ textAlign: align as any, color, fontSize, lineHeight }}>{content}</div>
      );
    } else if (node.type === 'image') {
      const { src = '', alt = '', width = '600' } = node.props as any;
      rendered = (
        <img src={src} alt={alt} width={Number(width) || undefined} style={{ display: 'block', maxWidth: '100%' }} onClick={(e) => e.preventDefault()} />
      );
    } else if (node.type === 'button') {
      const { label = 'Click me', href = '#', backgroundColor = '#0f172a', color = '#ffffff', padding = '12px 16px', borderRadius = '4px' } = node.props as any;
      rendered = (
        <a
          href={href}
          onClick={(e) => e.preventDefault()}
          style={{ display: 'inline-block', background: backgroundColor, color, padding, borderRadius, textDecoration: 'none', fontWeight: 600 }}
        >
          {label}
        </a>
      );
    } else if (node.type === 'spacer') {
      const { height = '16px' } = node.props as any;
      rendered = <div style={{ height, lineHeight: height, fontSize: 1 }} />;
    }

    const showPicker = pickerFor === node.id && mode === 'edit';
    const showAdd = mode === 'edit' && (hoverId === node.id || showPicker);
    return (
      <div
        onClick={onNodeClick}
        onMouseEnter={() => setHoverId(node.id)}
        onMouseLeave={() => setHoverId((id) => (id === node.id ? undefined : id))}
        className={`neb-node ${isSelected ? 'selected' : ''}`}
      >
        {showAdd && (
          <div className="neb-add-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="neb-add-btn"
              title="Add block"
              onClick={() => setPickerFor((p) => (p === node.id ? undefined : node.id))}
            >
              <PlusIcon />
            </button>
            {showPicker && (
              <div className="neb-picker-wrap">
                <BlockPicker
                  onPick={(t) => {
                    if (!factories) return;
                    const make = (factories as any)[t] as (() => EmailNode) | undefined;
                    const newNode = make ? make() : ({ id: Math.random().toString(36).slice(2), type: t, props: {} } as EmailNode);
                    if (node.type === 'section' || node.type === 'column') {
                      onInsertAt?.(node.id, newNode);
                    } else {
                      onInsertAfter?.(node.id, newNode);
                    }
                    setPickerFor(undefined);
                  }}
                />
              </div>
            )}
          </div>
        )}
        {isSelected && mode === 'edit' && (
          <div className="neb-side-ctrl" onClick={(e) => e.stopPropagation()}>
            <button className="ctrl" title="Move up" onClick={() => onMoveUp?.(node.id)}><ArrowUpIcon /></button>
            <button className="ctrl" title="Move down" onClick={() => onMoveDown?.(node.id)}><ArrowDownIcon /></button>
            <button className="ctrl danger" title="Delete" onClick={() => onRemove?.(node.id)}><TrashIcon /></button>
          </div>
        )}
        {mode === 'edit' && <div className="label">{node.type}</div>}
        {rendered}
        
      </div>
    );
  }

  return (
    <div onClick={() => { setPickerFor(undefined); onSelect(undefined); }} className="neb-canvas-wrap" aria-label="Canvas">
      <div className={`neb-canvas ${mode === 'preview' ? 'neb-preview' : ''}`}>
        <div className="neb-stage">
          <NodeView node={root} />
        </div>
      </div>
    </div>
  );
};
