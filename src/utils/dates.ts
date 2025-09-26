const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;

export const pad2 = (n: number) => n.toString().padStart(2, '0');

export const monthShort = (m1: number) => MONTHS_SHORT[Math.max(1, Math.min(12, m1)) - 1];

export const ordinal = (d: number) => {
  const j = d % 10, k = d % 100;
  if (j === 1 && k !== 11) return `${d}st`;
  if (j === 2 && k !== 12) return `${d}nd`;
  if (j === 3 && k !== 13) return `${d}rd`;
  return `${d}th`;
};

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export const daysInMonth = (y: number, m1: number) => {
  if ([1,3,5,7,8,10,12].includes(m1)) return 31;
  if ([4,6,9,11].includes(m1)) return 30;
  return isLeap(y) ? 29 : 28;
};

export const toHHmm = (h: number, m: number) => `${pad2(h)}:${pad2(m)}`;

export const toDDMMYYYY = (y: number, m1: number, d: number) => `${pad2(d)}/${pad2(m1)}/${y}`;

export const validHHMM = (s: string) => /^([01]?\d|2[0-3]):([0-5]\d)$/.test(s.trim());

export const formatShortDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatShortDateTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${formatShortDate(iso)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const formatTimeHHmm = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const friendlyDate = (y: number, m1: number, d: number) =>
  `${ordinal(d)} ${monthShort(m1)}, ${y}`;

export const addDays = (date: Date, n: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const addHours = (date: Date, n: number) => {
  const d = new Date(date);
  d.setHours(d.getHours() + n);
  return d;
};
