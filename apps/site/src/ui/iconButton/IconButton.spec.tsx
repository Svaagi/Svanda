import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('is named by its label, not by its icon', () => {
    render(
      <IconButton label="Dark mode">
        <svg aria-hidden="true" />
      </IconButton>,
    );
    const button = screen.getByTestId('icon-button');

    expect(button).toHaveAccessibleName('Dark mode');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards clicks and other button attributes', () => {
    const handleClick = vi.fn();
    render(
      <IconButton
        label="Menu"
        aria-expanded={false}
        onClick={handleClick}
        testId="menu-toggle"
      >
        <span aria-hidden="true">+</span>
      </IconButton>,
    );
    const button = screen.getByTestId('menu-toggle');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
