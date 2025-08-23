import React, { useState } from 'react';
import { AssistantAction, EmailNode } from '../types';

export interface ChatAdapter {
  send: (ctx: { root: EmailNode; message: string }) => Promise<
    | AssistantAction[]
    | { actions: AssistantAction[]; summary?: string; reply?: string }
  >;
}

type Props = {
  root: EmailNode;
  onActions: (actions: AssistantAction[]) => void;
  adapter: ChatAdapter;
};

export const ChatPanel: React.FC<Props> = ({ root, onActions, adapter }) => {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  function summarize(actions: AssistantAction[]): string {
    if (!actions.length) return 'No changes.';
    const types = actions.map(a => a.type);
    if (types.includes('replace')) return 'Replaced the entire email with a new template.';
    const counts = types.reduce<Record<string, number>>((m, t) => (m[t] = (m[t] ?? 0) + 1, m), {});
    const parts = Object.entries(counts).map(([t, n]) => `${n} ${t}`);
    return `Applied: ${parts.join(', ')}.`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setBusy(true);
    try {
      const res = await adapter.send({ root, message: text });
      const { actions, summary, reply } = Array.isArray(res) ? { actions: res, summary: undefined, reply: undefined } : res;
      onActions(actions);
      const msgs: Array<{ role: 'assistant'; content: string }> = [];
      if (reply && reply.trim()) msgs.push({ role: 'assistant', content: reply });
      const fallback = actions.length > 0
        ? summarize(actions)
        : `No changes.`;
      const summaryToShow = summary || (actions.length ? fallback : undefined);
      if (summaryToShow) msgs.push({ role: 'assistant', content: summaryToShow });
      if (msgs.length === 0) msgs.push({ role: 'assistant', content: 'No changes.' });
      setMessages((m) => [...m, ...msgs]);
      setInput('');
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${err?.message ?? String(err)}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 8, height: '100%' }}>
      <div style={{ overflow: 'auto', display: 'grid', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--subtle)', fontSize: 13 }}>
            Tip: Try “Create a promo email for a summer sale with a big hero image, 2 columns of features, and a CTA button. Branded blue.”
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            justifySelf: m.role === 'user' ? 'end' : 'start',
            background: m.role === 'user' ? 'var(--accent)' : 'var(--muted)',
            color: m.role === 'user' ? '#fff' : 'var(--text)',
            padding: '8px 10px', borderRadius: 10, maxWidth: '80%'
          }}>
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Ask AI to create or edit your email…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          className="neb-input"
          style={{ flex: 1 }}
        />
        <button disabled={busy} className="neb-btn primary">
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </form>
    </div>
  );
};
