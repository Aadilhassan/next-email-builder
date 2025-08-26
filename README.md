# next-email-builder

Modern, flexible email/newsletter builder for React/Next.js with an AI chat interface.

Highlights

- Visual editor: canvas + inspector, preview widths, undo/redo, copy/export HTML
- Email-safe HTML renderer for export
- AI chat that can edit incrementally or create a full template in one prompt

## Install

```bash
npm i next-email-builder
```

Include the styles once (for example in your app root/layout):

```ts
import 'next-email-builder/dist/styles.css';
```

## Basic usage

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

Use the toolbar to switch Edit/Preview, set preview width, Undo/Redo, Copy HTML, and Export.

### Provide initial HTML or JSON and sync changes

You can initialize the editor from existing HTML or a stored JSON tree, and receive both JSON and HTML on every change for persistence.

```tsx
import { Editor, parseHtmlToTree } from 'next-email-builder';

export default function Page() {
  const initialHtml = "<!doctype html>..."; // e.g., from your database
  return (
    <Editor
      initialHtml={initialHtml}
      // or: initialJson={yourEmailNode}
      onChange={(root) => {
        # next-email-builder

        Modern, flexible email/newsletter builder for React/Next.js with an optional AI chat assistant. This is the documentation for the npm package (not the playground).

        ## Features

        - Visual editor: canvas + inspector, preview widths, undo/redo, copy/export HTML
        - Email-safe HTML renderer for export (table-based output)
        - AI chat that can create a full template in one prompt or edit incrementally
        - Initialize from HTML or from a JSON tree; receive both JSON and HTML on change
        - Headless-friendly core: factories and immutable utilities for your own UIs

        ## Installation

        ```bash
        npm i next-email-builder
        ```

        Include the styles once (e.g. in your app root/layout):

        ```ts
        import 'next-email-builder/dist/styles.css';
        ```

        ## Quick start

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

        The toolbar lets you switch Edit/Preview, change preview width, Undo/Redo, Copy HTML, and Export.

        ## Initialize from HTML or JSON and sync changes

        You can initialize the editor from existing HTML or a stored JSON tree and receive both shapes on every change for persistence.

        ```tsx
        import { Editor } from 'next-email-builder';

        export default function Page() {
          const initialHtml = '<!doctype html>...';
          return (
            <Editor
              initialHtml={initialHtml}
              // or: initialJson={emailNode}
              onChange={(root) => saveJson(root)}      // JSON tree for your DB
              onHtmlChange={(html) => saveHtml(html)}  // rendered HTML snapshot
            />
          );
        }
        ```

        Prefer to parse HTML yourself? Use `parseHtmlToTree(html)`.

        ```ts
        import { parseHtmlToTree } from 'next-email-builder';
        const node = parseHtmlToTree(htmlString);
        ```

        ### Controlled mode

        Provide `value` (EmailNode) to control the editor. Update your state in `onChange`.

        ```tsx
        const [doc, setDoc] = useState<EmailNode | null>(null);

        <Editor value={doc ?? undefined} onChange={setDoc} onHtmlChange={saveHtml} />
        ```

        ## AI chat (optional)

        The package includes a simple OpenAI adapter. Supply your API key (and optionally model/baseURL) and pass the adapter to `<Editor chatAdapter={...} />`.

        ```tsx
        import { Editor, createOpenAIAdapter } from 'next-email-builder';

        const adapter = createOpenAIAdapter({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
          model: 'gpt-4o-mini',                 // choose your model
          baseURL: 'https://api.openai.com/v1', // optional
        });

        export default function Page() {
          return <Editor chatAdapter={adapter} />;
        }
        ```

        What to expect:
        - “Create a marketing email …” → returns a complete template (`replace` action)
        - “Change the headline to …” → updates text (`update` action)
        - “hi / who are you?” → replies conversationally (no changes)

        You can implement your own `ChatAdapter` that calls any LLM as long as it returns the action schema below. It may also return `{ summary, reply }` to show in chat.

        ## Data model and action schema

        Email tree (simplified):

        ```ts
        type BlockType = 'section' | 'column' | 'text' | 'image' | 'button' | 'spacer';

        interface EmailNode<T = BlockProps> {
          id: string;
          type: BlockType;
          props: T;
          children?: EmailNode[];
        }

        type AssistantAction =
          | { type: 'insert'; parentId: string; index?: number; node: EmailNode }
          | { type: 'update'; id: string; props: Partial<BlockProps> }
          | { type: 'remove'; id: string }
          | { type: 'select'; id?: string }
          | { type: 'replace'; root: EmailNode };
        ```

        Common block props:

        - section: `{ backgroundColor?, padding?, align? }`
        - column: `{ width?, padding?, align? }`
        - text: `{ content?, align?, color?, fontSize?, lineHeight? }`
        - image: `{ src?, alt?, width?, href? }`
        - button: `{ label?, href?, backgroundColor?, color?, padding?, borderRadius? }`
        - spacer: `{ height? }`

        ## Programmatic utilities (headless/core)

        Factory helpers and immutable operations are exported if you want to build custom UIs:

        ```ts
        import {
          createSection, createColumn, createText, createImage, createButton, createSpacer,
          findNode, insertNode, updateNode, removeNode, moveNode, moveSibling
        } from 'next-email-builder';
        ```

        ## Rendering to email-safe HTML

        ```ts
        import { renderToHtml } from 'next-email-builder';
        const html = renderToHtml(root);
        ```

        The HTML renderer outputs table-based markup designed to be email-friendly.

        ## Theming (CSS variables)

        Override CSS variables anywhere in your app to tweak the look of the editor UI:

        ```css
        :root {
          --bg: #f5f7fb;
          --panel: #ffffff;
          --muted: #f1f5f9;
          --border: #e2e8f0;
          --text: #0f172a;
          --subtle: #475569;
          --accent: #2563eb;
          --accent-2: #06b6d4;
          --green: #16a34a;
          --danger: #dc2626;
          --radius: 10px;
        }
        ```

        ## Next.js notes

        - Import the CSS in your `app/layout.tsx` or `_app.tsx`.
        - When using environment variables for the OpenAI adapter, prefix with `NEXT_PUBLIC_` to access them on the client.

        ## Exports

        - `Editor`
        - `createOpenAIAdapter({ apiKey, model, baseURL? })`
        - `parseHtmlToTree(html)`
        - Core factories and ops: `createSection`, `createColumn`, `createText`, `createImage`, `createButton`, `createSpacer`, `findNode`, `insertNode`, `updateNode`, `removeNode`, `moveNode`, `moveSibling`
        - `renderToHtml(root)`
        - Types: `EmailNode`, `AssistantAction`, `ChatAdapter`

        ## License

        ISC
