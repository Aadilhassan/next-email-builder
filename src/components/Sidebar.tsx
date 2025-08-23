import React from 'react';
import { EmailNode } from '../types';

type Props = {
  templates: Array<{ id: string; name: string; make: () => EmailNode }>;
  onApply: (node: EmailNode) => void;
};

export const Sidebar: React.FC<Props> = ({ templates, onApply }) => {
  return (
    <div className="neb neb-panel neb-sidebar">
      <div className="header">Templates</div>
      <div className="body">
        {templates.map((t) => (
          <div key={t.id} className="template" onClick={() => onApply(t.make())}>
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
};
