// Joins the class names that are set; CSS module lookups are typed as possibly undefined.
export function classNames(
  ...names: (string | false | null | undefined)[]
): string {
  return names.filter(Boolean).join(' ');
}
