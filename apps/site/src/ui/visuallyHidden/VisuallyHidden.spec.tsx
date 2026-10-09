import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps its text available to assistive technology', () => {
    render(
      <button type="button">
        <VisuallyHidden>Open menu</VisuallyHidden>
      </button>,
    );

    expect(screen.getByRole('button')).toHaveAccessibleName('Open menu');
    expect(screen.getByTestId('visually-hidden')).not.toHaveAttribute(
      'aria-hidden',
    );
  });

  it('takes a custom test id', () => {
    render(<VisuallyHidden testId="hidden-label">Label</VisuallyHidden>);

    expect(screen.getByTestId('hidden-label')).toHaveTextContent('Label');
  });
});
