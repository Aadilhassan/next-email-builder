import React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor, createOpenAIAdapter } from 'next-email-builder';
import '../../src/styles.css';

const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
const model = ((import.meta as any).env?.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o-mini';
const baseURL = (import.meta as any).env?.VITE_OPENAI_BASE_URL as string | undefined;

const adapter = apiKey ? createOpenAIAdapter({ apiKey, model, baseURL }) : undefined;

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
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
      <Editor chatAdapter={adapter} />
    </div>
  </React.StrictMode>
);
