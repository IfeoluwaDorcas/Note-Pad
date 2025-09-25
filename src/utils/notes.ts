import type { Note, SortBy, SortDir, ViewMode } from '@/src/types/note';

export function filterNotes(data: Note[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return data;
  return data.filter(n => {
    const t = n.title?.toLowerCase() ?? '';
    const sub = (n.subtitle ?? '').toLowerCase();
    return t.includes(q) || sub.includes(q);
  });
}

export function sortNotes(data: Note[], by: SortBy, dir: SortDir) {
  const a = [...data];
  a.sort((x, y) => {
    if (by === 'title') return x.title.localeCompare(y.title);
    const k = by === 'dateCreated' ? 'createdAt' : 'updatedAt';
    return new Date(x[k]).getTime() - new Date(y[k]).getTime();
  });
  return dir === 'asc' ? a : a.reverse();
}

export const isCompact = (v: ViewMode) =>
  v === 'gridS' || v === 'simpleList';

export function columnsFor(view: ViewMode) {
  switch (view) {
    case 'gridS': return 3;
    case 'gridM': return 2;
    case 'gridL': return 1;
    default: return 1;
  }
}

export const shouldAutoPurge = (n: Note, days=30) =>
  !!n.deletedAt && (Date.now() - new Date(n.deletedAt).getTime()) > days*24*60*60*1000;