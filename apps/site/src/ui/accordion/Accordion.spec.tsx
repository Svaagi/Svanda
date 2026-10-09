import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from './Accordion';

const ITEMS = [
  { value: 'background', title: 'Background', content: <p>Colours</p> },
  { value: 'effects', title: 'Effects', content: <p>Motion</p> },
];

function ControlledAccordion() {
  const [openItems, setOpenItems] = useState(['background']);

  return (
    <Accordion items={ITEMS} value={openItems} onValueChange={setOpenItems} />
  );
}

const trigger = (value: string) =>
  screen.getByTestId(`accordion-${value}-trigger`);

describe('Accordion', () => {
  it('renders every item as a heading with a disclosure button', () => {
    render(<ControlledAccordion />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Background' }),
    ).toBeInTheDocument();
    expect(trigger('background')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('effects')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Colours')).toBeVisible();
    expect(screen.queryByText('Motion')).not.toBeInTheDocument();
  });

  it('opens several items at once and closes them again', () => {
    render(<ControlledAccordion />);

    fireEvent.click(trigger('effects'));
    expect(trigger('effects')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('background')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger('background'));
    expect(trigger('background')).toHaveAttribute('aria-expanded', 'false');
  });

  it('reports the open items and moves focus between triggers by arrow key', () => {
    const handleChange = vi.fn();
    render(<Accordion items={ITEMS} value={[]} onValueChange={handleChange} />);

    fireEvent.click(trigger('effects'));
    expect(handleChange).toHaveBeenCalledWith(['effects']);

    trigger('background').focus();
    fireEvent.keyDown(trigger('background'), { key: 'ArrowDown' });
    expect(trigger('effects')).toHaveFocus();
  });
});
