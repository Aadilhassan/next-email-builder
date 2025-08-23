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

const Canvas = ({
  root,
  onSelect,
  selectedId,
  onMoveUp,
  onMoveDown,
  onRemove,
  mode = 'edit'
}) => {
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
    return jsxRuntime.jsxs("div", {
      onClick: onNodeClick,
      className: `neb-node ${isSelected ? 'selected' : ''}`,
      children: [isSelected && jsxRuntime.jsxs("div", {
        className: "neb-pop",
        onClick: e => e.stopPropagation(),
        children: [jsxRuntime.jsx("button", {
          className: "neb-btn",
          onClick: () => onMoveUp === null || onMoveUp === void 0 ? void 0 : onMoveUp(node.id),
          title: "Move up",
          children: "\u2191"
        }), jsxRuntime.jsx("button", {
          className: "neb-btn",
          onClick: () => onMoveDown === null || onMoveDown === void 0 ? void 0 : onMoveDown(node.id),
          title: "Move down",
          children: "\u2193"
        }), jsxRuntime.jsx("button", {
          className: "neb-btn danger",
          onClick: () => onRemove === null || onRemove === void 0 ? void 0 : onRemove(node.id),
          title: "Remove",
          children: "\u2715"
        })]
      }), mode === 'edit' && jsxRuntime.jsx("div", {
        className: "label",
        children: node.type
      }), rendered]
    });
  }
  return jsxRuntime.jsx("div", {
    onClick: () => onSelect(undefined),
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

const Palette = ({
  onInsert,
  factories
}) => {
  return jsxRuntime.jsx("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    },
    children: Object.entries(factories).map(([key, make]) => jsxRuntime.jsxs("button", {
      onClick: () => onInsert(make()),
      style: {
        padding: '6px 8px',
        borderRadius: 6,
        border: '1px solid #cbd5e1',
        background: '#fff'
      },
      children: ["+ ", key]
    }, key))
  });
};

const Inspector = ({
  node,
  onChange
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
  if (!node) return jsxRuntime.jsx("div", {
    className: "neb",
    style: {
      color: 'var(--subtle)'
    },
    children: "Select a node to edit."
  });
  const props = (_a = node.props) !== null && _a !== void 0 ? _a : {};
  const isText = node.type === 'text';
  const isButton = node.type === 'button';
  const isImage = node.type === 'image';
  const isSection = node.type === 'section';
  const isColumn = node.type === 'column';
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
  return jsxRuntime.jsx("div", {
    className: "neb neb-inspector",
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
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_b = props.content) !== null && _b !== void 0 ? _b : '',
              onChange: e => onChange({
                content: e.target.value
              })
            })
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Color",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_c = props.color) !== null && _c !== void 0 ? _c : '#111111',
                onChange: e => onChange({
                  color: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Align",
              children: jsxRuntime.jsxs("select", {
                className: "neb-select",
                value: (_d = props.align) !== null && _d !== void 0 ? _d : 'left',
                onChange: e => onChange({
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
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Font size",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_e = props.fontSize) !== null && _e !== void 0 ? _e : '14px',
                onChange: e => onChange({
                  fontSize: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Line height",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_f = props.lineHeight) !== null && _f !== void 0 ? _f : '1.5',
                onChange: e => onChange({
                  lineHeight: e.target.value
                })
              })
            })]
          })]
        }), isButton && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Label",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_g = props.label) !== null && _g !== void 0 ? _g : 'Click me',
              onChange: e => onChange({
                label: e.target.value
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: "Href",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_h = props.href) !== null && _h !== void 0 ? _h : '#',
              onChange: e => onChange({
                href: e.target.value
              })
            })
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Background",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_j = props.backgroundColor) !== null && _j !== void 0 ? _j : '#0f172a',
                onChange: e => onChange({
                  backgroundColor: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Text color",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_k = props.color) !== null && _k !== void 0 ? _k : '#ffffff',
                onChange: e => onChange({
                  color: e.target.value
                })
              })
            })]
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Padding",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_l = props.padding) !== null && _l !== void 0 ? _l : '12px 16px',
                onChange: e => onChange({
                  padding: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Radius",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_m = props.borderRadius) !== null && _m !== void 0 ? _m : '4px',
                onChange: e => onChange({
                  borderRadius: e.target.value
                })
              })
            })]
          })]
        }), isImage && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Src",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_o = props.src) !== null && _o !== void 0 ? _o : '',
              onChange: e => onChange({
                src: e.target.value
              })
            })
          }), jsxRuntime.jsxs("div", {
            className: "row",
            children: [jsxRuntime.jsx(Field, {
              label: "Alt",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_p = props.alt) !== null && _p !== void 0 ? _p : '',
                onChange: e => onChange({
                  alt: e.target.value
                })
              })
            }), jsxRuntime.jsx(Field, {
              label: "Width",
              children: jsxRuntime.jsx("input", {
                className: "neb-input",
                value: (_q = props.width) !== null && _q !== void 0 ? _q : '600',
                onChange: e => onChange({
                  width: e.target.value
                })
              })
            })]
          })]
        }), isSection && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Background",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_r = props.backgroundColor) !== null && _r !== void 0 ? _r : '#ffffff',
              onChange: e => onChange({
                backgroundColor: e.target.value
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: "Padding",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_s = props.padding) !== null && _s !== void 0 ? _s : '24px 24px',
              onChange: e => onChange({
                padding: e.target.value
              })
            })
          })]
        }), isColumn && jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsx(Field, {
            label: "Width",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_t = props.width) !== null && _t !== void 0 ? _t : '100%',
              onChange: e => onChange({
                width: e.target.value
              })
            })
          }), jsxRuntime.jsx(Field, {
            label: "Padding",
            children: jsxRuntime.jsx("input", {
              className: "neb-input",
              value: (_u = props.padding) !== null && _u !== void 0 ? _u : '0px',
              onChange: e => onChange({
                padding: e.target.value
              })
            })
          })]
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

const Toolbar = ({
  mode,
  onSetMode,
  onCopyHtml,
  onExportHtml,
  onPreviewWidth,
  onUndo,
  onRedo
}) => {
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
      }), jsxRuntime.jsx("button", {
        className: "neb-btn",
        onClick: () => onSetMode('edit'),
        style: {
          outline: mode === 'edit' ? `2px solid var(--accent)` : undefined
        },
        children: "Edit"
      }), jsxRuntime.jsx("button", {
        className: "neb-btn",
        onClick: () => onSetMode('preview'),
        style: {
          outline: mode === 'preview' ? `2px solid var(--accent)` : undefined
        },
        children: "Preview"
      })]
    }), jsxRuntime.jsxs("div", {
      className: "group",
      children: [jsxRuntime.jsx("span", {
        style: {
          color: 'var(--subtle)',
          fontSize: 12
        },
        children: "Preview"
      }), jsxRuntime.jsx("button", {
        className: "neb-btn",
        onClick: () => onPreviewWidth(360),
        children: "Mobile"
      }), jsxRuntime.jsx("button", {
        className: "neb-btn",
        onClick: () => onPreviewWidth(600),
        children: "Default"
      }), jsxRuntime.jsx("button", {
        className: "neb-btn",
        onClick: () => onPreviewWidth(800),
        children: "Desktop"
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
  function add(node) {
    const parentId = selectedId !== null && selectedId !== void 0 ? selectedId : root.id;
    emit(insertNode(root, parentId, node));
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
        }), jsxRuntime.jsxs("div", {
          className: "body",
          style: {
            display: 'grid',
            gap: 12
          },
          children: [jsxRuntime.jsx(Palette, {
            onInsert: add,
            factories: factories
          }), jsxRuntime.jsx(Canvas, {
            root: root,
            onSelect: setSelectedId,
            selectedId: selectedId,
            onMoveUp: id => emit(moveSibling(root, id, -1)),
            onMoveDown: id => emit(moveSibling(root, id, 1)),
            onRemove: id => emit(removeNode(root, id)),
            mode: mode
          })]
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
