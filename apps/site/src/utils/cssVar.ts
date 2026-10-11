// Resolved value of a custom property, for canvas code that needs real colours from tokens.
export function readCssVar(element: Element, name: string): string {
  return window.getComputedStyle(element).getPropertyValue(name).trim();
}

const VAR_REFERENCE_PATTERN = /^var\(\s*(--[\w-]+)\s*\)$/;

// A configured CSS colour as canvas code can use it: a `var(--token)` reference is read
// from `element`, anything else (a hex from the configurator) is returned as it is.
export function resolveCssValue(element: Element, value: string): string {
  const name = VAR_REFERENCE_PATTERN.exec(value.trim())?.[1];
  return name ? readCssVar(element, name) : value.trim();
}
