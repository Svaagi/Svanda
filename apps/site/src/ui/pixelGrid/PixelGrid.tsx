import { groupCellsByColor, type PixelLayout } from 'lib/pixel';
import { type CSSProperties, useMemo } from 'react';
import { VisuallyHidden } from 'ui/visuallyHidden';

import styles from './pixelGrid.module.css';

export interface PixelGridProps {
  layout: PixelLayout;
  testId?: string;
  // Text equivalent for screen readers; without it the grid is decorative.
  label?: string;
}

export function PixelGrid({
  layout,
  testId = 'pixel-grid',
  label,
}: PixelGridProps) {
  const { cells, width, height } = layout;
  const colorGroups = useMemo(() => groupCellsByColor(cells), [cells]);

  return (
    <span
      className={styles.pixelGrid}
      aria-hidden={label ? undefined : true}
      data-testid={testId}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
        focusable="false"
      >
        {colorGroups.map(([color, groupCells]) => (
          <g
            key={color}
            className={styles.cells}
            style={{ '--pixel-fill': color } as CSSProperties}
          >
            {groupCells.map(({ left, top, size }) => (
              <rect
                key={`${left}:${top}`}
                x={left}
                y={top}
                width={size}
                height={size}
              />
            ))}
          </g>
        ))}
      </svg>
      {label && <VisuallyHidden>{label}</VisuallyHidden>}
    </span>
  );
}
