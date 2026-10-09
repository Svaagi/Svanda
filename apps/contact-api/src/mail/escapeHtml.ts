const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);

// Escaped text with its line breaks kept, for a visitor's multi-line message.
export const escapeHtmlLines = (text: string) =>
  escapeHtml(text).replace(/\r?\n/g, '<br>');
