export const formatSongCount = (count: number): string =>
  `${count.toLocaleString('en-US')}+`;

export const scrollToSection = (sectionId: string): void => {
  if (sectionId === 'hero') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(sectionId);
  if (!el) return;
  const nav = document.querySelector('nav');
  const navHeight = nav ? nav.getBoundingClientRect().height : 0;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
};
