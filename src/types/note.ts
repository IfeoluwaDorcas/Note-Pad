export type Note = {
  id: string;
  title: string;
  subtitle?: string;
  previewImage?: string;
  updatedAt: string;
  createdAt: string;
  deletedAt?: string; 
  pinned?: boolean;
  categoryId?: string;
  content: string;
  type: 'note' | 'reminder' | 'sticky' | 'todo';
};

export type ViewMode =
  | 'gridS'
  | 'gridM'
  | 'gridL'
  | 'simpleList';

export type SortBy = 'dateCreated' | 'dateModified' | 'title';
export type SortDir = 'asc' | 'desc';
