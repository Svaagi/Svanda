export const formatSongCount = (count: number): string =>
  `${count.toLocaleString('en-US')}+`;

// Maps section IDs to their stack index in App.tsx's SECTIONS array.
// scrollY for section i = i * window.innerHeight (each slide occupies exactly 100vh of scroll).
const SECTION_INDEX: Record<string, number> = {
  hero:          0,
  product:       1,
  'how-it-works': 2,
  gallery:       3,
  'social-proof': 4,
  'why-venues':  5,
  showcase:      6,
  contact:       7,
};

export const scrollToSection = (sectionId: string): void => {
  const index = SECTION_INDEX[sectionId] ?? 0;
  window.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
};
