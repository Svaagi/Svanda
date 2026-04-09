import {
  BENEFITS_BLOB_COLORS,
  CONTACT_BLOB_COLORS,
  HERO_BLOB_COLORS,
  INTRO_BLOB_COLORS,
  LEMON_BLOB_COLORS,
  MODES_BLOB_COLORS,
} from 'constants/blobColors';
import {
  BENEFITS_BLOB_COLORS_BRIGHT,
  CONTACT_BLOB_COLORS_BRIGHT,
  HERO_BLOB_COLORS_BRIGHT,
  INTRO_BLOB_COLORS_BRIGHT,
  LEMON_BLOB_COLORS_BRIGHT,
  MODES_BLOB_COLORS_BRIGHT,
} from 'constants/blobColorsBright';
import {
  BENEFITS_BLOB_COLORS_GLOSSY,
  CONTACT_BLOB_COLORS_GLOSSY,
  HERO_BLOB_COLORS_GLOSSY,
  INTRO_BLOB_COLORS_GLOSSY,
  LEMON_BLOB_COLORS_GLOSSY,
  MODES_BLOB_COLORS_GLOSSY,
} from 'constants/blobColorsGlossy';
import { useBlobPalette } from 'context/BlobColorContext';

export const useBlobColors = () => {
  const { palette } = useBlobPalette();

  if (palette === 'bright') {
    return {
      hero: HERO_BLOB_COLORS_BRIGHT,
      intro: INTRO_BLOB_COLORS_BRIGHT,
      modes: MODES_BLOB_COLORS_BRIGHT,
      benefits: BENEFITS_BLOB_COLORS_BRIGHT,
      lemon: LEMON_BLOB_COLORS_BRIGHT,
      contact: CONTACT_BLOB_COLORS_BRIGHT,
    };
  }

  if (palette === 'glossy') {
    return {
      hero: HERO_BLOB_COLORS_GLOSSY,
      intro: INTRO_BLOB_COLORS_GLOSSY,
      modes: MODES_BLOB_COLORS_GLOSSY,
      benefits: BENEFITS_BLOB_COLORS_GLOSSY,
      lemon: LEMON_BLOB_COLORS_GLOSSY,
      contact: CONTACT_BLOB_COLORS_GLOSSY,
    };
  }

  return {
    hero: HERO_BLOB_COLORS,
    intro: INTRO_BLOB_COLORS,
    modes: MODES_BLOB_COLORS,
    benefits: BENEFITS_BLOB_COLORS,
    lemon: LEMON_BLOB_COLORS,
    contact: CONTACT_BLOB_COLORS,
  };
};
