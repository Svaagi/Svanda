export const formatSongCount = (count: number): string =>
  `${count.toLocaleString('en-US')}+`;

export const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
