import { EmailNode, SectionProps, TextProps, ImageProps, ButtonProps, SpacerProps, ColumnProps } from './types';
export declare const uid: () => string;
export declare const createSection: (props?: Partial<SectionProps>, children?: EmailNode[]) => EmailNode<SectionProps>;
export declare const createColumn: (props?: Partial<ColumnProps>, children?: EmailNode[]) => EmailNode<ColumnProps>;
export declare const createText: (props?: Partial<TextProps>) => EmailNode<TextProps>;
export declare const createImage: (props?: Partial<ImageProps>) => EmailNode<ImageProps>;
export declare const createButton: (props?: Partial<ButtonProps>) => EmailNode<ButtonProps>;
export declare const createSpacer: (props?: Partial<SpacerProps>) => EmailNode<SpacerProps>;
export declare function findNode(root: EmailNode, id: string): EmailNode | undefined;
export declare function updateNode(root: EmailNode, id: string, patch: Partial<EmailNode['props']>): EmailNode;
export declare function insertNode(root: EmailNode, parentId: string, node: EmailNode, index?: number): EmailNode;
export declare function removeNode(root: EmailNode, id: string): EmailNode;
export declare function moveNode(root: EmailNode, id: string, newParentId: string, newIndex: number): EmailNode;
export declare function findParent(root: EmailNode, id: string, parent?: EmailNode | null): {
    parent: EmailNode | null;
    index: number;
} | null;
export declare function moveSibling(root: EmailNode, id: string, delta: number): EmailNode;
//# sourceMappingURL=core.d.ts.map