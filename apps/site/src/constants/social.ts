export type SocialLink = {
  id: 'instagram' | 'youtube';
  href: string;
};

// PLACEHOLDER: the real SVANDA profile URLs are not known yet. Replace before launch.
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: 'instagram', href: 'https://www.instagram.com/' },
  { id: 'youtube', href: 'https://www.youtube.com/' },
];
