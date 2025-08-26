# next-email-builder

Modern, flexible email/newsletter builder for React/Next.js with an optional AI chat assistant.

[![npm version](https://badge.fury.io/js/next-email-builder.svg)](https://badge.fury.io/js/next-email-builder)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- **Visual Editor**: Canvas + inspector, preview widths, undo/redo, copy/export HTML
- **Email-Safe Renderer**: Table-based HTML output optimized for email clients
- **AI Assistant**: Create complete templates or edit incrementally via chat
- **Flexible Data**: Initialize from HTML/JSON, receive both formats on change
- **Headless Core**: Factories and immutable utilities for custom UIs
- **TypeScript**: Full type safety throughout

## Installation

```bash
npm install next-email-builder
```

Include the styles once in your app (e.g., in your root layout):

```typescript
import 'next-email-builder/dist/styles.css';
```

## Quick Start

```tsx
import { Editor } from 'next-email-builder';

export default function EmailBuilder() {
  return (
    <div style={{ padding: 24 }}>
      <Editor />
    </div>
  );
}
```

The toolbar provides Edit/Preview toggle, preview width controls, undo/redo, and HTML export functionality.

## Persistence and Data Flow

### Initialize from HTML or JSON

```tsx
import { Editor } from 'next-email-builder';

export default function PersistentEditor() {
  const initialHtml = '<!doctype html>...'; // from your database
  
  return (
    <Editor
      initialHtml={initialHtml}
      // or: initialJson={emailNode}
      onChange={(root) => saveToDatabase(root)}     // JSON tree
      onHtmlChange={(html) => cacheHtml(html)}      // rendered HTML
    />
  );
}
```

### Parse HTML manually

```typescript
import { parseHtmlToTree } from 'next-email-builder';

const emailNode = parseHtmlToTree(htmlString);
```

### Controlled mode

For full control over the editor state:

```tsx
import { useState } from 'react';
import { Editor, type EmailNode } from 'next-email-builder';

export default function ControlledEditor() {
  const [document, setDocument] = useState<EmailNode | null>(null);

  return (
    <Editor 
      value={document ?? undefined} 
      onChange={setDocument} 
      onHtmlChange={saveHtml}
    />
  );
}
```

## AI Assistant Integration

The package includes a ready-to-use OpenAI adapter for AI-powered email generation and editing.

### Setup

```tsx
import { Editor, createOpenAIAdapter } from 'next-email-builder';

const aiAdapter = createOpenAIAdapter({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  model: 'gpt-4o-mini',                    // or your preferred model
  baseURL: 'https://api.openai.com/v1',   // optional, for custom endpoints
});

export default function AIEnabledEditor() {
  return <Editor chatAdapter={aiAdapter} />;
}
```

### Usage Patterns

- **"Create a marketing email for a summer sale with hero image and CTA"** → Generates complete template
- **"Change the headline to 'Summer Spectacular'"** → Updates specific content  
- **"Add a button below the image"** → Inserts new elements
- **"Make the background blue"** → Modifies styling
- **"Hi, what can you do?"** → Conversational responses (no edits)

### Custom AI Adapters

Implement your own `ChatAdapter` for other AI services:

```typescript
import type { ChatAdapter } from 'next-email-builder';

const customAdapter: ChatAdapter = {
  async send({ root, message }) {
    const response = await yourAIService.generate(message, root);
    return {
      actions: response.actions,     // array of edit actions
      summary: response.summary,     // optional description of changes
      reply: response.reply,         // optional conversational response
    };
  }
};
```

## Data Model

### Email Structure

```typescript
type BlockType = 'section' | 'column' | 'text' | 'image' | 'button' | 'spacer';

interface EmailNode<T = BlockProps> {
  id: string;
  type: BlockType;
  props: T;
  children?: EmailNode[];
}
```

### Block Properties

| Block Type | Properties |
|------------|------------|
| `section` | `backgroundColor?`, `padding?`, `align?` |
| `column` | `width?`, `padding?`, `align?` |
| `text` | `content?`, `align?`, `color?`, `fontSize?`, `lineHeight?` |
| `image` | `src?`, `alt?`, `width?`, `href?` |
| `button` | `label?`, `href?`, `backgroundColor?`, `color?`, `padding?`, `borderRadius?` |
| `spacer` | `height?` |

### Action Schema

AI adapters and programmatic operations use these action types:

```typescript
type AssistantAction =
  | { type: 'insert'; parentId: string; index?: number; node: EmailNode }
  | { type: 'update'; id: string; props: Partial<BlockProps> }
  | { type: 'remove'; id: string }
  | { type: 'select'; id?: string }
  | { type: 'replace'; root: EmailNode };
```

## Programmatic API

### Factory Functions

Create email blocks programmatically:

```typescript
import {
  createSection,
  createColumn, 
  createText,
  createImage,
  createButton,
  createSpacer
} from 'next-email-builder';

const newsletter = createSection(
  { backgroundColor: '#f0f9ff', padding: '32px' },
  [
    createColumn({ width: '100%' }, [
      createText({ 
        content: 'Welcome!', 
        fontSize: '24px',
        color: '#1e40af' 
      }),
      createSpacer({ height: '16px' }),
      createButton({ 
        label: 'Get Started',
        backgroundColor: '#3b82f6',
        href: 'https://example.com'
      })
    ])
  ]
);
```

### Tree Operations

Immutable operations for tree manipulation:

```typescript
import {
  findNode,
  insertNode,
  updateNode,
  removeNode,
  moveNode,
  moveSibling
} from 'next-email-builder';

// Find a node by ID
const node = findNode(emailTree, 'node-id');

// Insert a new node
const updatedTree = insertNode(emailTree, 'parent-id', newNode, 0);

// Update node properties
const modifiedTree = updateNode(emailTree, 'node-id', { color: '#red' });

// Remove a node
const pruned = removeNode(emailTree, 'node-id');

// Move node to different parent
const rearranged = moveNode(emailTree, 'node-id', 'new-parent-id', 1);
```

## Rendering

### Email-Safe HTML Output

```typescript
import { renderToHtml } from 'next-email-builder';

const emailHtml = renderToHtml(emailTree);
// Returns table-based HTML optimized for email clients
```

The renderer produces:

- Table-based layouts for maximum email client compatibility
- Inline styles for consistent rendering
- Proper DOCTYPE and meta tags for email
- Responsive design within email constraints

### Custom Renderers

Build your own renderers for different output formats:

```typescript
function renderToMarkdown(node: EmailNode): string {
  switch (node.type) {
    case 'text':
      return node.props.content || '';
    case 'button':
      return `[${node.props.label}](${node.props.href})`;
    // ... handle other types
  }
}
```

## Styling and Theming

Override CSS custom properties to customize the editor appearance:

```css
:root {
  /* Color palette */
  --bg: #f5f7fb;           /* Background */
  --panel: #ffffff;        /* Panel backgrounds */
  --muted: #f1f5f9;        /* Muted backgrounds */
  --border: #e2e8f0;       /* Borders */
  --text: #0f172a;         /* Primary text */
  --subtle: #475569;       /* Secondary text */
  --accent: #2563eb;       /* Accent color */
  --accent-2: #06b6d4;     /* Secondary accent */
  --green: #16a34a;        /* Success color */
  --danger: #dc2626;       /* Error color */
  --radius: 10px;          /* Border radius */
}

/* Override for dark theme */
[data-theme="dark"] {
  --bg: #0f172a;
  --panel: #1e293b;
  --text: #f8fafc;
  /* ... other dark theme variables */
}
```

## Framework Integration

### Next.js

```typescript
// app/layout.tsx
import 'next-email-builder/dist/styles.css';

// For AI features, use NEXT_PUBLIC_ prefixed environment variables
const aiAdapter = createOpenAIAdapter({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
});
```

### Vite/React

```typescript
// main.tsx
import 'next-email-builder/dist/styles.css';

// Environment variables (no prefix needed)
const aiAdapter = createOpenAIAdapter({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
```

## API Reference

### Components

- **`Editor`** - Main editor component with all editing capabilities
- **`Toolbar`** - Standalone toolbar component (advanced usage)
- **`Sidebar`** - Legacy sidebar component

### Functions

- **`createOpenAIAdapter(config)`** - Creates OpenAI-powered chat adapter
- **`parseHtmlToTree(html)`** - Parses HTML string into EmailNode tree
- **`renderToHtml(node)`** - Renders EmailNode tree to email-safe HTML
- **Factory functions** - `createSection`, `createColumn`, `createText`, `createImage`, `createButton`, `createSpacer`
- **Tree operations** - `findNode`, `insertNode`, `updateNode`, `removeNode`, `moveNode`, `moveSibling`

### Types

- **`EmailNode`** - Core data structure for email blocks
- **`AssistantAction`** - Action types for programmatic editing
- **`ChatAdapter`** - Interface for AI chat implementations
- **`BlockProps`** - Union of all block property types

## License

ISC © [Aadil Hassan](https://github.com/Aadilhassan)
