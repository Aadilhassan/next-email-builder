import React from 'react';

type Props = {
  mode: 'edit' | 'preview';
  onSetMode: (m: 'edit' | 'preview') => void;
  onCopyHtml: () => void;
  onExportHtml: () => void;
  onPreviewWidth: (w: number) => void;
  onUndo: () => void;
  onRedo: () => void;
};

export const Toolbar: React.FC<Props> = ({ mode, onSetMode, onCopyHtml, onExportHtml, onPreviewWidth, onUndo, onRedo }) => {
  return (
    <div className="neb neb-toolbar">
      <div className="group">
        <button className="neb-btn ghost" title="Undo" onClick={onUndo}>↶</button>
        <button className="neb-btn ghost" title="Redo" onClick={onRedo}>↷</button>
      </div>
      <div className="group">
        <span style={{ color: 'var(--subtle)', fontSize: 12 }}>Mode</span>
        <button className="neb-btn" onClick={() => onSetMode('edit')} style={{ outline: mode === 'edit' ? `2px solid var(--accent)` : undefined }}>Edit</button>
        <button className="neb-btn" onClick={() => onSetMode('preview')} style={{ outline: mode === 'preview' ? `2px solid var(--accent)` : undefined }}>Preview</button>
      </div>
      <div className="group">
        <span style={{ color: 'var(--subtle)', fontSize: 12 }}>Preview</span>
        <button className="neb-btn" onClick={() => onPreviewWidth(360)}>Mobile</button>
        <button className="neb-btn" onClick={() => onPreviewWidth(600)}>Default</button>
        <button className="neb-btn" onClick={() => onPreviewWidth(800)}>Desktop</button>
      </div>
      <div className="group">
        <button className="neb-btn" onClick={onCopyHtml}>Copy HTML</button>
        <button className="neb-btn primary" onClick={onExportHtml}>Export</button>
      </div>
    </div>
  );
};
