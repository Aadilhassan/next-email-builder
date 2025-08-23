import React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from 'next-email-builder';
import '../../src/styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <div style={{ padding: 24 }}>
      <h1>next-email-builder playground</h1>
      <Editor />
    </div>
  </React.StrictMode>
);
