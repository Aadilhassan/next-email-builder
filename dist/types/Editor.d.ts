import React from 'react';
import { ChatAdapter } from './chat/ChatPanel';
import { EmailNode } from './types';
export type EditorProps = {
    /** Provide initial tree. If omitted, a default section/column is created. */
    initial?: EmailNode;
    /** Provide raw HTML to initialize the editor. Overrides `initial` when present. */
    initialHtml?: string;
    /** Provide a JSON tree to initialize the editor (same shape as EmailNode). Overrides `initial` when present. */
    initialJson?: EmailNode;
    /** Controlled value: when provided, the editor renders this tree and becomes controlled. */
    value?: EmailNode;
    chatAdapter?: ChatAdapter;
    /** Fires on any change with the JSON tree. */
    onChange?: (root: EmailNode) => void;
    /** Fires on any change with fresh rendered HTML. */
    onHtmlChange?: (html: string) => void;
    /** Fires on any change with the JSON tree (alias for onChange, useful when passing both). */
    onJsonChange?: (root: EmailNode) => void;
};
export declare const Editor: React.FC<EditorProps>;
export default Editor;
//# sourceMappingURL=Editor.d.ts.map