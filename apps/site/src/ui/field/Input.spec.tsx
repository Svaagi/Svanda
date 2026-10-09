import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('passes its own attributes through outside a Field', () => {
    const handleChange = vi.fn();
    render(
      <Input
        id="search"
        aria-label="Search"
        aria-invalid
        required
        onChange={handleChange}
      />,
    );
    const input = screen.getByTestId('input');

    fireEvent.change(input, { target: { value: 'abba' } });

    expect(input).toHaveAttribute('id', 'search');
    expect(input).toHaveAccessibleName('Search');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(handleChange).toHaveBeenCalledOnce();
  });
});
