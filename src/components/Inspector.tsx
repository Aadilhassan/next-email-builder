import React from 'react';
import { EmailNode } from '../types';

type Props = {
  node?: EmailNode;
  onChange: (patch: Record<string, unknown>) => void;
};

export const Inspector: React.FC<Props> = ({ node, onChange }) => {
  if (!node) return <div className="neb" style={{ color: 'var(--subtle)' }}>Select a node to edit.</div>;
  const props = (node.props ?? {}) as any;
  const isText = node.type === 'text';
  const isButton = node.type === 'button';
  const isImage = node.type === 'image';
  const isSection = node.type === 'section';
  const isColumn = node.type === 'column';

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <label className="field">
        <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{label}</span>
        {children}
      </label>
    );
  }

  return (
    <div className="neb neb-inspector">
      <div className="body" style={{ display: 'grid', gap: 10 }}>
        <div className="bgroup" style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{node.type.toUpperCase()} block</div>

          {isText && (
            <>
              <Field label="Content">
                <input className="neb-input" value={props.content ?? ''} onChange={(e) => onChange({ content: e.target.value })} />
              </Field>
              <div className="row">
                <Field label="Color">
                  <input className="neb-input" value={props.color ?? '#111111'} onChange={(e) => onChange({ color: e.target.value })} />
                </Field>
                <Field label="Align">
                  <select className="neb-select" value={props.align ?? 'left'} onChange={(e) => onChange({ align: e.target.value })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
              </div>
              <div className="row">
                <Field label="Font size">
                  <input className="neb-input" value={props.fontSize ?? '14px'} onChange={(e) => onChange({ fontSize: e.target.value })} />
                </Field>
                <Field label="Line height">
                  <input className="neb-input" value={props.lineHeight ?? '1.5'} onChange={(e) => onChange({ lineHeight: e.target.value })} />
                </Field>
              </div>
            </>
          )}

          {isButton && (
            <>
              <Field label="Label">
                <input className="neb-input" value={props.label ?? 'Click me'} onChange={(e) => onChange({ label: e.target.value })} />
              </Field>
              <Field label="Href">
                <input className="neb-input" value={props.href ?? '#'} onChange={(e) => onChange({ href: e.target.value })} />
              </Field>
              <div className="row">
                <Field label="Background">
                  <input className="neb-input" value={props.backgroundColor ?? '#0f172a'} onChange={(e) => onChange({ backgroundColor: e.target.value })} />
                </Field>
                <Field label="Text color">
                  <input className="neb-input" value={props.color ?? '#ffffff'} onChange={(e) => onChange({ color: e.target.value })} />
                </Field>
              </div>
              <div className="row">
                <Field label="Padding">
                  <input className="neb-input" value={props.padding ?? '12px 16px'} onChange={(e) => onChange({ padding: e.target.value })} />
                </Field>
                <Field label="Radius">
                  <input className="neb-input" value={props.borderRadius ?? '4px'} onChange={(e) => onChange({ borderRadius: e.target.value })} />
                </Field>
              </div>
            </>
          )}

          {isImage && (
            <>
              <Field label="Src">
                <input className="neb-input" value={props.src ?? ''} onChange={(e) => onChange({ src: e.target.value })} />
              </Field>
              <div className="row">
                <Field label="Alt">
                  <input className="neb-input" value={props.alt ?? ''} onChange={(e) => onChange({ alt: e.target.value })} />
                </Field>
                <Field label="Width">
                  <input className="neb-input" value={props.width ?? '600'} onChange={(e) => onChange({ width: e.target.value })} />
                </Field>
              </div>
            </>
          )}

          {isSection && (
            <>
              <Field label="Background">
                <input className="neb-input" value={props.backgroundColor ?? '#ffffff'} onChange={(e) => onChange({ backgroundColor: e.target.value })} />
              </Field>
              <Field label="Padding">
                <input className="neb-input" value={props.padding ?? '24px 24px'} onChange={(e) => onChange({ padding: e.target.value })} />
              </Field>
            </>
          )}

          {isColumn && (
            <>
              <Field label="Width">
                <input className="neb-input" value={props.width ?? '100%'} onChange={(e) => onChange({ width: e.target.value })} />
              </Field>
              <Field label="Padding">
                <input className="neb-input" value={props.padding ?? '0px'} onChange={(e) => onChange({ padding: e.target.value })} />
              </Field>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
