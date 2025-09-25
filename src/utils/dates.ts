export function formatNoteDate(iso: string | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0'); // 01–31
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mon = months[d.getMonth()];
  const yr = d.getFullYear();
  return `${parseInt(day, 10)} ${mon} ${yr}`;
}
