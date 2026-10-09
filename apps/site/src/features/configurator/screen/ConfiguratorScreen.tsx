import { JukeboxUiPreview } from 'features/jukeboxUi';

import { useConfiguratorStore } from '../model';

export type ConfiguratorScreenProps = {
  // Stops the lava lamp while the screen is hidden.
  isPaused: boolean;
  testId?: string;
};

// The live jukebox app the configurator edits: the chosen design and section with every
// change applied as it is made.
export function ConfiguratorScreen({
  isPaused,
  testId = 'configurator-screen',
}: ConfiguratorScreenProps) {
  const design = useConfiguratorStore((state) => state.design);
  const section = useConfiguratorStore((state) => state.section);
  const config = useConfiguratorStore((state) => state.config);
  const isPaymentOpen = useConfiguratorStore(
    (state) => state.isPaymentModalShown,
  );

  return (
    <JukeboxUiPreview
      design={design}
      section={section}
      config={config}
      isPaymentOpen={isPaymentOpen}
      isPaused={isPaused}
      testId={testId}
    />
  );
}
