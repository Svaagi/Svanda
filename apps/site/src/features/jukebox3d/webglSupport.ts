// Probes for WebGL on a throwaway canvas. The probe context is released at once, so it never
// counts against the browser's live context limit.
export function isWebGLAvailable(ownerDocument: Document): boolean {
  try {
    const canvas = ownerDocument.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl') ?? null;
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
