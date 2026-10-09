// Resolved value of a custom property, for canvas code that needs real colours from tokens.
export function readCssVar(element: Element, name: string): string {
  return window.getComputedStyle(element).getPropertyValue(name).trim();
}
