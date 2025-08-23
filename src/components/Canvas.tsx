import React from 'react';
import { EmailNode } from '../types';

type Props = {
  root: EmailNode;
  onSelect: (id?: string) => void;
  selectedId?: string;
};

export const Canvas: React.FC<Props> = ({ root, onSelect, selectedId }) => {
  function NodeView({ node }: { node: EmailNode }) {
    const isSelected = node.id === selectedId;
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        style={{
          border: isSelected ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
          margin: 6,
          padding: 6,
          borderRadius: 6,
          background: node.type === 'section' ? '#fff' : 'transparent',
        }}
      >
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{node.type}</div>
        {node.children?.map((c) => (
          <NodeView key={c.id} node={c} />
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(undefined)}
      style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, minHeight: 300 }}
      aria-label="Canvas"
    >
      <NodeView node={root} />
    </div>
  );
};
