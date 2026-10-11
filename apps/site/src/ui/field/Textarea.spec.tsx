import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a textarea with its own attributes outside a Field', () => {
    render(<Textarea aria-label="Message" rows={4} testId="message" />);
    const textarea = screen.getByTestId('message');

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(textarea).toHaveAccessibleName('Message');
  });
});
