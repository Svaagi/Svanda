export function childTestId(parentTestId: string, suffix: string): string {
  return `${parentTestId}-${suffix}`;
}
