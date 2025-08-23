import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';

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
  selectedId
}) => {
  function NodeView({
    node
  }) {
    var _a;
    const isSelected = node.id === selectedId;
    return jsxs("div", {
      onClick: e => {
        e.stopPropagation();
        onSelect(node.id);
      },
      style: {
        border: isSelected ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
        margin: 6,
        padding: 6,
        borderRadius: 6,
        background: node.type === 'section' ? '#fff' : 'transparent'
      },
      children: [jsx("div", {
        style: {
          fontSize: 12,
          color: '#64748b',
          marginBottom: 4
        },
        children: node.type
      }), (_a = node.children) === null || _a === void 0 ? void 0 : _a.map(c => jsx(NodeView, {
        node: c
      }, c.id))]
    });
  }
  return jsx("div", {
    onClick: () => onSelect(undefined),
    style: {
      background: '#f1f5f9',
      padding: 12,
      borderRadius: 8,
      minHeight: 300
    },
    "aria-label": "Canvas",
    children: jsx(NodeView, {
      node: root
    })
  });
};

const Palette = ({
  onInsert,
  factories
}) => {
  return jsx("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    },
    children: Object.entries(factories).map(([key, make]) => jsxs("button", {
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
  var _a;
  if (!node) return jsx("div", {
    style: {
      color: '#64748b'
    },
    children: "Select a node to edit."
  });
  const entries = Object.entries((_a = node.props) !== null && _a !== void 0 ? _a : {});
  return jsxs("div", {
    style: {
      display: 'grid',
      gap: 8
    },
    children: [jsxs("div", {
      style: {
        fontWeight: 600
      },
      children: [node.type, " props"]
    }), entries.map(([k, v]) => jsxs("label", {
      style: {
        display: 'grid',
        gap: 4
      },
      children: [jsx("span", {
        style: {
          fontSize: 12,
          color: '#475569'
        },
        children: k
      }), jsx("input", {
        value: String(v !== null && v !== void 0 ? v : ''),
        onChange: e => onChange({
          [k]: e.target.value
        }),
        style: {
          padding: 6,
          border: '1px solid #cbd5e1',
          borderRadius: 6
        }
      })]
    }, k))]
  });
};

const ChatPanel = ({
  root,
  onActions,
  adapter
}) => {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
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
  return jsxs("form", {
    onSubmit: onSubmit,
    style: {
      display: 'flex',
      gap: 8
    },
    children: [jsx("input", {
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
    }), jsx("button", {
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

const Editor = ({
  initial,
  chatAdapter,
  onChange
}) => {
  const [root, setRoot] = useState(() => initial !== null && initial !== void 0 ? initial : createSection({}, [createColumn({}, [createText({
    content: 'Hello'
  }), createSpacer(), createButton()])]));
  const [selectedId, setSelectedId] = useState(root.id);
  const selected = useMemo(() => selectedId ? findNode(root, selectedId) : undefined, [root, selectedId]);
  function emit(next) {
    setRoot(next);
    onChange === null || onChange === void 0 ? void 0 : onChange(next);
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
  const html = useMemo(() => renderToHtml(root), [root]);
  return jsxs("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr 320px',
      gap: 12,
      alignItems: 'start'
    },
    children: [jsxs("div", {
      style: {
        display: 'grid',
        gap: 12
      },
      children: [jsx("div", {
        style: {
          fontWeight: 700
        },
        children: "Palette"
      }), jsx(Palette, {
        onInsert: add,
        factories: factories
      }), chatAdapter !== null && jsxs("div", {
        style: {
          display: 'grid',
          gap: 8
        },
        children: [jsx("div", {
          style: {
            fontWeight: 700
          },
          children: "AI"
        }), jsx(ChatPanel, {
          root: root,
          onActions: applyActions,
          adapter: adapter
        })]
      })]
    }), jsxs("div", {
      style: {
        display: 'grid',
        gap: 12
      },
      children: [jsx("div", {
        style: {
          fontWeight: 700
        },
        children: "Canvas"
      }), jsx(Canvas, {
        root: root,
        onSelect: setSelectedId,
        selectedId: selectedId
      }), jsx("div", {
        style: {
          fontWeight: 700
        },
        children: "Preview (HTML)"
      }), jsx("iframe", {
        title: "preview",
        style: {
          width: '100%',
          height: 360,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 8
        },
        srcDoc: html
      })]
    }), jsxs("div", {
      style: {
        display: 'grid',
        gap: 12
      },
      children: [jsx("div", {
        style: {
          fontWeight: 700
        },
        children: "Inspector"
      }), jsx(Inspector, {
        node: selected,
        onChange: patch => selected && emit(updateNode(root, selected.id, patch))
      }), jsx("button", {
        onClick: () => {
          var _a;
          return (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(html);
        },
        style: {
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #cbd5e1',
          background: '#fff'
        },
        children: "Copy HTML"
      })]
    })]
  });
};

export { Editor, createButton, createColumn, createImage, createSection, createSpacer, createText, findNode, insertNode, removeNode, renderToHtml, uid, updateNode };
//# sourceMappingURL=index.mjs.map
