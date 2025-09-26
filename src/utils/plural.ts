// src/utils/plural.ts
const IRREGULAR: Record<string, string> = {
  note: 'notes',
  reminder: 'reminders',
  list: 'lists',
  pin: 'pins',
};

function normalize(noun: string) {
  const base = noun.trim();
  const key = base.toLowerCase();
  return { base, key };
}

export function pluralize(noun: string, count: number, explicitPlural?: string): string {
  const { base, key } = normalize(noun);

  if (count === 1 || count === 0) return base;

  if (explicitPlural) return explicitPlural;
  if (IRREGULAR[key]) return IRREGULAR[key];

  if (/[^s]s$/i.test(base) || /\w-\w+s$/i.test(base)) return base;

  if (/\b[^aeiou]y$/i.test(base)) return base.replace(/y$/i, 'ies');
  if (/(s|x|z|ch|sh)$/i.test(base)) return base + 'es';
  return base + 's';
}

export function countLabel(count: number, noun: string, explicitPlural?: string): string {
  return `${count} ${pluralize(noun, count, explicitPlural)}`;
}
