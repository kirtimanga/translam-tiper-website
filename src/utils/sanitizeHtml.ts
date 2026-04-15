export function sanitizeRichHtml(input: unknown): string {
  if (input == null) return '';
  let html = String(input);

  for (let i = 0; i < 3; i++) {
    if (!/&amp;(nbsp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/.test(html)) break;
    html = html.replace(/&amp;(nbsp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g, '&$1;');
  }

  html = html
    .replace(/\u00A0/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\uFFFD/g, '')
    .replace(/\u0000/g, '')
    .replace(/Â(?= )/g, '')
    .replace(/Â /g, ' ');

  return html;
}
