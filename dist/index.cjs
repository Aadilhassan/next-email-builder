'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

const uid = () => Math.random().toString(36).slice(2, 10);
const createSection = (props = {}, children = []) => ({
  id: uid(),
  type: 'section',
  props: {
    backgroundColor: '#ffffff',
    padding: '24px 24px',
    align: 'left',
    ...props
  },
  children
});
const createColumn = (props = {}, children = []) => ({
  id: uid(),
  type: 'column',
  props: {
    width: '100%',
    padding: '0px',
    align: 'left',
    ...props
  },
  children
});
const createText = (props = {}) => ({
  id: uid(),
  type: 'text',
  props: {
    content: 'Write something…',
    align: 'left',
    color: '#111111',
    fontSize: '14px',
    lineHeight: '1.5',
    ...props
  }
});
const createImage = (props = {}) => ({
  id: uid(),
  type: 'image',
  props: {
    src: 'https://via.placeholder.com/600x200',
    alt: 'Image',
    width: '600',
    ...props
  }
});
const createButton = (props = {}) => ({
  id: uid(),
  type: 'button',
  props: {
    label: 'Click me',
    href: '#',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: '4px',
    ...props
  }
});
const createSpacer = (props = {}) => ({
  id: uid(),
  type: 'spacer',
  props: {
    height: '16px',
    ...props
  }
});
function findNode(root, id) {
  if (root.id === id) return root;
  if (!root.children) return undefined;
  for (const child of root.children) {
    const res = findNode(child, id);
    if (res) return res;
  }
  return undefined;
}
function updateNode(root, id, patch) {
  if (root.id === id) {
    return {
      ...root,
      props: {
        ...root.props,
        ...patch
      }
    };
  }
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map(c => updateNode(c, id, patch))
  };
}
function insertNode(root, parentId, node, index) {
  var _a;
  if (root.id === parentId) {
    const children = [...((_a = root.children) !== null && _a !== void 0 ? _a : [])];
    const i = index === undefined ? children.length : Math.max(0, Math.min(children.length, index));
    children.splice(i, 0, node);
    return {
      ...root,
      children
    };
  }
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map(c => insertNode(c, parentId, node, index))
  };
}
function removeNode(root, id) {
  if (!root.children) return root.id === id ? root : root;
  const filtered = root.children.filter(c => c.id !== id).map(c => removeNode(c, id));
  return {
    ...root,
    children: filtered
  };
}
function moveNode(root, id, newParentId, newIndex) {
  // Extract node
  let extracted;
  function _remove(n) {
    if (!n.children) return n;
    const idx = n.children.findIndex(c => c.id === id);
    if (idx >= 0) {
      extracted = n.children[idx];
      const nextChildren = [...n.children.slice(0, idx), ...n.children.slice(idx + 1)];
      return {
        ...n,
        children: nextChildren
      };
    }
    return {
      ...n,
      children: n.children.map(_remove)
    };
  }
  const without = _remove(root);
  if (!extracted) return root;
  return insertNode(without, newParentId, extracted, newIndex);
}
function findParent(root, id, parent = null) {
  if (!root.children) return null;
  const idx = root.children.findIndex(c => c.id === id);
  if (idx >= 0) return {
    parent: root,
    index: idx
  };
  for (const child of root.children) {
    const res = findParent(child, id, root);
    if (res) return res;
  }
  return null;
}
function moveSibling(root, id, delta) {
  var _a;
  const info = findParent(root, id);
  if (!info || !info.parent) return root;
  const {
    parent,
    index
  } = info;
  const children = [...((_a = parent.children) !== null && _a !== void 0 ? _a : [])];
  const to = Math.max(0, Math.min(children.length - 1, index + delta));
  if (to === index) return root;
  const [node] = children.splice(index, 1);
  children.splice(to, 0, node);
  const replaced = {
    ...parent,
    children
  };
  // write back replaced parent into tree
  if (root.id === replaced.id) return replaced;
  function write(n) {
    if (!n.children) return n;
    if (n.id === replaced.id) return replaced;
    return {
      ...n,
      children: n.children.map(write)
    };
  }
  return write(root);
}

const esc = s => String(s !== null && s !== void 0 ? s : '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function renderToHtml(root) {
  const inner = renderNode(root);
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Email</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f6f6;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;">
            ${inner}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
function renderNode(node) {
  var _a, _b;
  switch (node.type) {
    case 'section':
      {
        const {
          backgroundColor = '#ffffff',
          padding = '24px 24px',
          align = 'left'
        } = node.props;
        const children = ((_a = node.children) !== null && _a !== void 0 ? _a : []).map(renderNode).join('');
        return `<tr><td align="${align}" style="background:${backgroundColor};padding:${esc(padding)};">${children}</td></tr>`;
      }
    case 'column':
      {
        const {
          width = '100%',
          padding = '0px',
          align = 'left'
        } = node.props;
        const children = ((_b = node.children) !== null && _b !== void 0 ? _b : []).map(renderNode).join('');
        return `<table role="presentation" width="${esc(width)}" style="width:${esc(width)};" cellpadding="0" cellspacing="0"><tr><td align="${align}" style="padding:${esc(padding)};">${children}</td></tr></table>`;
      }
    case 'text':
      {
        const {
          content = '',
          align = 'left',
          color = '#111111',
          fontSize = '14px',
          lineHeight = '1.5'
        } = node.props;
        return `<div style="text-align:${align};color:${color};font-size:${esc(fontSize)};line-height:${esc(lineHeight)};">${content}</div>`;
      }
    case 'image':
      {
        const {
          src = '',
          alt = '',
          width = '600',
          href
        } = node.props;
        const img = `<img src="${esc(src)}" alt="${esc(alt)}" width="${esc(width)}" style="display:block;border:0;outline:none;text-decoration:none;width:${esc(width)}px;max-width:100%;" />`;
        return href ? `<a href="${esc(href)}" target="_blank">${img}</a>` : img;
      }
    case 'button':
      {
        const {
          label = 'Click me',
          href = '#',
          backgroundColor = '#0f172a',
          color = '#ffffff',
          padding = '12px 16px',
          borderRadius = '4px'
        } = node.props;
        return `<a href="${esc(href)}" style="display:inline-block;background:${backgroundColor};color:${color};padding:${esc(padding)};border-radius:${esc(borderRadius)};text-decoration:none;font-weight:600;">${esc(label)}</a>`;
      }
    case 'spacer':
      {
        const {
          height = '16px'
        } = node.props;
        return `<div style="height:${esc(height)};line-height:${esc(height)};font-size:1px;">&nbsp;</div>`;
      }
    default:
      return '';
  }
}

const PlusIcon = ({
  size = 18
}) => jsxRuntime.jsx("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  children: jsxRuntime.jsx("path", {
    d: "M12 5v14M5 12h14",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  })
});
const ArrowUpIcon = ({
  size = 16
}) => jsxRuntime.jsx("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  children: jsxRuntime.jsx("path", {
    d: "M12 5l-6 6m6-6l6 6M12 5v14",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })
});
const ArrowDownIcon = ({
  size = 16
}) => jsxRuntime.jsx("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  children: jsxRuntime.jsx("path", {
    d: "M12 19l6-6m-6 6l-6-6M12 19V5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })
});
const TrashIcon = ({
  size = 15
}) => jsxRuntime.jsx("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  children: jsxRuntime.jsx("path", {
    d: "M4 7h16M9 7V4h6v3m-8 0l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })
});
const Canvas = ({
  root,
  onSelect,
  selectedId,
  onMoveUp,
  onMoveDown,
  onRemove,
  mode = 'edit',
  factories,
  onInsertAt,
  onInsertAfter
}) => {
  const [pickerFor, setPickerFor] = react.useState(undefined);
  const [hoverId, setHoverId] = react.useState(undefined);
  function BlockPicker({
    onPick
  }) {
    const items = [{
      t: 'text',
      label: 'Text',
      icon: jsxRuntime.jsx("span", {
        style: {
          fontWeight: 700
        },
        children: "T"
      })
    }, {
      t: 'button',
      label: 'Button',
      icon: jsxRuntime.jsx("span", {
        children: "\u2B1A"
      })
    }, {
      t: 'image',
      label: 'Image',
      icon: jsxRuntime.jsx("span", {
        children: "\u25A6"
      })
    }, {
      t: 'spacer',
      label: 'Spacer',
      icon: jsxRuntime.jsx("span", {
        children: "\u2014"
      })
    }, {
      t: 'column',
      label: 'Column',
      icon: jsxRuntime.jsx("span", {
        children: "\u25A5"
      })
    }];
    return jsxRuntime.jsx("div", {
      className: "neb-picker",
      onClick: e => e.stopPropagation(),
      children: items.map(it => jsxRuntime.jsxs("button", {
        className: "neb-pick",
        onClick: () => onPick(it.t),
        children: [jsxRuntime.jsx("div", {
          className: "icon",
          children: it.icon
        }), jsxRuntime.jsx("div", {
          className: "lbl",
          children: it.label
        })]
      }, it.t))
    });
  }
  function NodeView({
    node
  }) {
    var _a, _b;
    const isSelected = mode === 'edit' && node.id === selectedId;
    const onNodeClick = e => {
      e.stopPropagation();
      if (mode === 'edit') onSelect(node.id);
    };
    // Render visual preview for each block
    let rendered = null;
    if (node.type === 'section') {
      const {
        backgroundColor = '#ffffff',
        padding = '24px 24px'
      } = node.props;
      rendered = jsxRuntime.jsx("div", {
        style: {
          background: backgroundColor,
          padding
        },
        children: (_a = node.children) === null || _a === void 0 ? void 0 : _a.map(c => jsxRuntime.jsx(NodeView, {
          node: c
        }, c.id))
      });
    } else if (node.type === 'column') {
      const {
        width = '100%',
        padding = '0px'
      } = node.props;
      rendered = jsxRuntime.jsx("div", {
        style: {
          width,
          padding
        },
        children: (_b = node.children) === null || _b === void 0 ? void 0 : _b.map(c => jsxRuntime.jsx(NodeView, {
          node: c
        }, c.id))
      });
    } else if (node.type === 'text') {
      const {
        content = '',
        align = 'left',
        color = '#111111',
        fontSize = '14px',
        lineHeight = '1.5'
      } = node.props;
      rendered = jsxRuntime.jsx("div", {
        style: {
          textAlign: align,
          color,
          fontSize,
          lineHeight
        },
        children: content
      });
    } else if (node.type === 'image') {
      const {
        src = '',
        alt = '',
        width = '600'
      } = node.props;
      rendered = jsxRuntime.jsx("img", {
        src: src,
        alt: alt,
        width: Number(width) || undefined,
        style: {
          display: 'block',
          maxWidth: '100%'
        },
        onClick: e => e.preventDefault()
      });
    } else if (node.type === 'button') {
      const {
        label = 'Click me',
        href = '#',
        backgroundColor = '#0f172a',
        color = '#ffffff',
        padding = '12px 16px',
        borderRadius = '4px'
      } = node.props;
      rendered = jsxRuntime.jsx("a", {
        href: href,
        onClick: e => e.preventDefault(),
        style: {
          display: 'inline-block',
          background: backgroundColor,
          color,
          padding,
          borderRadius,
          textDecoration: 'none',
          fontWeight: 600
        },
        children: label
      });
    } else if (node.type === 'spacer') {
      const {
        height = '16px'
      } = node.props;
      rendered = jsxRuntime.jsx("div", {
        style: {
          height,
          lineHeight: height,
          fontSize: 1
        }
      });
    }
    const showPicker = pickerFor === node.id && mode === 'edit';
    const showAdd = mode === 'edit' && (hoverId === node.id || showPicker);
    return jsxRuntime.jsxs("div", {
      onClick: onNodeClick,
      onMouseEnter: () => setHoverId(node.id),
      onMouseLeave: () => setHoverId(id => id === node.id ? undefined : id),
      className: `neb-node ${isSelected ? 'selected' : ''}`,
      children: [showAdd && jsxRuntime.jsxs("div", {
        className: "neb-add-wrap",
        onClick: e => e.stopPropagation(),
        children: [jsxRuntime.jsx("button", {
          type: "button",
          className: "neb-add-btn",
          title: "Add block",
          onClick: () => setPickerFor(p => p === node.id ? undefined : node.id),
          children: jsxRuntime.jsx(PlusIcon, {})
        }), showPicker && jsxRuntime.jsx("div", {
          className: "neb-picker-wrap",
          children: jsxRuntime.jsx(BlockPicker, {
            onPick: t => {
              if (!factories) return;
              const make = factories[t];
              const newNode = make ? make() : {
                id: Math.random().toString(36).slice(2),
                type: t,
                props: {}
              };
              if (node.type === 'section' || node.type === 'column') {
                onInsertAt === null || onInsertAt === void 0 ? void 0 : onInsertAt(node.id, newNode);
              } else {
                onInsertAfter === null || onInsertAfter === void 0 ? void 0 : onInsertAfter(node.id, newNode);
              }
              setPickerFor(undefined);
            }
          })
        })]
      }), isSelected && mode === 'edit' && jsxRuntime.jsxs("div", {
        className: "neb-side-ctrl",
        onClick: e => e.stopPropagation(),
        children: [jsxRuntime.jsx("button", {
          className: "ctrl",
          title: "Move up",
          onClick: () => onMoveUp === null || onMoveUp === void 0 ? void 0 : onMoveUp(node.id),
          children: jsxRuntime.jsx(ArrowUpIcon, {})
        }), jsxRuntime.jsx("button", {
          className: "ctrl",
          title: "Move down",
          onClick: () => onMoveDown === null || onMoveDown === void 0 ? void 0 : onMoveDown(node.id),
          children: jsxRuntime.jsx(ArrowDownIcon, {})
        }), jsxRuntime.jsx("button", {
          className: "ctrl danger",
          title: "Delete",
          onClick: () => onRemove === null || onRemove === void 0 ? void 0 : onRemove(node.id),
          children: jsxRuntime.jsx(TrashIcon, {})
        })]
      }), mode === 'edit' && jsxRuntime.jsx("div", {
        className: "label",
        children: node.type
      }), rendered]
    });
  }
  return jsxRuntime.jsx("div", {
    onClick: () => {
      setPickerFor(undefined);
      onSelect(undefined);
    },
    className: "neb-canvas-wrap",
    "aria-label": "Canvas",
    children: jsxRuntime.jsx("div", {
      className: `neb-canvas ${mode === 'preview' ? 'neb-preview' : ''}`,
      children: jsxRuntime.jsx("div", {
        className: "neb-stage",
        children: jsxRuntime.jsx(NodeView, {
          node: root
        })
      })
    })
  });
};

function Field({
  label,
  children
}) {
  return jsxRuntime.jsxs("label", {
    className: "field",
    children: [jsxRuntime.jsx("span", {
      style: {
        fontSize: 12,
        color: 'var(--subtle)'
      },
      children: label
    }), children]
  });
}
function parsePx(v, d = 0) {
  if (v == null) return d;
  const m = String(v).match(/(-?\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : d;
}
function toPx(n) {
  return `${Math.round(n)}px`;
}
function parsePadding(v) {
  const s = String(v !== null && v !== void 0 ? v : '').trim();
  if (!s) return [24, 24, 24, 24];
  const parts = s.split(/\s+/).map(p => parsePx(p, 0));
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}
const Inspector = ({
  node,
  onChange
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
  if (!node) return jsxRuntime.jsx("div", {
    className: "neb",
    style: {
      color: 'var(--subtle)'
    },
    children: "Select a node to edit."
  });
  const initial = (_a = node.props) !== null && _a !== void 0 ? _a : {};
  // Local form state to prevent focus loss while typing
  const [form, setForm] = react.useState(initial);
  react.useEffect(() => {
    setForm(initial);
  }, [node.id]);
  // Focus preservation across re-renders
  const wrapRef = react.useRef(null);
  const lastFocusRef = react.useRef(null);
  // Capture focus inside inspector to remember which field was focused
  const onFocusCapture = e => {
    var _a, _b;
    const t = e.target;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)) return;
    lastFocusRef.current = {
      name: t.name,
      selStart: (_a = t.selectionStart) !== null && _a !== void 0 ? _a : null,
      selEnd: (_b = t.selectionEnd) !== null && _b !== void 0 ? _b : null
    };
  };
  // Also update caret position while typing/clicking
  const onInputCapture = e => {
    var _a, _b;
    const t = e.target;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
      lastFocusRef.current = {
        name: t.name,
        selStart: (_a = t.selectionStart) !== null && _a !== void 0 ? _a : null,
        selEnd: (_b = t.selectionEnd) !== null && _b !== void 0 ? _b : null
      };
    }
  };
  // When local form changes (set by onChange handlers), ensure the focused element remains focused
  react.useLayoutEffect(() => {
    var _a, _b;
    const root = wrapRef.current;
    if (!root) return;
    const active = document.activeElement;
    // If focus is already inside inspector, nothing to do
    if (active && root.contains(active)) return;
    const lf = lastFocusRef.current;
    if (!lf || !lf.name) return;
    const el = root.querySelector(`[name="${CSS.escape(lf.name)}"]`);
    if (el) {
      el.focus({
        preventScroll: true
      });
      try {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          const start = (_a = lf.selStart) !== null && _a !== void 0 ? _a : el.value.length;
          const end = (_b = lf.selEnd) !== null && _b !== void 0 ? _b : start;
          el.setSelectionRange(start, end);
        }
      } catch {}
    }
  }, [form]);
  // Change helpers
  const setOnly = patch => setForm(f => ({
    ...f,
    ...patch
  }));
  const commit = patch => {
    if (patch) setOnly(patch);
    // commit the current form to parent (single render)
    onChange({
      ...form,
      ...(patch !== null && patch !== void 0 ? patch : {})
    });
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
  return jsxRuntime.jsx("div", {
    className: "neb neb-inspector",
    ref: wrapRef,
    onFocusCapture: onFocusCapture,
    onInputCapture: onInputCapture,
    children: jsxRuntime.jsx("div", {
      className: "body",
      style: {
        display: 'grid',
        gap: 10
      },
      children: jsxRuntime.jsxs("div", {
        className: "bgroup",
        style: {
          display: 'grid',
          gap: 8
        },
        children: [jsxRuntime.jsxs("div", {
          style: {
            fontWeight: 700,
            color: 'var(--text)'
          },
          children: [node.type.toUpperCase(), " block"]
        }), isText && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Content",
            children: jsxRuntime.jsx("textarea", {
              className: "neb-input",
              name: "content",
              rows: 3,
              value: (_b = props.content) !== null && _b !== void 0 ? _b : '',
              onChange: e => set({
                content: e.target.value
              }),
              onBlur: e => commit({
                content: e.target.value
              })
            })
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Color",
              children: jsxRuntime.jsx("input", {
                type: "color",
                className: "neb-color",
                name: "text_color",
                value: (_c = props.color) !== null && _c !== void 0 ? _c : '#111111',
                onChange: e => set({
                  color: e.target.value
                }),
                onBlur: e => commit({
                  color: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Align",
              children: jsxRuntime.jsxs("select", {
                className: "neb-select",
                name: "text_align",
                value: (_d = props.align) !== null && _d !== void 0 ? _d : 'left',
                onChange: e => commit({
                  align: e.target.value
                }),
                children: [jsxRuntime.jsx("option", {
                  value: "left",
                  children: "Left"
                }), jsxRuntime.jsx("option", {
                  value: "center",
                  children: "Center"
                }), jsxRuntime.jsx("option", {
                  value: "right",
                  children: "Right"
                })]
              })
            })]
          }), jsxRuntime.jsx(Field, {
            label: "Font family",
            children: jsxRuntime.jsxs("select", {
              className: "neb-select",
              name: "font_family",
              value: (_e = props.fontFamily) !== null && _e !== void 0 ? _e : 'inherit',
              onChange: e => commit({
                fontFamily: e.target.value
              }),
              children: [jsxRuntime.jsx("option", {
                value: "inherit",
                children: "Inherit"
              }), jsxRuntime.jsx("option", {
                value: "Arial, Helvetica, sans-serif",
                children: "Arial"
              }), jsxRuntime.jsx("option", {
                value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                children: "Segoe UI"
              }), jsxRuntime.jsx("option", {
                value: "Roboto, Helvetica, Arial, sans-serif",
                children: "Roboto"
              }), jsxRuntime.jsx("option", {
                value: "Georgia, 'Times New Roman', Times, serif",
                children: "Georgia"
              }), jsxRuntime.jsx("option", {
                value: "'Times New Roman', Times, serif",
                children: "Times"
              }), jsxRuntime.jsx("option", {
                value: "'Courier New', Courier, monospace",
                children: "Courier New"
              })]
            })
          }), jsxRuntime.jsx(Field, {
            label: `Font size: ${parsePx((_f = props.fontSize) !== null && _f !== void 0 ? _f : '14px', 14)}px`,
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "font_size",
              min: 10,
              max: 48,
              className: "neb-slider",
              value: parsePx((_g = props.fontSize) !== null && _g !== void 0 ? _g : '14px', 14),
              onChange: e => set({
                fontSize: toPx(Number(e.target.value))
              }),
              onPointerUp: e => commit({
                fontSize: toPx(Number(e.target.value))
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: `Line height: ${Number((_h = props.lineHeight) !== null && _h !== void 0 ? _h : 1.5).toFixed(2)}`,
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "line_height",
              min: 1,
              max: 2,
              step: 0.05,
              className: "neb-slider",
              value: Number((_j = props.lineHeight) !== null && _j !== void 0 ? _j : 1.5),
              onChange: e => set({
                lineHeight: Number(e.target.value)
              }),
              onPointerUp: e => commit({
                lineHeight: Number(e.target.value)
              })
            })
          })]
        }), isButton && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Label",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              name: "btn_label",
              value: (_k = props.label) !== null && _k !== void 0 ? _k : 'Click me',
              onChange: e => set({
                label: e.target.value
              }),
              onBlur: e => commit({
                label: e.target.value
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: "Href",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              name: "btn_href",
              value: (_l = props.href) !== null && _l !== void 0 ? _l : '#',
              onChange: e => set({
                href: e.target.value
              }),
              onBlur: e => commit({
                href: e.target.value
              })
            })
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Background",
              children: jsxRuntime.jsx("input", {
                type: "color",
                className: "neb-color",
                name: "btn_bg",
                value: (_m = props.backgroundColor) !== null && _m !== void 0 ? _m : '#0f172a',
                onChange: e => set({
                  backgroundColor: e.target.value
                }),
                onBlur: e => commit({
                  backgroundColor: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Text color",
              children: jsxRuntime.jsx("input", {
                type: "color",
                className: "neb-color",
                name: "btn_color",
                value: (_o = props.color) !== null && _o !== void 0 ? _o : '#ffffff',
                onChange: e => set({
                  color: e.target.value
                }),
                onBlur: e => commit({
                  color: e.target.value
                })
              })
            })]
          }), jsxRuntime.jsx(Field, {
            label: `Padding vertical: ${parsePx((_q = ((_p = props.padding) !== null && _p !== void 0 ? _p : '').split(' ')[0]) !== null && _q !== void 0 ? _q : '12px', 12)}px`,
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "btn_pad_v",
              min: 0,
              max: 32,
              className: "neb-slider",
              value: parsePx((_s = ((_r = props.padding) !== null && _r !== void 0 ? _r : '').split(' ')[0]) !== null && _s !== void 0 ? _s : '12px', 12),
              onChange: e => {
                var _a, _b;
                const v = Number(e.target.value);
                const parts = String((_a = props.padding) !== null && _a !== void 0 ? _a : '12px 16px').split(/\s+/);
                const h = parsePx((_b = parts[1]) !== null && _b !== void 0 ? _b : parts[0], 16);
                set({
                  padding: `${toPx(v)} ${toPx(h)}`
                });
              },
              onPointerUp: e => {
                var _a, _b;
                const v = Number(e.target.value);
                const parts = String((_a = props.padding) !== null && _a !== void 0 ? _a : '12px 16px').split(/\s+/);
                const h = parsePx((_b = parts[1]) !== null && _b !== void 0 ? _b : parts[0], 16);
                commit({
                  padding: `${toPx(v)} ${toPx(h)}`
                });
              }
            })
          }), jsxRuntime.jsx(Field, {
            label: `Padding horizontal: ${parsePx((_u = ((_t = props.padding) !== null && _t !== void 0 ? _t : '').split(' ')[1]) !== null && _u !== void 0 ? _u : '16px', 16)}px`,
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "btn_pad_h",
              min: 0,
              max: 64,
              className: "neb-slider",
              value: parsePx((_w = ((_v = props.padding) !== null && _v !== void 0 ? _v : '').split(' ')[1]) !== null && _w !== void 0 ? _w : '16px', 16),
              onChange: e => {
                var _a;
                const h = Number(e.target.value);
                const parts = String((_a = props.padding) !== null && _a !== void 0 ? _a : '12px 16px').split(/\s+/);
                const v = parsePx(parts[0], 12);
                set({
                  padding: `${toPx(v)} ${toPx(h)}`
                });
              },
              onPointerUp: e => {
                var _a;
                const h = Number(e.target.value);
                const parts = String((_a = props.padding) !== null && _a !== void 0 ? _a : '12px 16px').split(/\s+/);
                const v = parsePx(parts[0], 12);
                commit({
                  padding: `${toPx(v)} ${toPx(h)}`
                });
              }
            })
          }), jsxRuntime.jsx(Field, {
            label: `Radius: ${parsePx((_x = props.borderRadius) !== null && _x !== void 0 ? _x : '4px', 4)}px`,
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "btn_radius",
              min: 0,
              max: 32,
              className: "neb-slider",
              value: parsePx((_y = props.borderRadius) !== null && _y !== void 0 ? _y : '4px', 4),
              onChange: e => set({
                borderRadius: toPx(Number(e.target.value))
              }),
              onPointerUp: e => commit({
                borderRadius: toPx(Number(e.target.value))
              })
            })
          })]
        }), isImage && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Src",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              name: "img_src",
              value: (_z = props.src) !== null && _z !== void 0 ? _z : '',
              onChange: e => set({
                src: e.target.value
              }),
              onBlur: e => commit({
                src: e.target.value
              })
            })
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Alt",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                name: "img_alt",
                value: (_0 = props.alt) !== null && _0 !== void 0 ? _0 : '',
                onChange: e => set({
                  alt: e.target.value
                }),
                onBlur: e => commit({
                  alt: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Width",
              children: jsxRuntime.jsx("input", {
                type: "range",
                name: "img_width",
                min: 50,
                max: 800,
                className: "neb-slider",
                value: parsePx((_1 = props.width) !== null && _1 !== void 0 ? _1 : '600', 600),
                onChange: e => set({
                  width: String(Number(e.target.value))
                }),
                onPointerUp: e => commit({
                  width: String(Number(e.target.value))
                })
              })
            })]
          })]
        }), isSection && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Background",
            children: jsxRuntime.jsx("input", {
              type: "color",
              className: "neb-color",
              name: "section_bg",
              value: (_2 = props.backgroundColor) !== null && _2 !== void 0 ? _2 : '#ffffff',
              onChange: e => set({
                backgroundColor: e.target.value
              }),
              onBlur: e => commit({
                backgroundColor: e.target.value
              })
            })
          }), (() => {
            var _a;
            const [pt, pr, pb, pl] = parsePadding((_a = props.padding) !== null && _a !== void 0 ? _a : '24px 24px');
            return jsxRuntime.jsxs(jsxRuntime.Fragment, {
              children: [jsxRuntime.jsx(Field, {
                label: `Padding top: ${pt}px`,
                children: jsxRuntime.jsx("input", {
                  type: "range",
                  name: "section_pad_t",
                  min: 0,
                  max: 64,
                  className: "neb-slider",
                  value: pt,
                  onChange: e => set({
                    padding: `${toPx(Number(e.target.value))} ${toPx(pr)} ${toPx(pb)} ${toPx(pl)}`
                  }),
                  onPointerUp: e => commit({
                    padding: `${toPx(Number(e.target.value))} ${toPx(pr)} ${toPx(pb)} ${toPx(pl)}`
                  })
                })
              }), jsxRuntime.jsx(Field, {
                label: `Padding right: ${pr}px`,
                children: jsxRuntime.jsx("input", {
                  type: "range",
                  name: "section_pad_r",
                  min: 0,
                  max: 64,
                  className: "neb-slider",
                  value: pr,
                  onChange: e => set({
                    padding: `${toPx(pt)} ${toPx(Number(e.target.value))} ${toPx(pb)} ${toPx(pl)}`
                  }),
                  onPointerUp: e => commit({
                    padding: `${toPx(pt)} ${toPx(Number(e.target.value))} ${toPx(pb)} ${toPx(pl)}`
                  })
                })
              }), jsxRuntime.jsx(Field, {
                label: `Padding bottom: ${pb}px`,
                children: jsxRuntime.jsx("input", {
                  type: "range",
                  name: "section_pad_b",
                  min: 0,
                  max: 64,
                  className: "neb-slider",
                  value: pb,
                  onChange: e => set({
                    padding: `${toPx(pt)} ${toPx(pr)} ${toPx(Number(e.target.value))} ${toPx(pl)}`
                  }),
                  onPointerUp: e => commit({
                    padding: `${toPx(pt)} ${toPx(pr)} ${toPx(Number(e.target.value))} ${toPx(pl)}`
                  })
                })
              }), jsxRuntime.jsx(Field, {
                label: `Padding left: ${pl}px`,
                children: jsxRuntime.jsx("input", {
                  type: "range",
                  name: "section_pad_l",
                  min: 0,
                  max: 64,
                  className: "neb-slider",
                  value: pl,
                  onChange: e => set({
                    padding: `${toPx(pt)} ${toPx(pr)} ${toPx(pb)} ${toPx(Number(e.target.value))}`
                  }),
                  onPointerUp: e => commit({
                    padding: `${toPx(pt)} ${toPx(pr)} ${toPx(pb)} ${toPx(Number(e.target.value))}`
                  })
                })
              })]
            });
          })(), jsxRuntime.jsx(Field, {
            label: `Border radius: ${parsePx((_3 = props.borderRadius) !== null && _3 !== void 0 ? _3 : '0px', 0)}px`,
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "section_radius",
              min: 0,
              max: 32,
              className: "neb-slider",
              value: parsePx((_4 = props.borderRadius) !== null && _4 !== void 0 ? _4 : '0px', 0),
              onChange: e => set({
                borderRadius: toPx(Number(e.target.value))
              }),
              onPointerUp: e => commit({
                borderRadius: toPx(Number(e.target.value))
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: "Border color",
            children: jsxRuntime.jsx("input", {
              type: "color",
              className: "neb-color",
              name: "section_border",
              value: (_5 = props.borderColor) !== null && _5 !== void 0 ? _5 : '#000000',
              onChange: e => set({
                borderColor: e.target.value
              }),
              onBlur: e => commit({
                borderColor: e.target.value
              })
            })
          })]
        }), isColumn && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Width",
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "col_width",
              min: 10,
              max: 100,
              className: "neb-slider",
              value: parsePx((_6 = props.width) !== null && _6 !== void 0 ? _6 : '100%', 100),
              onChange: e => set({
                width: `${Number(e.target.value)}%`
              }),
              onPointerUp: e => commit({
                width: `${Number(e.target.value)}%`
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: "Padding",
            children: jsxRuntime.jsx("input", {
              type: "range",
              name: "col_padding",
              min: 0,
              max: 48,
              className: "neb-slider",
              value: parsePx((_7 = props.padding) !== null && _7 !== void 0 ? _7 : '0px', 0),
              onChange: e => set({
                padding: toPx(Number(e.target.value))
              }),
              onPointerUp: e => commit({
                padding: toPx(Number(e.target.value))
              })
            })
          })]
        }), isSpacer && jsxRuntime.jsx(Field, {
          label: `Height: ${parsePx((_8 = props.height) !== null && _8 !== void 0 ? _8 : '16px', 16)}px`,
          children: jsxRuntime.jsx("input", {
            type: "range",
            name: "spacer_height",
            min: 4,
            max: 64,
            className: "neb-slider",
            value: parsePx((_9 = props.height) !== null && _9 !== void 0 ? _9 : '16px', 16),
            onChange: e => set({
              height: toPx(Number(e.target.value))
            }),
            onPointerUp: e => commit({
              height: toPx(Number(e.target.value))
            })
          })
        })]
      })
    })
  });
};

const ChatPanel = ({
  root,
  onActions,
  adapter
}) => {
  const [input, setInput] = react.useState('');
  const [busy, setBusy] = react.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true);
    try {
      const actions = await adapter.send({
        root,
        message: input.trim()
      });
      onActions(actions);
      setInput('');
    } finally {
      setBusy(false);
    }
  }
  return jsxRuntime.jsxs("form", {
    onSubmit: onSubmit,
    style: {
      display: 'flex',
      gap: 8
    },
    children: [jsxRuntime.jsx("input", {
      placeholder: "Ask AI to update your email\u2026",
      value: input,
      onChange: e => setInput(e.target.value),
      disabled: busy,
      style: {
        flex: 1,
        padding: 8,
        border: '1px solid #cbd5e1',
        borderRadius: 8
      }
    }), jsxRuntime.jsx("button", {
      disabled: busy,
      style: {
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid #0ea5e9',
        background: '#0ea5e9',
        color: '#fff'
      },
      children: busy ? 'Thinking…' : 'Send'
    })]
  });
};

const PencilIcon = ({
  size = 16
}) => jsxRuntime.jsxs("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  children: [jsxRuntime.jsx("path", {
    d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  }), jsxRuntime.jsx("path", {
    d: "M14.06 6.19l3.75 3.75 1.65-1.65a1.5 1.5 0 000-2.12l-1.53-1.53a1.5 1.5 0 00-2.12 0l-1.65 1.65z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  })]
});
const EyeIcon = ({
  size = 16
}) => jsxRuntime.jsxs("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  children: [jsxRuntime.jsx("path", {
    d: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  }), jsxRuntime.jsx("circle", {
    cx: "12",
    cy: "12",
    r: "3",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  })]
});
const PhoneIcon = ({
  size = 16
}) => jsxRuntime.jsxs("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  children: [jsxRuntime.jsx("rect", {
    x: "8",
    y: "3",
    width: "8",
    height: "18",
    rx: "2",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  }), jsxRuntime.jsx("circle", {
    cx: "12",
    cy: "18",
    r: "1",
    fill: "currentColor"
  })]
});
const TabletIcon = ({
  size = 16
}) => jsxRuntime.jsxs("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  children: [jsxRuntime.jsx("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  }), jsxRuntime.jsx("circle", {
    cx: "12",
    cy: "16.5",
    r: "0.8",
    fill: "currentColor"
  })]
});
const DesktopIcon = ({
  size = 16
}) => jsxRuntime.jsxs("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  children: [jsxRuntime.jsx("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "12",
    rx: "2",
    stroke: "currentColor",
    strokeWidth: "1.5",
    fill: "none"
  }), jsxRuntime.jsx("path", {
    d: "M9 20h6",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }), jsxRuntime.jsx("path", {
    d: "M10 16v4M14 16v4",
    stroke: "currentColor",
    strokeWidth: "1.5"
  })]
});
const Toolbar = ({
  mode,
  onSetMode,
  onCopyHtml,
  onExportHtml,
  onPreviewWidth,
  onUndo,
  onRedo,
  activeWidth
}) => {
  const isActiveWidth = w => activeWidth === w;
  return jsxRuntime.jsxs("div", {
    className: "neb neb-toolbar",
    children: [jsxRuntime.jsxs("div", {
      className: "group",
      children: [jsxRuntime.jsx("button", {
        className: "neb-btn ghost",
        title: "Undo",
        onClick: onUndo,
        children: "\u21B6"
      }), jsxRuntime.jsx("button", {
        className: "neb-btn ghost",
        title: "Redo",
        onClick: onRedo,
        children: "\u21B7"
      })]
    }), jsxRuntime.jsxs("div", {
      className: "group",
      children: [jsxRuntime.jsx("span", {
        style: {
          color: 'var(--subtle)',
          fontSize: 12
        },
        children: "Mode"
      }), jsxRuntime.jsxs("div", {
        className: "neb-seg",
        role: "group",
        "aria-label": "Mode",
        children: [jsxRuntime.jsx("button", {
          type: "button",
          className: `seg-btn ${mode === 'edit' ? 'active' : ''}`,
          onClick: () => onSetMode('edit'),
          "aria-pressed": mode === 'edit',
          title: "Edit",
          children: jsxRuntime.jsx(PencilIcon, {})
        }), jsxRuntime.jsx("button", {
          type: "button",
          className: `seg-btn ${mode === 'preview' ? 'active' : ''}`,
          onClick: () => onSetMode('preview'),
          "aria-pressed": mode === 'preview',
          title: "Preview",
          children: jsxRuntime.jsx(EyeIcon, {})
        })]
      })]
    }), jsxRuntime.jsxs("div", {
      className: "group",
      children: [jsxRuntime.jsx("span", {
        style: {
          color: 'var(--subtle)',
          fontSize: 12
        },
        children: "Preview"
      }), jsxRuntime.jsxs("div", {
        className: "neb-seg",
        role: "group",
        "aria-label": "Preview width",
        children: [jsxRuntime.jsx("button", {
          type: "button",
          className: `seg-btn ${(isActiveWidth === null || isActiveWidth === void 0 ? void 0 : isActiveWidth(360)) ? 'active' : ''}`,
          onClick: () => onPreviewWidth(360),
          "aria-pressed": isActiveWidth === null || isActiveWidth === void 0 ? void 0 : isActiveWidth(360),
          title: "Mobile",
          children: jsxRuntime.jsx(PhoneIcon, {})
        }), jsxRuntime.jsx("button", {
          type: "button",
          className: `seg-btn ${(isActiveWidth === null || isActiveWidth === void 0 ? void 0 : isActiveWidth(600)) ? 'active' : ''}`,
          onClick: () => onPreviewWidth(600),
          "aria-pressed": isActiveWidth === null || isActiveWidth === void 0 ? void 0 : isActiveWidth(600),
          title: "Default",
          children: jsxRuntime.jsx(TabletIcon, {})
        }), jsxRuntime.jsx("button", {
          type: "button",
          className: `seg-btn ${(isActiveWidth === null || isActiveWidth === void 0 ? void 0 : isActiveWidth(800)) ? 'active' : ''}`,
          onClick: () => onPreviewWidth(800),
          "aria-pressed": isActiveWidth === null || isActiveWidth === void 0 ? void 0 : isActiveWidth(800),
          title: "Desktop",
          children: jsxRuntime.jsx(DesktopIcon, {})
        })]
      })]
    }), jsxRuntime.jsxs("div", {
      className: "group",
      children: [jsxRuntime.jsx("button", {
        className: "neb-btn",
        onClick: onCopyHtml,
        children: "Copy HTML"
      }), jsxRuntime.jsx("button", {
        className: "neb-btn primary",
        onClick: onExportHtml,
        children: "Export"
      })]
    })]
  });
};

const Editor = ({
  initial,
  chatAdapter,
  onChange
}) => {
  const [root, setRoot] = react.useState(() => initial !== null && initial !== void 0 ? initial : createSection({}, [createColumn({}, [createText({
    content: 'Hello'
  }), createSpacer(), createButton()])]));
  const [selectedId, setSelectedId] = react.useState(root.id);
  const [mode, setMode] = react.useState('edit');
  const [undoStack, setUndoStack] = react.useState([]);
  const [redoStack, setRedoStack] = react.useState([]);
  const selected = react.useMemo(() => selectedId ? findNode(root, selectedId) : undefined, [root, selectedId]);
  function emit(next, pushHistory = true) {
    if (pushHistory) {
      setUndoStack(s => [...s, root]);
      setRedoStack([]);
    }
    setRoot(next);
    onChange === null || onChange === void 0 ? void 0 : onChange(next);
  }
  function undo() {
    setUndoStack(s => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setRedoStack(r => [...r, root]);
      setRoot(prev);
      onChange === null || onChange === void 0 ? void 0 : onChange(prev);
      return s.slice(0, -1);
    });
  }
  function redo() {
    setRedoStack(r => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setUndoStack(s => [...s, root]);
      setRoot(next);
      onChange === null || onChange === void 0 ? void 0 : onChange(next);
      return r.slice(0, -1);
    });
  }
  function insertAfter(targetId, node) {
    // Find parent and index of target, then insert at index+1
    // Reuse findNode to walk for parent since we have utilities in core for reordering
    function walk(n, p) {
      if (!n.children) return undefined;
      const idx = n.children.findIndex(c => c.id === targetId);
      if (idx >= 0) return {
        parent: n,
        index: idx
      };
      for (const c of n.children) {
        const r = walk(c);
        if (r) return r;
      }
      return undefined;
    }
    const info = walk(root);
    if ((info === null || info === void 0 ? void 0 : info.parent) && info.index !== undefined) {
      emit(insertNode(root, info.parent.id, node, info.index + 1));
    } else {
      // If not found as a sibling, append to root
      emit(insertNode(root, root.id, node));
    }
  }
  function applyActions(actions) {
    let current = root;
    for (const a of actions) {
      switch (a.type) {
        case 'insert':
          current = insertNode(current, a.parentId, a.node, a.index);
          break;
        case 'update':
          current = updateNode(current, a.id, a.props);
          break;
        case 'remove':
          current = removeNode(current, a.id);
          break;
        case 'select':
          setSelectedId(a.id);
          break;
      }
    }
    emit(current);
  }
  const factories = {
    text: () => createText(),
    image: () => createImage(),
    button: () => createButton(),
    spacer: () => createSpacer(),
    column: () => createColumn(),
    section: () => createSection()
  };
  const adapter = chatAdapter !== null && chatAdapter !== void 0 ? chatAdapter : {
    async send({
      message
    }) {
      // naive local adapter: parse a very simple command
      if (/add text/i.test(message)) {
        return [{
          type: 'insert',
          parentId: selectedId !== null && selectedId !== void 0 ? selectedId : root.id,
          node: createText({
            content: 'New text'
          })
        }];
      }
      if (/add button/i.test(message)) {
        return [{
          type: 'insert',
          parentId: selectedId !== null && selectedId !== void 0 ? selectedId : root.id,
          node: createButton({
            label: 'Buy now'
          })
        }];
      }
      if (/remove/i.test(message) && selectedId) {
        return [{
          type: 'remove',
          id: selectedId
        }];
      }
      if (/title:\s*(.+)/i.test(message)) {
        const m = message.match(/title:\s*(.+)/i);
        return [{
          type: 'update',
          id: selectedId !== null && selectedId !== void 0 ? selectedId : root.id,
          props: {
            content: m[1]
          }
        }];
      }
      return [];
    }
  };
  const [stageWidth, setStageWidth] = react.useState(600);
  const html = react.useMemo(() => renderToHtml(root), [root]);
  // Templates removed; left panel hosts Chat instead
  return jsxRuntime.jsxs("div", {
    className: "neb neb-reset neb-app",
    style: {
      ['--stage-width']: `${stageWidth}px`
    },
    children: [jsxRuntime.jsx(Toolbar, {
      mode: mode,
      onSetMode: setMode,
      onCopyHtml: () => {
        var _a;
        return (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(html);
      },
      onExportHtml: () => {
        const blob = new Blob([html], {
          type: 'text/html;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      onPreviewWidth: w => setStageWidth(w),
      activeWidth: stageWidth,
      onUndo: undo,
      onRedo: redo
    }), jsxRuntime.jsxs("div", {
      className: "neb-shell",
      style: {
        gridTemplateColumns: '320px 1fr 340px'
      },
      children: [jsxRuntime.jsxs("div", {
        className: "neb-panel",
        children: [jsxRuntime.jsxs("div", {
          className: "header",
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [jsxRuntime.jsx("div", {
            className: "neb-badges",
            children: jsxRuntime.jsx("span", {
              className: "neb-badge",
              children: "AI"
            })
          }), jsxRuntime.jsx("div", {
            className: "neb-badges",
            children: jsxRuntime.jsx("span", {
              className: "neb-badge",
              children: "Chat"
            })
          })]
        }), jsxRuntime.jsx("div", {
          className: "body",
          children: chatAdapter !== null && jsxRuntime.jsx(ChatPanel, {
            root: root,
            onActions: applyActions,
            adapter: adapter
          })
        })]
      }), jsxRuntime.jsxs("div", {
        className: "neb-panel",
        children: [jsxRuntime.jsxs("div", {
          className: "header",
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [jsxRuntime.jsxs("div", {
            className: "neb-badges",
            children: [jsxRuntime.jsxs("span", {
              className: "neb-badge",
              children: ["Width ", stageWidth, "px"]
            }), jsxRuntime.jsx("span", {
              className: "neb-badge",
              children: mode === 'edit' ? 'Edit' : 'Preview'
            })]
          }), jsxRuntime.jsx("div", {
            className: "neb-badges",
            children: jsxRuntime.jsx("span", {
              className: "neb-badge",
              children: "Blocks"
            })
          })]
        }), jsxRuntime.jsx("div", {
          className: "body",
          style: {
            display: 'grid'
          },
          children: jsxRuntime.jsx(Canvas, {
            root: root,
            onSelect: setSelectedId,
            selectedId: selectedId,
            onMoveUp: id => emit(moveSibling(root, id, -1)),
            onMoveDown: id => emit(moveSibling(root, id, 1)),
            onRemove: id => emit(removeNode(root, id)),
            mode: mode,
            factories: factories,
            onInsertAt: (parentId, node, index) => emit(insertNode(root, parentId, node, index)),
            onInsertAfter: (id, n) => insertAfter(id, n)
          })
        })]
      }), jsxRuntime.jsxs("div", {
        className: "neb-panel neb-inspector",
        children: [jsxRuntime.jsx("div", {
          className: "header",
          children: "Inspect"
        }), jsxRuntime.jsx("div", {
          className: "body",
          children: jsxRuntime.jsx(Inspector, {
            node: selected,
            onChange: patch => selected && emit(updateNode(root, selected.id, patch))
          })
        })]
      })]
    })]
  });
};

const Sidebar = ({
  templates,
  onApply
}) => {
  return jsxRuntime.jsxs("div", {
    className: "neb neb-panel neb-sidebar",
    children: [jsxRuntime.jsx("div", {
      className: "header",
      children: "Templates"
    }), jsxRuntime.jsx("div", {
      className: "body",
      children: templates.map(t => jsxRuntime.jsx("div", {
        className: "template",
        onClick: () => onApply(t.make()),
        children: t.name
      }, t.id))
    })]
  });
};

exports.Editor = Editor;
exports.Sidebar = Sidebar;
exports.Toolbar = Toolbar;
exports.createButton = createButton;
exports.createColumn = createColumn;
exports.createImage = createImage;
exports.createSection = createSection;
exports.createSpacer = createSpacer;
exports.createText = createText;
exports.findNode = findNode;
exports.findParent = findParent;
exports.insertNode = insertNode;
exports.moveNode = moveNode;
exports.moveSibling = moveSibling;
exports.removeNode = removeNode;
exports.renderToHtml = renderToHtml;
exports.uid = uid;
exports.updateNode = updateNode;
//# sourceMappingURL=index.cjs.map
