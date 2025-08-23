import React from 'react';
import { EmailNode } from '../types';

type Props = {
  root: EmailNode;
  onSelect: (id?: string) => void;
  selectedId?: string;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onRemove?: (id: string) => void;
  mode?: 'edit' | 'preview';
};

export const Canvas: React.FC<Props> = ({ root, onSelect, selectedId, onMoveUp, onMoveDown, onRemove, mode = 'edit' }) => {
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

    return (
      <div onClick={onNodeClick} className={`neb-node ${isSelected ? 'selected' : ''}`}>
        {isSelected && (
          <div className="neb-pop" onClick={(e) => e.stopPropagation()}>
            <button className="neb-btn" onClick={() => onMoveUp?.(node.id)} title="Move up">↑</button>
            <button className="neb-btn" onClick={() => onMoveDown?.(node.id)} title="Move down">↓</button>
            <button className="neb-btn danger" onClick={() => onRemove?.(node.id)} title="Remove">✕</button>
          </div>
        )}
        {mode === 'edit' && <div className="label">{node.type}</div>}
        {rendered}
      </div>
    );
  }

  return (
    <div onClick={() => onSelect(undefined)} className="neb-canvas-wrap" aria-label="Canvas">
      <div className={`neb-canvas ${mode === 'preview' ? 'neb-preview' : ''}`}>
        <div className="neb-stage">
          <NodeView node={root} />
        </div>
      </div>
    </div>
  );
};
