import { useState } from 'react';

import { formatHex, parseHexInput } from './hexInput';

// The text of a hex field bound to a stored colour. The field keeps what is typed until it
// is committed; a change of the colour from anywhere else (picker, swatch, reset, import)
// replaces the draft.
export function useHexDraft(
  value: string,
  onValueChange: (value: string) => void,
  onInvalid: () => void,
) {
  const [draft, setDraft] = useState(() => formatHex(value));
  const [shownValue, setShownValue] = useState(value);

  if (value !== shownValue) {
    setShownValue(value);
    setDraft(formatHex(value));
  }

  const commitDraft = () => {
    const color = parseHexInput(draft);
    if (color === null) {
      setDraft(formatHex(value));
      onInvalid();
      return;
    }
    setDraft(formatHex(color));
    if (color !== value) onValueChange(color);
  };

  return { draft, setDraft, commitDraft };
}
