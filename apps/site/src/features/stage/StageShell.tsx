import { STAGE_PAGE_IDS } from 'constants/stage';
import { type ReactNode, useRef } from 'react';
import { childTestId } from 'utils';

import styles from './stageShell.module.css';
import { useStagePaging } from './useStagePaging';
import { useStagePointer } from './useStagePointer';

export type StageShellProps = {
  children: ReactNode;
  testId?: string;
};

// A five page tall track with a sticky one page viewport. The empty anchors give every page a
// scroll-snap point and a real id for deep links and nav links.
export function StageShell({
  children,
  testId = 'stage-shell',
}: StageShellProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  useStagePaging(viewportRef);
  useStagePointer(viewportRef);

  return (
    <div className={styles.stageShell} data-testid={testId}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        data-testid={childTestId(testId, 'viewport')}
      >
        {children}
      </div>
      {STAGE_PAGE_IDS.map((pageId) => (
        <div
          key={pageId}
          id={pageId}
          className={styles.anchor}
          data-testid={childTestId(testId, `anchor-${pageId}`)}
        />
      ))}
    </div>
  );
}
