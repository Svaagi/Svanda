// Runs blocking in <head> before first paint so the stored or system theme applies with no
// flash: a stored choice wins, otherwise the system preference. The key and attribute must
// match src/constants/theme.ts (themeInitScript.spec.ts checks this).
(function () {
  let theme = null;
  try {
    theme = window.localStorage.getItem('svanda-theme');
  } catch {
    theme = null;
  }
  if (theme !== 'light' && theme !== 'dark') {
    const prefersLight =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    theme = prefersLight ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
