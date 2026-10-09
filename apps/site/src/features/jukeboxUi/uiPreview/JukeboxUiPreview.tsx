import type {
  JukeboxConfig,
  JukeboxSection,
  JukeboxUiDesign,
} from '@svanda/shared';
import { useMemo, useRef } from 'react';
import { childTestId } from 'utils';

import { GlassJukeboxUi } from '../glass';
import {
  type DesignUiConfig,
  LavaLamp,
  useDesignLamp,
  useLavaLamps,
} from '../lavaLamp';
import { PixelJukeboxUi } from '../pixel';

export type JukeboxUiPreviewProps = {
  design: JukeboxUiDesign;
  section: JukeboxSection;
  config: JukeboxConfig;
  isPaymentOpen?: boolean;
  // Stops the lava lamp (the preview is hidden).
  isPaused?: boolean;
  testId?: string;
};

const designUiOf = (
  config: JukeboxConfig,
  design: JukeboxUiDesign,
  section: JukeboxSection,
): DesignUiConfig =>
  design === 'pixel'
    ? { design, config: config.pixel[section] }
    : { design, config: config.glass[section] };

// One app design live over its lava lamp, showing whatever configuration it is given.
export function JukeboxUiPreview({
  design,
  section,
  config,
  isPaymentOpen = false,
  isPaused = false,
  testId = 'jukebox-ui-preview',
}: JukeboxUiPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lamp = useDesignLamp(designUiOf(config, design, section));
  const lamps = useMemo(() => [lamp], [lamp]);
  useLavaLamps(rootRef, lamps, isPaused);
  const background = (
    <LavaLamp
      settings={lamp.settings}
      canvasRef={lamp.canvasRef}
      isPaused={isPaused}
      testId={childTestId(testId, 'lava')}
    />
  );
  const uiTestId = childTestId(testId, design);

  return (
    <div ref={rootRef} data-testid={testId}>
      {design === 'pixel' ? (
        <PixelJukeboxUi
          section={section}
          config={config.pixel[section]}
          isPaymentOpen={isPaymentOpen}
          background={background}
          testId={uiTestId}
        />
      ) : (
        <GlassJukeboxUi
          section={section}
          config={config.glass[section]}
          isPaymentOpen={isPaymentOpen}
          background={background}
          testId={uiTestId}
        />
      )}
    </div>
  );
}
