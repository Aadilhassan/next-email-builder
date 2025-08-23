// Core types for the email builder

export type BlockType =
  | 'section'
  | 'column'
  | 'text'
  | 'image'
  | 'button'
  | 'spacer';

export type NodeId = string;

export type AnyProps = Record<string, unknown>;

export type SectionProps = {
  backgroundColor?: string;
  padding?: string; // e.g. "20px 16px"
  align?: 'left' | 'center' | 'right';
};

export type ColumnProps = {
  width?: string; // e.g. "100%" or "50%"
  padding?: string;
  align?: 'left' | 'center' | 'right';
};

export type TextProps = {
  content?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: string; // e.g. "14px"
  lineHeight?: string; // e.g. "1.4"
};

export type ImageProps = {
  src?: string;
  alt?: string;
  width?: string; // e.g. "600" (pixels as string to simplify)
  href?: string; // link
};

export type ButtonProps = {
  label?: string;
  href?: string;
  backgroundColor?: string;
  color?: string;
  padding?: string;
  borderRadius?: string;
};

export type SpacerProps = {
  height?: string; // e.g. "16px"
};

export type BlockProps =
  | SectionProps
  | ColumnProps
  | TextProps
  | ImageProps
  | ButtonProps
  | SpacerProps
  | AnyProps;

export interface EmailNode<T extends BlockProps = BlockProps> {
  id: NodeId;
  type: BlockType;
  props: T;
  children?: EmailNode[];
}

export interface EditorState {
  root: EmailNode<SectionProps>;
  selectedId?: NodeId;
}

export type AssistantAction =
  | { type: 'insert'; parentId: NodeId; index?: number; node: EmailNode }
  | { type: 'update'; id: NodeId; props: Partial<BlockProps> }
  | { type: 'remove'; id: NodeId }
  | { type: 'select'; id?: NodeId }
  | { type: 'replace'; root: EmailNode };
