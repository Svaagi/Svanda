import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders a non-submitting button that reacts to clicks', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Send</Button>);
    const button = screen.getByTestId('button');

    fireEvent.click(button);

    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAccessibleName('Send');
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('can submit a form', () => {
    render(<Button type="submit">Send</Button>);

    expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit');
  });

  it('is keyboard focusable and blocks clicks when disabled', () => {
    const handleClick = vi.fn();
    render(
      <>
        <Button testId="enabled">On</Button>
        <Button testId="disabled" disabled onClick={handleClick}>
          Off
        </Button>
      </>,
    );

    screen.getByTestId('enabled').focus();
    fireEvent.click(screen.getByTestId('disabled'));

    expect(screen.getByTestId('enabled')).toHaveFocus();
    expect(screen.getByTestId('disabled')).toBeDisabled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('gives each variant its own class', () => {
    render(
      <>
        <Button testId="outline">A</Button>
        <Button testId="fill" variant="fill">
          B
        </Button>
        <Button testId="ghost" variant="ghost">
          C
        </Button>
      </>,
    );
    const classOf = (testId: string) => screen.getByTestId(testId).className;

    expect(
      new Set([classOf('outline'), classOf('fill'), classOf('ghost')]),
    ).toHaveLength(3);
  });

  it('skins its child instead of rendering a button with asChild', () => {
    render(
      <Button asChild testId="cta">
        <a href="#karaoke">Explore</a>
      </Button>,
    );
    const link = screen.getByTestId('cta');

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#karaoke');
    expect(link).not.toHaveAttribute('type');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
