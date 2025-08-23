import React from 'react';
import { EmailNode } from '../types';

type Props = {
  onInsert: (node: EmailNode) => void;
  factories: Record<string, () => EmailNode>;
};

export const Palette: React.FC<Props> = ({ onInsert, factories }) => {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {Object.entries(factories).map(([key, make]) => (
        <button
          key={key}
          onClick={() => onInsert(make())}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
        >
          + {key}
        </button>
      ))}
    </div>
  );
};
