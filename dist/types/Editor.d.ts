import React from 'react';
import { ChatAdapter } from './chat/ChatPanel';
import { EmailNode } from './types';
export type EditorProps = {
    initial?: EmailNode;
    chatAdapter?: ChatAdapter;
    onChange?: (root: EmailNode) => void;
};
export declare const Editor: React.FC<EditorProps>;
export default Editor;
//# sourceMappingURL=Editor.d.ts.map