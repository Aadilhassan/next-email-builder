import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EmailNode } from '../types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{label}</span>
      {children}
    </label>
  );
}

type Props = {
  node?: EmailNode;
  onChange: (patch: Record<string, unknown>) => void;
};

function parsePx(v: any, d = 0): number {
  if (v == null) return d;
  const m = String(v).match(/(-?\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : d;
}

function toPx(n: number) { return `${Math.round(n)}px`; }

function parsePadding(v: any): [number, number, number, number] {
  const s = String(v ?? '').trim();
  if (!s) return [24, 24, 24, 24];
  const parts = s.split(/\s+/).map((p) => parsePx(p, 0));
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

export const Inspector: React.FC<Props> = ({ node, onChange }) => {
  if (!node) return <div className="neb" style={{ color: 'var(--subtle)' }}>Select a node to edit.</div>;
  const initial = (node.props ?? {}) as any;

  // Local form state to prevent focus loss while typing
  const [form, setForm] = useState<any>(initial);
  useEffect(() => { setForm(initial); }, [node.id]);

  // Focus preservation across re-renders
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<{ name: string; selStart?: number | null; selEnd?: number | null } | null>(null);
  // Capture focus inside inspector to remember which field was focused
  const onFocusCapture: React.FocusEventHandler = (e) => {
    const t = e.target as HTMLElement;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)) return;
    lastFocusRef.current = {
      name: t.name,
      selStart: (t as HTMLInputElement | HTMLTextAreaElement).selectionStart ?? null,
      selEnd: (t as HTMLInputElement | HTMLTextAreaElement).selectionEnd ?? null,
    };
  };
  // Also update caret position while typing/clicking
  const onInputCapture: React.FormEventHandler = (e) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
      lastFocusRef.current = {
        name: t.name,
        selStart: t.selectionStart ?? null,
        selEnd: t.selectionEnd ?? null,
      };
    }
  };
  // When local form changes (set by onChange handlers), ensure the focused element remains focused
  useLayoutEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const active = document.activeElement as Element | null;
    // If focus is already inside inspector, nothing to do
    if (active && root.contains(active)) return;
    const lf = lastFocusRef.current;
    if (!lf || !lf.name) return;
    const el = root.querySelector(`[name="${CSS.escape(lf.name)}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (el) {
      el.focus({ preventScroll: true });
      try {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          const start = lf.selStart ?? el.value.length;
          const end = lf.selEnd ?? start;
          el.setSelectionRange(start, end);
        }
      } catch {}
    }
  }, [form]);

  // Change helpers
  const setOnly = (patch: Record<string, any>) => setForm((f: any) => ({ ...f, ...patch }));
  const commit = (patch?: Record<string, any>) => {
    if (patch) setOnly(patch);
    // commit the current form to parent (single render)
    onChange({ ...form, ...(patch ?? {}) });
  };

  const props = form;
  const isText = node.type === 'text';
  const isButton = node.type === 'button';
  const isImage = node.type === 'image';
  const isSection = node.type === 'section';
  const isColumn = node.type === 'column';
  const isSpacer = node.type === 'spacer';

  // Field moved to top-level to avoid remounts on each render

  const set = setOnly;

  return (
    <div className="neb neb-inspector" ref={wrapRef} onFocusCapture={onFocusCapture} onInputCapture={onInputCapture}>
      <div className="body" style={{ display: 'grid', gap: 10 }}>
        <div className="bgroup" style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{node.type.toUpperCase()} block</div>

          {isText && (
            <>
              <Field label="Content">
                <textarea className="neb-input" name="content" rows={3} value={props.content ?? ''}
                  onChange={(e) => set({ content: e.target.value })}
                  onBlur={(e) => commit({ content: e.target.value })}
                />
              </Field>
              <div className="row">
                <Field label="Color">
                  <input type="color" className="neb-color" name="text_color" value={props.color ?? '#111111'}
                    onChange={(e) => set({ color: e.target.value })}
                    onBlur={(e) => commit({ color: e.target.value })}
                  />
                </Field>
                <Field label="Align">
                  <select className="neb-select" name="text_align" value={props.align ?? 'left'} onChange={(e) => commit({ align: e.target.value })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
              </div>
              <Field label="Font family">
                <select className="neb-select" name="font_family" value={props.fontFamily ?? 'inherit'} onChange={(e) => commit({ fontFamily: e.target.value })}>
                  <option value="inherit">Inherit</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
                  <option value="Roboto, Helvetica, Arial, sans-serif">Roboto</option>
                  <option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
                  <option value="'Times New Roman', Times, serif">Times</option>
                  <option value="'Courier New', Courier, monospace">Courier New</option>
                </select>
              </Field>
              <Field label={`Font size: ${parsePx(props.fontSize ?? '14px', 14)}px`}>
                <input type="range" name="font_size" min={10} max={48} className="neb-slider" value={parsePx(props.fontSize ?? '14px', 14)}
                  onChange={(e) => set({ fontSize: toPx(Number(e.target.value)) })}
                  onPointerUp={(e) => commit({ fontSize: toPx(Number((e.target as HTMLInputElement).value)) })}
                />
              </Field>
              <Field label={`Line height: ${(Number(props.lineHeight ?? 1.5)).toFixed(2)}` }>
                <input type="range" name="line_height" min={1} max={2} step={0.05} className="neb-slider" value={Number(props.lineHeight ?? 1.5)}
                  onChange={(e) => set({ lineHeight: Number(e.target.value) })}
                  onPointerUp={(e) => commit({ lineHeight: Number((e.target as HTMLInputElement).value) })}
                />
              </Field>
            </>
          )}

          {isButton && (
            <>
              <Field label="Label">
                <input className="neb-input" name="btn_label" value={props.label ?? 'Click me'} onChange={(e) => set({ label: e.target.value })} onBlur={(e)=>commit({ label: e.target.value })} />
              </Field>
              <Field label="Href">
                <input className="neb-input" name="btn_href" value={props.href ?? '#'} onChange={(e) => set({ href: e.target.value })} onBlur={(e)=>commit({ href: e.target.value })} />
              </Field>
              <div className="row">
                <Field label="Background">
                  <input type="color" className="neb-color" name="btn_bg" value={props.backgroundColor ?? '#0f172a'} onChange={(e) => set({ backgroundColor: e.target.value })} onBlur={(e)=>commit({ backgroundColor: e.target.value })} />
                </Field>
                <Field label="Text color">
                  <input type="color" className="neb-color" name="btn_color" value={props.color ?? '#ffffff'} onChange={(e) => set({ color: e.target.value })} onBlur={(e)=>commit({ color: e.target.value })} />
                </Field>
              </div>
              <Field label={`Padding vertical: ${parsePx((props.padding ?? '').split(' ')[0] ?? '12px', 12)}px`}>
                <input type="range" name="btn_pad_v" min={0} max={32} className="neb-slider" value={parsePx((props.padding ?? '').split(' ')[0] ?? '12px', 12)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const parts = String(props.padding ?? '12px 16px').split(/\s+/);
                    const h = parsePx(parts[1] ?? parts[0], 16);
                    set({ padding: `${toPx(v)} ${toPx(h)}` });
                  }}
                  onPointerUp={(e)=>{
                    const v = Number((e.target as HTMLInputElement).value);
                    const parts = String(props.padding ?? '12px 16px').split(/\s+/);
                    const h = parsePx(parts[1] ?? parts[0], 16);
                    commit({ padding: `${toPx(v)} ${toPx(h)}` });
                  }} />
              </Field>
              <Field label={`Padding horizontal: ${parsePx((props.padding ?? '').split(' ')[1] ?? '16px', 16)}px`}>
                <input type="range" name="btn_pad_h" min={0} max={64} className="neb-slider" value={parsePx((props.padding ?? '').split(' ')[1] ?? '16px', 16)}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    const parts = String(props.padding ?? '12px 16px').split(/\s+/);
                    const v = parsePx(parts[0], 12);
                    set({ padding: `${toPx(v)} ${toPx(h)}` });
                  }}
                  onPointerUp={(e)=>{
                    const h = Number((e.target as HTMLInputElement).value);
                    const parts = String(props.padding ?? '12px 16px').split(/\s+/);
                    const v = parsePx(parts[0], 12);
                    commit({ padding: `${toPx(v)} ${toPx(h)}` });
                  }} />
              </Field>
              <Field label={`Radius: ${parsePx(props.borderRadius ?? '4px', 4)}px`}>
                <input type="range" name="btn_radius" min={0} max={32} className="neb-slider" value={parsePx(props.borderRadius ?? '4px', 4)} onChange={(e) => set({ borderRadius: toPx(Number(e.target.value)) })} onPointerUp={(e)=>commit({ borderRadius: toPx(Number((e.target as HTMLInputElement).value)) })} />
              </Field>
            </>
          )}

          {isImage && (
            <>
              <Field label="Src">
                <input className="neb-input" name="img_src" value={props.src ?? ''} onChange={(e) => set({ src: e.target.value })} onBlur={(e)=>commit({ src: e.target.value })} />
              </Field>
              <div className="row">
                <Field label="Alt">
                  <input className="neb-input" name="img_alt" value={props.alt ?? ''} onChange={(e) => set({ alt: e.target.value })} onBlur={(e)=>commit({ alt: e.target.value })} />
                </Field>
                <Field label="Width">
                  <input type="range" name="img_width" min={50} max={800} className="neb-slider" value={parsePx(props.width ?? '600', 600)} onChange={(e) => set({ width: String(Number(e.target.value)) })} onPointerUp={(e)=>commit({ width: String(Number((e.target as HTMLInputElement).value)) })} />
                </Field>
              </div>
            </>
          )}

          {isSection && (
            <>
              <Field label="Background">
                <input type="color" className="neb-color" name="section_bg" value={props.backgroundColor ?? '#ffffff'} onChange={(e) => set({ backgroundColor: e.target.value })} onBlur={(e)=>commit({ backgroundColor: e.target.value })} />
              </Field>
              {(() => {
                const [pt, pr, pb, pl] = parsePadding(props.padding ?? '24px 24px');
                return (
                  <>
                    <Field label={`Padding top: ${pt}px`}><input type="range" name="section_pad_t" min={0} max={64} className="neb-slider" value={pt} onChange={(e) => set({ padding: `${toPx(Number(e.target.value))} ${toPx(pr)} ${toPx(pb)} ${toPx(pl)}` })} onPointerUp={(e)=>commit({ padding: `${toPx(Number((e.target as HTMLInputElement).value))} ${toPx(pr)} ${toPx(pb)} ${toPx(pl)}` })} /></Field>
                    <Field label={`Padding right: ${pr}px`}><input type="range" name="section_pad_r" min={0} max={64} className="neb-slider" value={pr} onChange={(e) => set({ padding: `${toPx(pt)} ${toPx(Number(e.target.value))} ${toPx(pb)} ${toPx(pl)}` })} onPointerUp={(e)=>commit({ padding: `${toPx(pt)} ${toPx(Number((e.target as HTMLInputElement).value))} ${toPx(pb)} ${toPx(pl)}` })} /></Field>
                    <Field label={`Padding bottom: ${pb}px`}><input type="range" name="section_pad_b" min={0} max={64} className="neb-slider" value={pb} onChange={(e) => set({ padding: `${toPx(pt)} ${toPx(pr)} ${toPx(Number(e.target.value))} ${toPx(pl)}` })} onPointerUp={(e)=>commit({ padding: `${toPx(pt)} ${toPx(pr)} ${toPx(Number((e.target as HTMLInputElement).value))} ${toPx(pl)}` })} /></Field>
                    <Field label={`Padding left: ${pl}px`}><input type="range" name="section_pad_l" min={0} max={64} className="neb-slider" value={pl} onChange={(e) => set({ padding: `${toPx(pt)} ${toPx(pr)} ${toPx(pb)} ${toPx(Number(e.target.value))}` })} onPointerUp={(e)=>commit({ padding: `${toPx(pt)} ${toPx(pr)} ${toPx(pb)} ${toPx(Number((e.target as HTMLInputElement).value))}` })} /></Field>
                  </>
                );
              })()}
              <Field label={`Border radius: ${parsePx(props.borderRadius ?? '0px', 0)}px`}>
                <input type="range" name="section_radius" min={0} max={32} className="neb-slider" value={parsePx(props.borderRadius ?? '0px', 0)} onChange={(e) => set({ borderRadius: toPx(Number(e.target.value)) })} onPointerUp={(e)=>commit({ borderRadius: toPx(Number((e.target as HTMLInputElement).value)) })} />
              </Field>
              <Field label="Border color">
                <input type="color" className="neb-color" name="section_border" value={props.borderColor ?? '#000000'} onChange={(e) => set({ borderColor: e.target.value })} onBlur={(e)=>commit({ borderColor: e.target.value })} />
              </Field>
            </>
          )}

          {isColumn && (
            <>
              <Field label="Width">
                <input type="range" name="col_width" min={10} max={100} className="neb-slider" value={parsePx(props.width ?? '100%', 100)} onChange={(e) => set({ width: `${Number(e.target.value)}%` })} onPointerUp={(e)=>commit({ width: `${Number((e.target as HTMLInputElement).value)}%` })} />
              </Field>
              <Field label="Padding">
                <input type="range" name="col_padding" min={0} max={48} className="neb-slider" value={parsePx(props.padding ?? '0px', 0)} onChange={(e) => set({ padding: toPx(Number(e.target.value)) })} onPointerUp={(e)=>commit({ padding: toPx(Number((e.target as HTMLInputElement).value)) })} />
              </Field>
            </>
          )}

          {isSpacer && (
            <Field label={`Height: ${parsePx(props.height ?? '16px', 16)}px`}>
              <input type="range" name="spacer_height" min={4} max={64} className="neb-slider" value={parsePx(props.height ?? '16px', 16)} onChange={(e) => set({ height: toPx(Number(e.target.value)) })} onPointerUp={(e)=>commit({ height: toPx(Number((e.target as HTMLInputElement).value)) })} />
            </Field>
          )}
        </div>
      </div>
    </div>
  );
};
