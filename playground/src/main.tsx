import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor, createOpenAIAdapter, parseHtmlToTree, type EmailNode } from 'next-email-builder';
import '../../src/styles.css';

const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
const model = ((import.meta as any).env?.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o-mini';
const baseURL = (import.meta as any).env?.VITE_OPENAI_BASE_URL as string | undefined;

const adapter = apiKey ? createOpenAIAdapter({ apiKey, model, baseURL }) : undefined;

const root = createRoot(document.getElementById('root')!);

function App() {
  // A tiny sample HTML to seed the editor
  const sampleHtml = `<!doctype html><html><body style="margin:0;padding:0;background:#f6f6f6;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f6f6;"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;"><tr><td align="left" style="background:#ffffff;padding:24px 24px;"><div style="text-align:left;color:#111111;font-size:18px;line-height:1.5;">Welcome 👋</div><div style="height:16px;line-height:16px;font-size:1px;">&nbsp;</div><a href="#" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 16px;border-radius:6px;text-decoration:none;font-weight:600;">Get Started</a></td></tr></table></td></tr></table></body></html>`;

  const [jsonOut, setJsonOut] = useState<EmailNode | null>(null);
  const [htmlOut, setHtmlOut] = useState<string>('');
  const [useJsonInit, setUseJsonInit] = useState(false);

  const initialJson = useMemo(() => parseHtmlToTree(sampleHtml), [sampleHtml]);

  return (
    <div style={{ padding: 24 }}>
      <h1>next-email-builder playground</h1>
      {!apiKey && (
        <div style={{
          margin: '12px 0',
          padding: '8px 12px',
          border: '1px dashed #cbd5e1',
          borderRadius: 8,
          color: '#475569'
        }}>
          Tip: set VITE_OPENAI_API_KEY (and optional VITE_OPENAI_MODEL, VITE_OPENAI_BASE_URL) to enable AI chat in the playground.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={useJsonInit} onChange={e => setUseJsonInit(e.target.checked)} />
          Initialize from JSON (parsed from sample HTML)
        </label>
      </div>

      <Editor
        chatAdapter={adapter}
        initialHtml={useJsonInit ? undefined : sampleHtml}
        initialJson={useJsonInit ? initialJson : undefined}
        onChange={(root) => setJsonOut(root)}
        onHtmlChange={(html) => setHtmlOut(html)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <div>
          <h3 style={{ margin: '8px 0' }}>JSON (live)</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', maxHeight: 280, overflow: 'auto' }}>
            {jsonOut ? JSON.stringify(jsonOut, null, 2) : '—' }
          </pre>
        </div>
        <div>
          <h3 style={{ margin: '8px 0' }}>HTML (live)</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', maxHeight: 280, overflow: 'auto' }}>
            {htmlOut || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
