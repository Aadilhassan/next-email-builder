import React from 'react';
import { EmailNode } from '../types';
type Props = {
    root: EmailNode;
    onSelect: (id?: string) => void;
    selectedId?: string;
    onMoveUp?: (id: string) => void;
    onMoveDown?: (id: string) => void;
    onRemove?: (id: string) => void;
    mode?: 'edit' | 'preview';
};
export declare const Canvas: React.FC<Props>;
export {};
//# sourceMappingURL=Canvas.d.ts.map