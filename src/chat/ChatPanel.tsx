import React, { useState } from 'react';
import { AssistantAction, EmailNode } from '../types';

export interface ChatAdapter {
  send: (ctx: { root: EmailNode; message: string }) => Promise<AssistantAction[]>;
}

type Props = {
  root: EmailNode;
  onActions: (actions: AssistantAction[]) => void;
  adapter: ChatAdapter;
};

export const ChatPanel: React.FC<Props> = ({ root, onActions, adapter }) => {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true);
    try {
      const actions = await adapter.send({ root, message: input.trim() });
      onActions(actions);
      setInput('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="Ask AI to update your email…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={busy}
        style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }}
      />
      <button disabled={busy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>
        {busy ? 'Thinking…' : 'Send'}
      </button>
    </form>
  );
};
