# next-email-builder

Modern drag-and-drop email/newsletter builder for React/Next.js with an optional AI chat interface.

- Visual canvas with palette and inspector
- HTML renderer for export
- Pluggable ChatAdapter for AI suggestions/actions

## Quick start

Install as a library in a Next.js app (peer deps React/Next required).

```tsx
import { Editor } from 'next-email-builder';

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <Editor />
    </div>
  );
}
```

Copy the rendered HTML via the "Copy HTML" button.

## AI integration

Provide a ChatAdapter that returns a list of actions based on a message and current tree.

```ts
import type { ChatAdapter, EmailNode } from 'next-email-builder';

const myAdapter: ChatAdapter = {
  async send({ root, message }) {
    // call your AI backend
    return [
      { type: 'insert', parentId: root.id, node: { id: 'x', type: 'text', props: { content: 'From AI' } } },
    ];
  },
};
```

```tsx
<Editor chatAdapter={myAdapter} />
```

## Exports

- Editor
- Core factories: createSection, createColumn, createText, createImage, createButton, createSpacer
- renderToHtml(root)
- Types: EmailNode, AssistantAction, ChatAdapter

## License

ISC