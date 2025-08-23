import React from 'react';
import { EmailNode } from '../types';

type Props = {
  node?: EmailNode;
  onChange: (patch: Record<string, unknown>) => void;
};

export const Inspector: React.FC<Props> = ({ node, onChange }) => {
  if (!node) return <div style={{ color: '#64748b' }}>Select a node to edit.</div>;
  const entries = Object.entries(node.props ?? {});
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>{node.type} props</div>
      {entries.map(([k, v]) => (
        <label key={k} style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>{k}</span>
          <input
            value={String(v ?? '')}
            onChange={(e) => onChange({ [k]: e.target.value })}
            style={{ padding: 6, border: '1px solid #cbd5e1', borderRadius: 6 }}
          />
        </label>
      ))}
    </div>
  );
};
