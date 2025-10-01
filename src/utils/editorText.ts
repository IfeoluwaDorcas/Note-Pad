export function htmlToPlain(html: string) {
  return (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?(div|p|br)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

export function isEffectivelyEmpty(title: string, html: string) {
  const t = (title || "").trim();
  const body = htmlToPlain(html);
  return (!t || t === "Untitled") && body.length === 0;
}
