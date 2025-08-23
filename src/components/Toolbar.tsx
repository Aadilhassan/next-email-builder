import React from 'react';

type Props = {
  mode: 'edit' | 'preview';
  onSetMode: (m: 'edit' | 'preview') => void;
  onCopyHtml: () => void;
  onExportHtml: () => void;
  onPreviewWidth: (w: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  activeWidth?: number;
};

const PencilIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M14.06 6.19l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.53-1.53a1.5 1.5 0 00-2.12 0l-1.65 1.65z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const EyeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const PhoneIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="3" width="8" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

const TabletIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
  </svg>
);

const DesktopIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M9 20h6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 16v4M14 16v4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const Toolbar: React.FC<Props> = ({ mode, onSetMode, onCopyHtml, onExportHtml, onPreviewWidth, onUndo, onRedo, activeWidth }) => {
  const isActiveWidth = (w: number) => activeWidth === w;
  return (
    <div className="neb neb-toolbar">
      <div className="group">
        <button className="neb-btn ghost" title="Undo" onClick={onUndo}>↶</button>
        <button className="neb-btn ghost" title="Redo" onClick={onRedo}>↷</button>
      </div>
      <div className="group">
        <span style={{ color: 'var(--subtle)', fontSize: 12 }}>Mode</span>
        <div className="neb-seg" role="group" aria-label="Mode">
          <button
            type="button"
            className={`seg-btn ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => onSetMode('edit')}
            aria-pressed={mode === 'edit'}
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className={`seg-btn ${mode === 'preview' ? 'active' : ''}`}
            onClick={() => onSetMode('preview')}
            aria-pressed={mode === 'preview'}
            title="Preview"
          >
            <EyeIcon />
          </button>
        </div>
      </div>
      <div className="group">
        <span style={{ color: 'var(--subtle)', fontSize: 12 }}>Preview</span>
        <div className="neb-seg" role="group" aria-label="Preview width">
          <button
            type="button"
            className={`seg-btn ${isActiveWidth?.(360) ? 'active' : ''}`}
            onClick={() => onPreviewWidth(360)}
            aria-pressed={isActiveWidth?.(360)}
            title="Mobile"
          >
            <PhoneIcon />
          </button>
          <button
            type="button"
            className={`seg-btn ${isActiveWidth?.(600) ? 'active' : ''}`}
            onClick={() => onPreviewWidth(600)}
            aria-pressed={isActiveWidth?.(600)}
            title="Default"
          >
            <TabletIcon />
          </button>
          <button
            type="button"
            className={`seg-btn ${isActiveWidth?.(800) ? 'active' : ''}`}
            onClick={() => onPreviewWidth(800)}
            aria-pressed={isActiveWidth?.(800)}
            title="Desktop"
          >
            <DesktopIcon />
          </button>
        </div>
      </div>
      <div className="group">
        <button className="neb-btn" onClick={onCopyHtml}>Copy HTML</button>
        <button className="neb-btn primary" onClick={onExportHtml}>Export</button>
      </div>
    </div>
  );
};
