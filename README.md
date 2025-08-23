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

## AI chat (OpenAI quick start)

The package ships with a simple OpenAI adapter. It only needs your API key, model name, and an optional base URL.

```tsx
import { Editor, createOpenAIAdapter } from 'next-email-builder';

const adapter = createOpenAIAdapter({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  model: 'gpt-4o-mini',          // pick your model
  baseURL: 'https://api.openai.com/v1', // optional
});

export default function Page() {
  return <Editor chatAdapter={adapter} />;
}
```

- Ask the AI to “create a marketing email…” → it returns a complete template via a `replace` action.
- Ask to “change the headline to …” → it returns an `update`.
- Say “hi” or “who are you?” → it responds conversationally without changing your design.

Playground env vars (Vite): set these to enable AI in the example app

- `VITE_OPENAI_API_KEY`
- `VITE_OPENAI_MODEL` (default: `gpt-4o-mini`)
- `VITE_OPENAI_BASE_URL` (optional)

## Action schema (what the AI returns)

The AI returns an array of actions to apply to the email tree. Supported actions:

```ts
type AssistantAction =
  | { type: 'insert'; parentId: string; index?: number; node: EmailNode }
  | { type: 'update'; id: string; props: Partial<BlockProps> }
  | { type: 'remove'; id: string }
  | { type: 'select'; id?: string }
  | { type: 'replace'; root: EmailNode } // swap the whole template
```

Valid block types: `section`, `column`, `text`, `image`, `button`, `spacer`.

The adapter auto-generates missing `id`s for new nodes and tolerates minor JSON formatting issues from models.

## Export HTML

Use the toolbar buttons (Copy HTML / Export) or call the renderer directly:

```ts
import { renderToHtml } from 'next-email-builder';

const html = renderToHtml(root);
```

## API surface

Exports

- `Editor`
- `createOpenAIAdapter({ apiKey, model, baseURL? })`
- Core factories: `createSection`, `createColumn`, `createText`, `createImage`, `createButton`, `createSpacer`
- `renderToHtml(root)`
- Types: `EmailNode`, `AssistantAction`, `ChatAdapter`

## Notes

- The editor is headless-friendly: you can provide your own `ChatAdapter` that calls any LLM/backend as long as it returns the actions described above. The adapter may also return an optional `{ summary, reply }` to show in chat UI.

## License

ISC
