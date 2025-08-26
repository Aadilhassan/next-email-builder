import React from 'react';
import { AssistantAction, EmailNode } from '../types';
export interface ChatAdapter {
    send: (ctx: {
        root: EmailNode;
        message: string;
    }) => Promise<AssistantAction[] | {
        actions: AssistantAction[];
        summary?: string;
        reply?: string;
    }>;
}
type Props = {
    root: EmailNode;
    onActions: (actions: AssistantAction[]) => void;
    adapter: ChatAdapter;
};
export declare const ChatPanel: React.FC<Props>;
export {};
//# sourceMappingURL=ChatPanel.d.ts.map