// Copies text with the async Clipboard API. False when there is none (insecure origin, old
// browser) or the browser refuses, so the caller can offer the text to copy by hand.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
