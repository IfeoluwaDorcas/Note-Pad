export function uid(): string {
  try {
    const g: any = globalThis as any;
    const c = g && g.crypto;
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID();
    }
  } catch { /* ignore */ }

  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${t}-${r}`;
}
