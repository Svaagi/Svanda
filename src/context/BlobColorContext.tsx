import { createContext, ReactNode, useContext, useState } from 'react';

export type BlobPalette = 'subtle' | 'glossy' | 'bright';

const CYCLE: BlobPalette[] = ['subtle', 'glossy', 'bright'];

interface BlobColorContextValue {
  palette: BlobPalette;
  toggle: () => void;
  blurEnabled: boolean;
  toggleBlur: () => void;
}

const BlobColorContext = createContext<BlobColorContextValue>({
  palette: 'subtle',
  toggle: () => {},
  blurEnabled: false,
  toggleBlur: () => {},
});

export const BlobColorProvider = ({ children }: { children: ReactNode }) => {
  const [palette, setPalette] = useState<BlobPalette>('subtle');
  const [blurEnabled, setBlurEnabled] = useState(false);
  const toggle = () =>
    setPalette((prev) => CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length]);
  const toggleBlur = () => setBlurEnabled((prev) => !prev);

  return (
    <BlobColorContext.Provider value={{ palette, toggle, blurEnabled, toggleBlur }}>
      {children}
    </BlobColorContext.Provider>
  );
};

export const useBlobPalette = () => useContext(BlobColorContext);
