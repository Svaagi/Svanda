export const formatSongCount = (count: number): string =>
  `${count.toLocaleString('en-US')}+`;

export const scrollToSection = (sectionId: string): void => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
