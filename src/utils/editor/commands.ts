// src/utils/editor/commands.ts
export type TextMark = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string | null;
  highlight?: string | null;
  fontSize?: number | null;
};

export type ParagraphBlock = {
  type: 'paragraph';
  text: string;
  marks?: TextMark;
  align?: 'left' | 'center' | 'right' | 'justify';
};
export type BulletBlock = {
  type: 'bullet';
  items: { text: string; marks?: TextMark }[];
  align?: 'left' | 'center' | 'right' | 'justify';
};
export type CheckboxBlock = {
  type: 'checkbox';
  items: { checked: boolean; text: string; marks?: TextMark }[];
  align?: 'left' | 'center' | 'right' | 'justify';
};
export type ImageBlock = {
  type: 'image';
  uri: string;
  alt?: string;
};

export type Block = ParagraphBlock | BulletBlock | CheckboxBlock | ImageBlock;
export type PageTemplate = 'plain' | 'lined' | 'grid' | 'dotted';

export type Selection = {
  blockIndex: number;
  itemIndex?: number;
  offset?: number;
  length?: number;
};

export type NoteContentState = {
  title: string;
  blocks: Block[];
  pageTemplate: PageTemplate;
  backgroundColor: string;
  selection?: Selection;
  history: NoteContentState[];
  future: NoteContentState[];
  isEditing: boolean;
  html?: string; // selection-accurate HTML
};

// helpers
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const withHistory = (prev: NoteContentState, next: Partial<NoteContentState>): NoteContentState => {
  const snap = clone({ ...prev, history: [], future: [] });
  return { ...prev, ...next, history: [...prev.history, snap], future: [] };
};
const getActive = (s: NoteContentState) => {
  const bi = Math.min(Math.max(s.selection?.blockIndex ?? 0, 0), Math.max(s.blocks.length - 1, 0));
  const block = s.blocks[bi];
  return { bi, block };
};

// commands
export const setTitle = (s: NoteContentState, title: string) => withHistory(s, { title });
export const toggleEditing = (s: NoteContentState) => ({ ...s, isEditing: !s.isEditing });
export const setSelection = (s: NoteContentState, sel: Selection) => ({ ...s, selection: sel });
export const setPageTemplate = (s: NoteContentState, pt: PageTemplate) => withHistory(s, { pageTemplate: pt });
export const setBackgroundColor = (s: NoteContentState, hex: string) => withHistory(s, { backgroundColor: hex });

export const setAlignment = (s: NoteContentState, align: 'left'|'center'|'right'|'justify') => {
  const next = clone(s);
  const { bi } = getActive(next);
  const b = next.blocks[bi];
  if ('align' in b) (b as any).align = align;
  return withHistory(s, { blocks: next.blocks });
};

export const cycleAlignment = (s: NoteContentState) => {
  const order: Array<'left'|'center'|'right'|'justify'> = ['left','center','right','justify'];
  const { block } = getActive(s);
  const cur = (('align' in block) && (block as any).align) || 'left';
  const idx = (order.indexOf(cur as any) + 1) % order.length;
  return setAlignment(s, order[idx]);
};

// kept for non-HTML paths (toolbar no longer uses these for selection formatting)
export const setFontSize = (s: NoteContentState, size: number | null) => {
  const next = clone(s);
  const { block } = getActive(next);
  const apply = (m?: TextMark) => ({ ...(m ?? {}), fontSize: size });
  if (block.type === 'paragraph') block.marks = apply(block.marks);
  if (block.type === 'bullet') block.items = block.items.map(it => ({ ...it, marks: apply(it.marks) }));
  if (block.type === 'checkbox') block.items = block.items.map(it => ({ ...it, marks: apply(it.marks) }));
  return withHistory(s, { blocks: next.blocks });
};

export const applyMark = (s: NoteContentState, patch: Partial<TextMark>) => {
  const next = clone(s);
  const { block } = getActive(next);
  const merge = (m?: TextMark) => ({ ...(m ?? {}), ...patch });
  if (block.type === 'paragraph') block.marks = merge(block.marks);
  if (block.type === 'bullet') block.items = block.items.map(it => ({ ...it, marks: merge(it.marks) }));
  if (block.type === 'checkbox') block.items = block.items.map(it => ({ ...it, marks: merge(it.marks) }));
  return withHistory(s, { blocks: next.blocks });
};

export const setColor = (s: NoteContentState, color: string | null) => applyMark(s, { color });
export const setHighlight = (s: NoteContentState, highlight: string | null) => applyMark(s, { highlight });

export const toggleBold = (s: NoteContentState) => applyMark(s, { bold: !currentBool(s, 'bold') });
export const toggleItalic = (s: NoteContentState) => applyMark(s, { italic: !currentBool(s, 'italic') });
export const toggleUnderline = (s: NoteContentState) => applyMark(s, { underline: !currentBool(s, 'underline') });

function currentBool(s: NoteContentState, key: keyof Pick<TextMark,'bold'|'italic'|'underline'>) {
  const { block } = getActive(s);
  if (block.type === 'paragraph') return !!block.marks?.[key];
  if (block.type === 'bullet') return !!block.items[0]?.marks?.[key];
  if (block.type === 'checkbox') return !!block.items[0]?.marks?.[key];
  return false;
}

export const insertImage = (s: NoteContentState, uri: string, alt?: string) => {
  const next = clone(s);
  const { bi } = getActive(next);
  next.blocks.splice(bi + 1, 0, { type: 'image', uri, alt });
  return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi + 1 } });
};

export const toggleBulletList = (s: NoteContentState) => {
  const next = clone(s);
  const { bi, block } = getActive(next);
  if (block.type === 'paragraph') {
    next.blocks[bi] = { type: 'bullet', items: [{ text: block.text, marks: block.marks }], align: block.align };
  } else if (block.type === 'bullet') {
    const text = block.items.map(i => i.text).join('\n');
    next.blocks[bi] = { type: 'paragraph', text, marks: block.items[0]?.marks, align: block.align };
  } else if (block.type === 'checkbox') {
    next.blocks[bi] = {
      type: 'bullet',
      items: block.items.map(i => ({ text: i.text, marks: i.marks })),
      align: block.align,
    };
  }
  return withHistory(s, { blocks: next.blocks });
};

export const toggleCheckboxList = (s: NoteContentState) => {
  const next = clone(s);
  const { bi, block } = getActive(next);
  if (block.type === 'paragraph') {
    next.blocks[bi] = { type: 'checkbox', items: [{ checked: false, text: block.text, marks: block.marks }], align: block.align };
  } else if (block.type === 'checkbox') {
    const text = block.items.map(i => i.text).join('\n');
    next.blocks[bi] = { type: 'paragraph', text, marks: block.items[0]?.marks, align: block.align };
  } else if (block.type === 'bullet') {
    next.blocks[bi] = {
      type: 'checkbox',
      items: block.items.map(i => ({ checked: false, text: i.text, marks: i.marks })),
      align: block.align,
    };
  }
  return withHistory(s, { blocks: next.blocks });
};

export const editParagraphText = (s: NoteContentState, bi: number, text: string) => {
  const next = clone(s);
  const b = next.blocks[bi];
  if (b?.type === 'paragraph') {
    b.text = text;
    return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi } });
  }
  return s;
};

export const editBulletItem = (s: NoteContentState, bi: number, idx: number, text: string) => {
  const next = clone(s);
  const b = next.blocks[bi];
  if (b?.type === 'bullet') {
    b.items[idx].text = text;
    return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi, itemIndex: idx } });
  }
  return s;
};

export const editCheckboxItem = (s: NoteContentState, bi: number, idx: number, changes: Partial<{checked:boolean; text:string}>) => {
  const next = clone(s);
  const b = next.blocks[bi];
  if (b?.type === 'checkbox') {
    b.items[idx] = { ...b.items[idx], ...changes };
    return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi, itemIndex: idx } });
  }
  return s;
};

export const addListItemAfter = (s: NoteContentState) => {
  const next = clone(s);
  const { bi } = getActive(next);
  const b = next.blocks[bi];
  if (b?.type === 'bullet') {
    b.items.splice((next.selection?.itemIndex ?? b.items.length - 1) + 1, 0, { text: '', marks: b.items[0]?.marks });
    return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi, itemIndex: (next.selection?.itemIndex ?? 0) + 1 } });
  }
  if (b?.type === 'checkbox') {
    b.items.splice((next.selection?.itemIndex ?? b.items.length - 1) + 1, 0, { checked: false, text: '', marks: b.items[0]?.marks });
    return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi, itemIndex: (next.selection?.itemIndex ?? 0) + 1 } });
  }
  return s;
};

export const insertParagraphAfter = (s: NoteContentState) => {
  const next = clone(s);
  const { bi } = getActive(next);
  next.blocks.splice(bi + 1, 0, {
    type: 'paragraph',
    text: '',
    marks: (next.blocks[bi] as any)?.marks,
    align: (next.blocks[bi] as any)?.align,
  });
  return withHistory(s, { blocks: next.blocks, selection: { blockIndex: bi + 1 } });
};

export const undo = (s: NoteContentState) => {
  if (!s.history.length) return s;
  const prev = s.history[s.history.length - 1];
  const rest = s.history.slice(0, -1);
  const future = [...s.future, clone({ ...s, history: [], future: [] })];
  return { ...prev, history: rest, future };
};

export const redo = (s: NoteContentState) => {
  if (!s.future.length) return s;
  const next = s.future[s.future.length - 1];
  const future = s.future.slice(0, -1);
  const history = [...s.history, clone({ ...s, history: [], future: [] })];
  return { ...next, history, future };
};

export const alignmentIconKey = (s: NoteContentState) => {
  const { block } = getActive(s);
  const a = (('align' in block) && (block as any).align) || 'left';
  return a as 'left'|'center'|'right'|'justify';
};
